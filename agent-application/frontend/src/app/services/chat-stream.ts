/*
Copyright 2026 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { inject, Injectable } from '@angular/core';
import { Observable, Subscriber } from 'rxjs';
import {
  AdkType,
  AgentContent,
  AgentMessage,
  AgentStatusUpdate,
  ChatBotRole,
  ChatResponse,
  TaskState,
  ThinkingStep,
} from '../models/chat';
import { APP_CONFIG } from '../models/tokens';

// ---------------------------------------------------------------------------
// Public StreamChunk types
// ---------------------------------------------------------------------------

export type StreamEventType = 'thinking' | 'text_delta' | 'code_block' | 'complete' | 'agent_error';

/**
 * A single event emitted by {@link ChatStreamService.streamMessage}.
 *
 * - `thinking`    – internal reasoning step; see `thinkingStep`.
 * - `text_delta`  – prose chunk of the final answer; see `delta`.
 * - `code_block`  – JSON fence extracted from the answer; see `code`.
 * - `complete`    – stream finished; see `finalMessage`.
 * - `agent_error` – server-side error with no task state; see `errorText`.
 */
export interface StreamChunk {
  eventType: StreamEventType;
  done: boolean;

  // --- 'thinking' ---
  thinkingStep?: ThinkingStep;

  // --- 'text_delta' ---
  /** The new prose characters added in this chunk. */
  delta?: string;
  /** Fully accumulated prose text so far (excludes extracted code blocks). */
  text?: string;

  // --- 'code_block' ---
  /** Raw code extracted from a fenced code block (any language tag; fences stripped). */
  code?: string;

  // --- 'complete' ---
  /** Authoritative ChatResponse built from the last TASK_STATE_SUBMITTED payload. */
  finalMessage?: ChatResponse;

  // --- 'agent_error' ---
  /** Error text from a server-side failure (no task state present). */
  errorText?: string;

  // Shared metadata (populated whenever the server provides it)
  messageId?: string;
  contextId?: string;
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

const MESSAGE_ENDPOINT = '/message' as const;
const ABORT_ERROR = 'AbortError' as const;
const UNKNOWN_TOOL = 'unknown tool' as const;
const TASK_SUBMITTED: TaskState = 'TASK_STATE_SUBMITTED';
const TASK_WORKING: TaskState = 'TASK_STATE_WORKING';
const ADK_FUNCTION_CALL: AdkType = 'function_call';
const ADK_FUNCTION_RESPONSE: AdkType = 'function_response';

/** Segment returned by splitRawCodeSegments: either prose text or detected code. */
interface Segment {
  type: 'text' | 'code';
  value: string;
}

/**
 * Fraction of lines that must match `identifier:` pattern for flat text to be
 * considered textproto. 0.5 = 50% threshold balances catching real textproto
 * while avoiding false positives on prose that happens to contain colons.
 */
const TEXTPROTO_THRESHOLD = 0.5;

/** True if the string is a raw JSON object (no fences) that can actually be parsed. */
function isRawJson(text: string): boolean {
  const t = text.trim();
  if (!t.startsWith('{') || !t.endsWith('}')) return false;
  try {
    JSON.parse(t);
    return true;
  } catch {
    return false;
  }
}

/**
 * Owns all mutable state for a single `/message` stream.
 *
 * Event routing:
 *   WORKING + thought=true   → thinking (thought)
 *   WORKING + function_call  → thinking (tool_call)
 *   WORKING + fn_response    → thinking (tool_response) + text_delta
 *   WORKING + plain text     → ignored (full text arrives in SUBMITTED)
 *   SUBMITTED (last)         → complete
 */
class StreamProcessor {
  private accumulatedAnswer = '';
  private lastSubmittedText = '';
  private lastSubmittedMessageId: string | undefined;
  private lastSubmittedContextId: string | undefined;
  private hasFunctionResponseAnswer = false;
  // Tracks code values already emitted as code_block to avoid duplicates when
  // the same JSON appears in both a function_response and the SUBMITTED payload.
  private readonly emittedCodeBlocks = new Set<string>();

