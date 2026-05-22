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

import { computed, inject, Injectable } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import {
  EmptyError,
  firstValueFrom,
  lastValueFrom,
  Subject,
  Subscription,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { ContentSegment, ThinkingStep } from '../../models/chat';
import { OptimizeToursRequest, OptimizeToursResponse } from '../../models/ro';
import { getErrorMessage } from '../../util/error';
import { toOptimizeToursRequest, toOptimizeToursResponse } from '../../util/ro';
import { BrowserNotificationService } from '../browser-notification';
import { ChatGMApiService } from '../chat-gm-api';
import { ChatStreamService, StreamChunk } from '../chat-stream';

export const WELCOME_MESSAGE_ID = 'welcome-bot-message';

export enum ChatbotStatus {
  IDLE = 'IDLE',
  WAITING_FOR_GM = 'WAITING_FOR_GM',
  IS_TYPING = 'IS_TYPING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

export interface ChatState {
  messages: ChatMessage[];
  status: ChatbotStatus;
  contextId: string | undefined;
  optimizeRequest: OptimizeToursRequest | undefined;
  optimizeResponse: OptimizeToursResponse | undefined;
}

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: Date;
  isPlaceholder?: boolean;
  isUser: boolean;
  errorDetails?: string;
  attachments?: string[];
  /** Agent reasoning steps shown in the collapsible thinking panel. */
  thinkingSteps?: ThinkingStep[];
  /** How long (seconds) the agent spent thinking before the first answer text. */
  thinkingDuration?: number;
  /** True while the server-sent stream is still open. */
  isStreaming?: boolean;
  /**
   * Set to `true` by the store when a stream finishes, cleared immediately by
   * `ChatWindowComponent` once it calls `typewriter.start()`.
   */
  animationPending?: boolean;
  /** Ordered prose and code-block segments built up during streaming. */
  contentSegments?: ContentSegment[];
  /**
   * Notification upsell text shown inline for the first 30 s of a stream.
   * Cleared automatically after 30 s or when the stream completes.
   */
  upsellContent?: string;
}

export const WELCOME_MESSAGE: ChatMessage = {
  id: WELCOME_MESSAGE_ID,
  content:
    "Hi, I'm route optimization agent, how can I assist with your fleet route planning today? Unsure of where to start? Try reading our [help docs](#open-help-docs)",
  timestamp: new Date(),
  isUser: false,
};

export const UPSELL_MESSAGE =
  "I'm on it! Enable notifications and I'll ping you the second I've finished.";
export const UPSELL_DENIED_MESSAGE = "I can't notify you quite yet. Let's fix that together!";

export const LOADING_MESSAGES = [
  // 0s
  'Just a sec...',

  // 30s
  "Processing your request now. I'll have the full results ready momentarily.",

  // 60s
  'Compiling the information. Please wait just a moment longer.',

  // 90s (1m 30s)
  'Executing the final steps of the query. Response is incoming.\n\nNOTE: The response time largely depends on the size of the request, so expect a longer wait for complex queries.',

  // 120s (2m)
  'We are digging deep into the data for this one. Thanks for your patience.',

  // 150s (2m 30s)
  'Still working on the intricate details. Almost there.',

  // 180s (3m)
  'Finalizing the response now. It should be ready any second.',
];

const initialState: ChatState = {
  messages: [WELCOME_MESSAGE],
  status: ChatbotStatus.IDLE,
  contextId: undefined,
  optimizeRequest: undefined,
  optimizeResponse: undefined,
};

const NULL_RESPONSE_TEXT = '*No response returned. Please try again.*';

@Injectable({ providedIn: 'root' })
export class ChatStore extends signalStore(
  withState(initialState),

  withComputed(store => ({
    messageCount: computed(() => store.messages().length),
    canSendMessage: computed(
      () =>
        store.status() === ChatbotStatus.ACTIVE ||
        store.status() === ChatbotStatus.IDLE ||
        store.status() === ChatbotStatus.ERROR
    ),
    lastMessage: computed(() => store.messages().at(-1) ?? null),
  })),

  withMethods(
    (
      store,
      apiService = inject(ChatGMApiService),
      chatStreamService = inject(ChatStreamService),
      browserNotificationService = inject(BrowserNotificationService),
      loadingTimerSubscription: Subscription | null = null,
      cancelTrigger$ = new Subject<void>()
    ) => ({
      async sendPrompt(prompt: string, attachments: string[] = []): Promise<void> {
        cancelTrigger$ = new Subject<void>();
        const streamingBotMessageId = crypto.randomUUID();
        const thinkingStartTime = Date.now();

        this.addOrReplaceMessage({
          id: crypto.randomUUID(),
          content: prompt,
          timestamp: new Date(),
          isUser: true,
          attachments,
        });

        patchState(store, state => ({
          messages: [
            ...state.messages,
            {
              id: streamingBotMessageId,
              content: '',
              timestamp: new Date(),
              isUser: false,
              isStreaming: true,
              thinkingSteps: [],
            },
          ],
        }));
        this.setStatus(ChatbotStatus.IS_TYPING);

        // Show a notification upsell inside the streaming bubble for 30 s.
        const permission = browserNotificationService.permission();
        const upsellToShow =
          permission === 'default'
            ? UPSELL_MESSAGE
            : permission === 'denied'
              ? UPSELL_DENIED_MESSAGE
              : null;

        if (upsellToShow) {
          patchState(store, state => ({
            messages: state.messages.map(m =>
              m.id === streamingBotMessageId ? { ...m, upsellContent: upsellToShow } : m
            ),
          }));
          // Auto-dismissed in finally() if the stream ends before 30 s.
          loadingTimerSubscription = timer(30000).subscribe(() => {
            patchState(store, state => ({
              messages: state.messages.map(m =>
                m.id === streamingBotMessageId ? { ...m, upsellContent: undefined } : m
              ),
            }));
          });
        }

        try {
          const abortController = new AbortController();
          let lastChunk: StreamChunk | undefined;

          await lastValueFrom(
            chatStreamService.streamMessage(prompt, store.contextId(), abortController).pipe(
              takeUntil(cancelTrigger$),
              tap(chunk => {
                lastChunk = chunk;

                if (chunk.eventType === 'thinking' && chunk.thinkingStep) {
                  patchState(store, state => ({
                    messages: state.messages.map(m =>
                      m.id === streamingBotMessageId
                        ? { ...m, thinkingSteps: [...(m.thinkingSteps ?? []), chunk.thinkingStep!] }
                        : m
                    ),
                  }));
                } else if (chunk.eventType === 'text_delta') {
                  patchState(store, state => ({
                    messages: state.messages.map(m => {
                      if (m.id !== streamingBotMessageId) return m;
                      const segments = [...(m.contentSegments ?? [])];
                      const last = segments[segments.length - 1];
                      if (last?.type === 'text') {
                        segments[segments.length - 1] = {
                          type: 'text',
                          value: last.value + (chunk.delta ?? ''),
                        };
                      } else {
                        segments.push({ type: 'text', value: chunk.delta ?? '' });
                      }
                      return { ...m, content: chunk.text ?? '', contentSegments: segments };
                    }),
                  }));
                  if (chunk.contextId) this.setContextId(chunk.contextId);
                } else if (chunk.eventType === 'code_block') {
                  patchState(store, state => ({
                    messages: state.messages.map(m => {
                      if (m.id !== streamingBotMessageId) return m;
                      const segments = [
                        ...(m.contentSegments ?? []),
                        { type: 'code' as const, value: chunk.code ?? '' },
                      ];
                      return { ...m, contentSegments: segments };
                    }),
                  }));
                } else if (chunk.eventType === 'agent_error') {
                  // Append the error inline; keep any thinking steps already collected.
                  const errorLine = `\n\n❌ ${chunk.errorText ?? 'Internal agent error'}`;
                  patchState(store, state => ({
                    messages: state.messages.map(m => {
                      if (m.id !== streamingBotMessageId) return m;
                      const segments = [
                        ...(m.contentSegments ?? []),
                        { type: 'text' as const, value: errorLine },
                      ];
                      return {
                        ...m,
                        content: (m.content ?? '') + errorLine,
                        contentSegments: segments,
                      };
                    }),
                  }));
                }
                // 'complete' chunks are handled after lastValueFrom resolves.
              })
            )
          );

          // Finalize the streaming message.
          const thinkingDuration = Math.round((Date.now() - thinkingStartTime) / 1000);
          const finalText =
            (lastChunk?.eventType === 'complete'
              ? lastChunk.finalMessage?.message.content[0]?.text
              : store.messages().find(m => m.id === streamingBotMessageId)?.content) ||
            NULL_RESPONSE_TEXT;

          const serverId = lastChunk?.messageId;
          const serverContextId = lastChunk?.contextId;

          // Grab segments before the patchState below swaps the message ID —
          // after the swap, streamingBotMessageId no longer matches anything in state.
          const preFinalizeMsg = store.messages().find(m => m.id === streamingBotMessageId);
          const codeSegments = (preFinalizeMsg?.contentSegments ?? [])
            .filter(s => s.type === 'code')
            .map(s => s.value);

          patchState(store, state => ({
            messages: state.messages.map(m =>
              m.id === streamingBotMessageId
                ? {
                    ...m,
                    id: serverId ?? m.id,
                    content: finalText,
                    isStreaming: false,
                    thinkingDuration,
                    animationPending: true,
                  }
                : m
            ),
          }));

          if (serverContextId) this.setContextId(serverContextId);

          let roRequest: OptimizeToursRequest | undefined;
          let roResponse: OptimizeToursResponse | undefined;

          for (const code of codeSegments) {
            const fenced = `\`\`\`json\n${code}\n\`\`\``;
            roRequest ??= toOptimizeToursRequest(fenced);
            roResponse ??= toOptimizeToursResponse(fenced);
            if (roRequest && roResponse) break;
          }

          // Fallback for bare code-block responses (no prose prefix).
          roRequest ??= toOptimizeToursRequest(finalText);
          roResponse ??= toOptimizeToursResponse(finalText);

          if (roRequest) this.setRequest(roRequest);
          if (roResponse) this.setResponse(roResponse);

          this.setStatus(ChatbotStatus.ACTIVE);

          if (document.hidden) {
            browserNotificationService.notify('Response Ready', 'Your request is ready');
            browserNotificationService.startFlashing('Ready!');
          }
        } catch (error) {
          if (error instanceof EmptyError) {
            console.error('Request cancelled by user (New Session).', error);
            return;
          }

          console.error(error);
          this.removeMessage(streamingBotMessageId);
          this.addOrReplaceMessage({
            id: crypto.randomUUID(),
            content: '❌ Error processing request. Please try again.',
            timestamp: new Date(),
            isUser: false,
            errorDetails: getErrorMessage(error),
          });
          this.setStatus(ChatbotStatus.ERROR);
        } finally {
          loadingTimerSubscription?.unsubscribe();
        }
      },

      async refreshRoutes(): Promise<void> {
        cancelTrigger$ = new Subject<void>();

        this.setStatus(ChatbotStatus.WAITING_FOR_GM);

        loadingTimerSubscription = timer(0, 30000).subscribe(tick => {
          if (tick < LOADING_MESSAGES.length) {
            this.addOrReplacePlaceholderMessage(LOADING_MESSAGES[tick]);
          }
        });

        try {
          const response = await firstValueFrom(
            apiService.refreshPolylines(
              store.optimizeRequest()?.model || {},
              store.optimizeResponse()?.routes || [],
              cancelTrigger$
            )
          );

          const updatedResponse: OptimizeToursResponse = OptimizeToursResponse.create(
            store.optimizeResponse()
          );
          response.routes.forEach((route, i) => {
            updatedResponse!.routes[i].routePolyline = route.routePolyline;
          });

          this.setResponse(updatedResponse);

          this.removePlaceholderMessage();

          this.setStatus(ChatbotStatus.ACTIVE);

          if (document.hidden) {
            browserNotificationService.notify('Response Ready', 'Your request is ready');
            browserNotificationService.startFlashing('Ready!');
          }
        } catch (error) {
          if (error instanceof EmptyError) {
            console.error('Request cancelled by user (New Session).', error);
            return;
          }

          console.error(error);
          this.addOrReplaceMessage({
            id: crypto.randomUUID(),
            content: '❌ Error processing request. Please try again.',
            timestamp: new Date(),
            isUser: false,
            errorDetails: getErrorMessage(error),
          });
          this.setStatus(ChatbotStatus.ERROR);
        } finally {
          loadingTimerSubscription.unsubscribe();
        }
      },

      /** Appends `message` to the list, removing any existing placeholder first. */
      addOrReplaceMessage(message: ChatMessage): void {
        patchState(store, state => ({
          messages: [...state.messages.filter(m => !m.isPlaceholder), message],
        }));
      },

      /** Removes the message with the given ID from the list. */
      removeMessage(id: string): void {
        patchState(store, state => ({
          messages: state.messages.filter(m => m.id !== id),
        }));
      },

      /** Removes any placeholder message (loading indicator) from the list. */
      removePlaceholderMessage(): void {
        patchState(store, state => ({
          messages: state.messages.filter(m => !m.isPlaceholder),
        }));
      },

      /** Updates the global chatbot status. */
      setStatus(newStatus: ChatbotStatus): void {
        patchState(store, { status: newStatus });
      },

      /** Persists the server-issued context ID for use in subsequent requests. */
      setContextId(contextId: string): void {
        patchState(store, { contextId });
      },

      /** Appends a transient placeholder message with the given loading text. */
      addOrReplacePlaceholderMessage(content: string): void {
        this.addOrReplaceMessage({
          id: crypto.randomUUID(),
          content,
          timestamp: new Date(),
          isPlaceholder: true,
          isUser: false,
        });
      },

      /**
       * Clears the `animationPending` flag on the message with the given ID.
       * Called by `ChatWindowComponent` immediately after handing the message
       * off to `TypewriterController`, preventing the animation effect from
       * re-triggering on subsequent `messages()` emissions.
       */
      clearAnimationPending(id: string): void {
        patchState(store, state => ({
          messages: state.messages.map(m => (m.id === id ? { ...m, animationPending: false } : m)),
        }));
      },

      setRequest(optimizeRequest: OptimizeToursRequest): void {
        patchState(store, { optimizeRequest });
      },

      setResponse(optimizeResponse: OptimizeToursResponse): void {
        patchState(store, { optimizeResponse });
      },

      startNewSession(): void {
        cancelTrigger$.next();
        cancelTrigger$.complete();

        loadingTimerSubscription?.unsubscribe();

        browserNotificationService.stopFlashing();

        patchState(store, initialState);
      },
    })
  )
) {}