  // JSON brace-depth accumulator (handles pretty-printed multi-line JSON)
  private jsonAccumulator = '';
  private braceDepth = 0;
  private inString = false;
  private escapeNext = false;

  constructor(
    private readonly subscriber: Subscriber<StreamChunk>,
    private readonly apiUrl: string
  ) {}

  async run(
    message: string,
    contextId: string | undefined,
    controller: AbortController
  ): Promise<void> {
    const response = await this.fetchStream(message, contextId, controller);
    if (!response) return;
    await this.readStream(response);
    this.emitComplete();
  }

  /**
   * Streams a message, emitting chunks of the response as they are received.
   * @param message The message to send.
   * @param contextId Optional context ID for the conversation.
   * @param controller Optional AbortController to cancel the request.
   * @returns A promise that resolves to a Response object or null if an error occurred.
   */
  private async fetchStream(
    message: string,
    contextId: string | undefined,
    controller: AbortController
  ): Promise<Response | null> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}${MESSAGE_ENDPOINT}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, contextId }),
        signal: controller.signal,
      });
    } catch (err) {
      if ((err as Error).name === ABORT_ERROR) {
        this.subscriber.complete();
      } else {
        this.subscriber.error(err);
      }
      return null;
    }

    if (!response.ok) {
      this.subscriber.error(new Error(`HTTP ${response.status} ${response.statusText}`));
      return null;
    }

    return response;
  }

  /**
   * Reads the response stream, decoding chunks of text and processing them as JSON updates.
   * @param response The fetch Response object containing the stream.
   * @returns A promise that resolves when the stream has been fully read and processed.
   */
  private async readStream(response: Response): Promise<void> {
    const reader = response.body!.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        this.feedText(decoder.decode(value, { stream: true }));
      }

      // Flush any leftover if the stream ended without a closing brace
      const leftover = this.jsonAccumulator.trim();
      if (leftover) this.processUpdate(leftover);

      this.flushSubmittedAnswer();
    } catch (err) {
      if ((err as Error).name === ABORT_ERROR) {
        this.subscriber.complete();
        return;
      }
      this.subscriber.error(err);
    }
  }

  /**
   * Feeds text into the JSON accumulator, handling string escapes and brace depth.
   * @param text The text to feed into the accumulator.
   */
  private feedText(text: string): void {
    for (const ch of text) {
      this.jsonAccumulator += ch;

      if (this.escapeNext) {
        this.escapeNext = false;
        continue;
      }
      if (ch === '\\' && this.inString) {
        this.escapeNext = true;
        continue;
      }
      if (ch === '"') {
        this.inString = !this.inString;
        continue;
      }

      if (!this.inString) {
        if (ch === '{') {
          this.braceDepth++;
        } else if (ch === '}') {
          this.braceDepth--;
          if (this.braceDepth === 0) {
            const candidate = this.jsonAccumulator.trim();
            this.jsonAccumulator = '';
            if (candidate) this.processUpdate(candidate);
          }
        }
      }
    }
  }

  /**
   * Processes a complete JSON string representing an AgentStatusUpdate.
   * @param raw The raw JSON string to process.
   * @returns void
   */
  private processUpdate(raw: string): void {
    const cleaned = raw
      .trim()
      .replace(/^[[,\s]+|[\],\s]+$/g, '')
      .trim();
    if (!cleaned) return;

    let update: AgentStatusUpdate;
    try {
      update = JSON.parse(cleaned) as AgentStatusUpdate;
    } catch (parseErr) {
      console.warn('[ChatStream] could not parse JSON — full dump:');
      console.warn(cleaned);
      console.warn('Parse error:', parseErr);
      return;
    }

    if (!update?.statusUpdate?.status) return;

    const { state, message: msg } = update.statusUpdate.status;
    const resolvedContextId = update.statusUpdate.contextId;
    const resolvedMessageId = msg?.messageId;

    // No state means the agent hit an internal error — surface the message text.
    if (!state) {
      const errorText = this.extractUserFacingText(msg) || 'Internal agent error';
      this.subscriber.next({
        eventType: 'agent_error',
        done: false,
        errorText,
        messageId: resolvedMessageId,
        contextId: resolvedContextId,
      });
      return;
    }

    if (state === TASK_SUBMITTED) {
      this.handleSubmitted(msg, resolvedMessageId, resolvedContextId);
      return;
    }

    if (state !== TASK_WORKING || !msg?.content?.length) return;

    // Process each content item individually so every item's own metadata is respected.
    for (const content of msg.content) {
      const adkType = content.metadata?.adk_type;
      if (adkType === ADK_FUNCTION_CALL) {
        this.handleFunctionCall(content, resolvedMessageId, resolvedContextId);
      } else if (adkType === ADK_FUNCTION_RESPONSE) {
        this.handleFunctionResponse(content, resolvedMessageId, resolvedContextId);
      } else if (content.text) {
        // `thought: true` is the authoritative signal from the server; fall back
        // to position-based heuristics for servers that omit the field.
        const isThought = content.metadata?.thought === true;
        this.handleWorkingText(content.text, isThought, resolvedMessageId, resolvedContextId);
      }
    }
  }

  /**
   * Extracts user-facing text from an {@link AgentMessage}, joining all content
   * items whose `metadata.thought` is not strictly `true`.
   */
  private extractUserFacingText(msg: AgentMessage | undefined): string {
    return (
      msg?.content
        ?.flatMap(c => (c.text && c.metadata?.thought !== true ? [c.text] : []))
        .join('') ?? ''
    );
  }

  /**
   * Handles a TASK_STATE_SUBMITTED update, which may be emitted multiple times during a stream
   * @param msg The AgentMessage from the update, which may contain the full text of the user's message (including any coordinator snapshots).
   * @param resolvedMessageId The resolved message ID from the update.
   * @param resolvedContextId The resolved context ID from the update.
   * @returns void
   */
  private handleSubmitted(
    msg: AgentMessage | undefined,
    resolvedMessageId: string | undefined,
    resolvedContextId: string | undefined
  ): void {
    const text = this.extractUserFacingText(msg);
    if (!text) return;

    // Always overwrite — only the last SUBMITTED is the real user-facing message;
    // earlier ones during the same stream are intermediate coordinator snapshots.
    this.lastSubmittedText = text;
    this.lastSubmittedMessageId = resolvedMessageId;
    this.lastSubmittedContextId = resolvedContextId;
  }

  /**
   * Handles a TASK_STATE_FUNCTION_CALL update, which may be emitted multiple times during a stream
   * @param content The AgentContent from the update, which may contain the function call data.
   * @param resolvedMessageId The resolved message ID from the update.
   * @param resolvedContextId The resolved context ID from the update.
   */
  private handleFunctionCall(
    content: AgentContent,
    resolvedMessageId: string | undefined,
    resolvedContextId: string | undefined
  ): void {
    // A tool call means any SUBMITTED seen so far was a coordinator snapshot,
    // not the final answer — invalidate it so we don't surface it later.
    this.lastSubmittedText = '';
    this.lastSubmittedMessageId = undefined;
    this.lastSubmittedContextId = undefined;

    const toolName = (content.data?.data as { name?: string })?.name ?? UNKNOWN_TOOL;
    this.subscriber.next({
      eventType: 'thinking',
      done: false,
      thinkingStep: {
        id: resolvedMessageId ?? crypto.randomUUID(),
        type: 'tool_call',
        text: `🔧 **Calling tool:** ${toolName}`,
      },
      messageId: resolvedMessageId,
      contextId: resolvedContextId,
    });
  }

  /**
   * Handles a TASK_STATE_FUNCTION_RESPONSE update, which may be emitted multiple times during a stream
   * @param content The AgentContent from the update, which may contain the function response data.
   * @param resolvedMessageId The resolved message ID from the update.
   * @param resolvedContextId The resolved context ID from the update.
   * @returns void
   */
  private handleFunctionResponse(
    content: AgentContent,
    resolvedMessageId: string | undefined,
    resolvedContextId: string | undefined
  ): void {
    const fnData = content.data?.data as
      | { name?: string; id?: string; response?: { result?: string } }
      | undefined;
    const toolName = fnData?.name ?? UNKNOWN_TOOL;
    const responseText = fnData?.response?.result ?? '';

    // Emit thinking step first so the UI can show it in the reasoning panel.
    this.subscriber.next({
      eventType: 'thinking',
      done: false,
      thinkingStep: {
        id: resolvedMessageId ?? crypto.randomUUID(),
        type: 'tool_response',
        text: `✅ **Tool response received:** ${toolName}`,
      },
      messageId: resolvedMessageId,
      contextId: resolvedContextId,
    });

    if (responseText) {
      this.hasFunctionResponseAnswer = true;
      if (isRawJson(responseText)) {
        // Emit the JSON directly as a code_block without routing through
        // emitTextSegments — that would prepend fences to accumulatedAnswer,
        // causing isCodeBlock(finalText) to fire in the store and extractCode
        // to return '' (because finalText doesn't also end with a fence).
        this.accumulatedAnswer += responseText;
        this.emittedCodeBlocks.add(responseText);
        this.subscriber.next({
          eventType: 'code_block',
          done: false,
          code: responseText,
          messageId: resolvedMessageId,
          contextId: resolvedContextId,
        });
      } else {
        this.emitTextSegments(responseText, resolvedMessageId, resolvedContextId);
      }
      this.lastSubmittedText = this.accumulatedAnswer;
      this.lastSubmittedMessageId = resolvedMessageId;
      this.lastSubmittedContextId = resolvedContextId;
    }
  }

  /**
   * Handles a TASK_STATE_WORKING text content item.
   *
   * @param text The text from the update.
   * @param isThought Whether `metadata.thought === true` was set by the server.
   *   When `true` the item is always surfaced as a thinking step.
   *   When `false` the method falls back to position-based heuristics for
   *   servers that do not yet send the `thought` field.
   * @param resolvedMessageId The resolved message ID from the update.
   * @param resolvedContextId The resolved context ID from the update.
   */
  private handleWorkingText(
    text: string,
    isThought: boolean,
    resolvedMessageId: string | undefined,
    resolvedContextId: string | undefined
  ): void {
    // Only surface content that the server has explicitly marked as a thought.
    // WORKING messages without thought:true are streaming fragments of the final
    // answer; the authoritative full text arrives in the SUBMITTED payload.
    if (!isThought) return;

    this.subscriber.next({
      eventType: 'thinking',
      done: false,
      thinkingStep: { id: resolvedMessageId ?? crypto.randomUUID(), type: 'thought', text },
      messageId: resolvedMessageId,
      contextId: resolvedContextId,
    });
  }

  /**
   * Emits text segments, splitting out fenced code blocks and detecting raw
   * unfenced model blobs (e.g. `model: {…}` emitted without a code fence).
   * @param text The text to emit, which may contain code blocks.
   * @param messageId The message ID associated with the text.
   * @param contextId The context ID associated with the text.
   * @returns void
   */
  private emitTextSegments(
    text: string,
    messageId: string | undefined,
    contextId: string | undefined
  ): void {
    this.accumulatedAnswer += text;
    const FENCE_RE = /(```[^\n`]*\n?[\s\S]*?```)/g;
    const parts = text.split(FENCE_RE);
    for (const part of parts) {
      const fenceMatch = part.match(/^```([^\n`]*)\n?([\s\S]*?)```$/);
      if (fenceMatch) {
        const code = fenceMatch[2].trim();
        if (this.emittedCodeBlocks.has(code)) continue;
        this.emittedCodeBlocks.add(code);
        this.subscriber.next({ eventType: 'code_block', done: false, code, messageId, contextId });
      } else {
        // Detect raw unfenced model blobs
        for (const seg of this.splitRawCodeSegments(part)) {
          if (seg.type === 'code') {
            this.subscriber.next({
              eventType: 'code_block',
              done: false,
              code: seg.value,
              messageId,
              contextId,
            });
          } else {
            this.subscriber.next({
              eventType: 'text_delta',
              done: false,
              delta: seg.value,
              text: this.accumulatedAnswer,
              messageId,
              contextId,
            });
          }
        }
      }
    }
  }

  /**
   * Finds the index of the closing brace that matches the opening brace at `start`.
   * Correctly handles nested braces and braces inside quoted strings.
   *
   * @param text The text to search.
   * @param start Index of the opening '{' character.
   * @returns Index of the matching '}', or -1 if unclosed.
   */
  private findMatchingBrace(text: string, start: number): number {
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = start; i < text.length; i++) {
      const ch = text[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escapeNext = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (ch === '{') {
          depth++;
        } else if (ch === '}') {
          depth--;
          if (depth === 0) {
            return i;
          }
        }
      }
    }

    return -1;
  }

  /**
   * Finds the next `identifier: {` pattern in text.
   *
   * @returns Object with `start` (index of identifier) and `braceStart` (index of '{'),
   *          or null if no pattern found.
   */
  private findNextCodeBlock(text: string): { start: number; braceStart: number } | null {
    const match = /\b[a-z_][a-z0-9_]*\s*:\s*\{/i.exec(text);
    if (!match) return null;
    return {
      start: match.index,
      braceStart: text.indexOf('{', match.index),
    };
  }

  /**
   * Consumes additional textproto content (brace blocks and flat key-value lines)
   * starting from the given text.
   *
   * @param text The trailing text to consume from.
   * @returns Object with accumulated `code` and remaining `trailing` text.
   */
  private consumeTextprotoTail(text: string): { code: string; trailing: string } {
    let code = '';
    let trailing = text.trim();

    while (trailing) {
      // Check for another brace block (e.g., `timeout: { seconds: 60 }`)
      const nextBlock = this.findNextCodeBlock(trailing);
      if (nextBlock && nextBlock.start === 0) {
        const endIndex = this.findMatchingBrace(trailing, nextBlock.braceStart);
        if (endIndex !== -1) {
          code += (code ? '\n' : '') + trailing.slice(0, endIndex + 1).trim();
          trailing = trailing.slice(endIndex + 1).trim();
          continue;
        }
      }

      // Check for flat key-value line (e.g., `search_mode: CONSUME_ALL_AVAILABLE_TIME`)
      const flatLine = /^[a-z_][a-z0-9_]*\s*:\s*\S[^\n]*/i.exec(trailing);
      if (flatLine) {
        code += (code ? '\n' : '') + flatLine[0].trim();
        trailing = trailing.slice(flatLine[0].length).trim();
        continue;
      }

      break;
    }

    return { code, trailing };
  }

  /**
   * Splits a plain-text segment into prose and raw-code sub-segments by
   * detecting textproto blocks (any `identifier: {…}` pattern) that the
   * agent sometimes emits without a code fence.
   *
   * Uses brace counting with string-awareness so nested braces and braces
   * inside quoted values are handled correctly.
   */
  private splitRawCodeSegments(text: string): Segment[] {
    const segments: Segment[] = [];
    let remaining = text;

    while (remaining) {
      const block = this.findNextCodeBlock(remaining);

      if (!block) {
        // No brace-based block found. Check if entire remaining text is flat textproto.
        if (this.looksLikeTextproto(remaining)) {
          segments.push({ type: 'code', value: remaining.trim() });
        } else if (remaining.trim()) {
          segments.push({ type: 'text', value: remaining });
        }
        break;
      }

      const endIndex = this.findMatchingBrace(remaining, block.braceStart);

      if (endIndex === -1) {
        // Unclosed brace — treat entire remaining text as prose
        if (remaining.trim()) {
          segments.push({ type: 'text', value: remaining });
        }
        break;
      }

      // Extract prose before the code block
      const prose = remaining.slice(0, block.start).trim();
      if (prose) {
        segments.push({ type: 'text', value: prose });
      }

      // Extract the initial code block
      let code = remaining.slice(block.start, endIndex + 1).trim();
      let trailing = remaining.slice(endIndex + 1).trim();

      // Consume additional textproto content (more brace blocks or flat lines)
      const tail = this.consumeTextprotoTail(trailing);
      if (tail.code) {
        code += '\n' + tail.code;
      }
      trailing = tail.trailing;

      segments.push({ type: 'code', value: code });
      remaining = trailing;
    }

    return segments;
  }

  /** Returns true if ≥TEXTPROTO_THRESHOLD of non-empty lines look like textproto. */
  private looksLikeTextproto(text: string): boolean {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return false;
    const structured = lines.filter(l => /^\s*[a-z_][a-z0-9_]*\s*:/i.test(l));
    return structured.length / lines.length >= TEXTPROTO_THRESHOLD;
  }

  /**
   * Computes the portion of `submitted` text that hasn't been emitted yet.
   * Used to avoid duplicating content already sent via function_response while
   * still emitting any new prose that arrives in subsequent SUBMITTED payloads.
   *
   * @param accumulated Text already emitted during streaming.
   * @param submitted Full authoritative text from the SUBMITTED payload.
   * @returns The delta (new text) to emit, or empty string if nothing new.
   */
  private computeTextDelta(accumulated: string, submitted: string): string {
    if (!accumulated) return submitted;
    // Exact duplicate — nothing new to emit.
    if (submitted === accumulated) return '';
    // If submitted starts with what we've accumulated, emit only the suffix.
    if (submitted.startsWith(accumulated)) {
      return submitted.slice(accumulated.length);
    }
    // Content is completely different (e.g., function_response sent code,
    // SUBMITTED sends prose). Emit all of submitted; code block deduplication
    // via emittedCodeBlocks will prevent any code from being re-emitted.
    return submitted;
  }

  /**
   * Flushes any new content from the last submitted answer that hasn't been
   * emitted yet. Computes a delta to avoid duplicating content already sent
   * via function_response while ensuring new prose is surfaced.
   * @returns void
   */
  private flushSubmittedAnswer(): void {
    if (!this.lastSubmittedText) return;

    // Compute what's new vs already emitted to avoid duplicates while still
    // surfacing any prose that arrived after function_response payloads.
    const delta = this.computeTextDelta(this.accumulatedAnswer, this.lastSubmittedText);
    if (!delta) return;

    this.emitTextSegments(delta, this.lastSubmittedMessageId, this.lastSubmittedContextId);
  }

  /**
   * Emits the final complete message at the end of the stream, ensuring that the UI
   * has an authoritative full text to display and can mark the stream as done.
   * @returns void
   */
  private emitComplete(): void {
    // Prefer accumulatedAnswer (streaming deltas); fall back to lastSubmittedText
    // for simple no-tool conversations that emit only SUBMITTED snapshots.
    const finalText = this.accumulatedAnswer || this.lastSubmittedText;
    const finalMessage: ChatResponse = {
      message: {
        messageId: this.lastSubmittedMessageId ?? crypto.randomUUID(),
        contextId: this.lastSubmittedContextId ?? '',
        role: ChatBotRole.AGENT,
        content: [{ text: finalText }],
      },
    };

    this.subscriber.next({
      eventType: 'complete',
      done: true,
      finalMessage,
      messageId: this.lastSubmittedMessageId,
      contextId: this.lastSubmittedContextId,
    });
    this.subscriber.complete();
  }
}

@Injectable({ providedIn: 'root' })
export class ChatStreamService {
  private config = inject(APP_CONFIG);

  /**
   * Streams a message, emitting chunks of the response as they are received.
   * @param message The message to send.
   * @param contextId Optional context ID for the conversation.
   * @param abortController Optional AbortController to cancel the request.
   * @returns An Observable that emits StreamChunk objects.
   */
  streamMessage(
    message: string,
    contextId?: string,
    abortController?: AbortController
  ): Observable<StreamChunk> {
    return new Observable<StreamChunk>(subscriber => {
      const controller = abortController ?? new AbortController();
      const processor = new StreamProcessor(subscriber, this.config.apiUrl);
      processor.run(message, contextId, controller);
      return () => controller.abort();
    });
  }
}
