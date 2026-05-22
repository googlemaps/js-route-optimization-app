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

import { signal } from '@angular/core';

const DEFAULT_DISPLAY_MS = 3000;

/**
 * Manages the FIFO thinking-step label queue shown in the streaming
 * "Thinking…" header while the agent is reasoning.
 *
 * Labels are displayed for {@link displayMs} ms each so the user has time
 * to read them even when the agent emits several steps in rapid succession.
 * Once the backlog is cleared, new labels appear in real-time (no delay).
 *
 * Usage:
 * ```ts
 * const queue = new ThinkingLabelQueue();
 * queue.push(messageId, rawStepText);
 * queue.getLabel(messageId); // read from template
 * queue.destroy();           // call from DestroyRef.onDestroy
 * ```
 */
export class ThinkingLabelQueue {
  /** Currently visible label per message, read by the template. */
  private readonly _labels = signal<Map<string, string>>(new Map());
  readonly labels = this._labels.asReadonly();

  private readonly queues = new Map<string, string[]>();
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  constructor(private readonly displayMs = DEFAULT_DISPLAY_MS) {}

  /**
   * Extracts the header from a raw thinking-step text block (first non-empty
   * line, markdown bold markers stripped) and enqueues it for display.
   */
  push(msgId: string, rawText: string): void {
    const label = this.extractLabel(rawText);
    const queue = this.queues.get(msgId) ?? [];
    this.queues.set(msgId, queue);

    // Dedup: skip if identical to the last item already queued.
    if (queue[queue.length - 1] === label) return;
    queue.push(label);

    if (this.timers.has(msgId)) return; // drain loop already active

    const isFirst = !this._labels().get(msgId);
    if (isFirst) {
      // Hold "Thinking…" for displayMs before revealing the first real label.
      this.scheduleNext(msgId, this.displayMs);
    } else {
      // Queue was previously drained — show immediately (real-time mode).
      this.drain(msgId);
    }
  }

  /** Returns the currently visible label for the given message. */
  getLabel(msgId: string): string {
    return this._labels().get(msgId) ?? 'Thinking...';
  }

  /** Cancels all pending timers — call from `DestroyRef.onDestroy`. */
  destroy(): void {
    for (const timer of this.timers.values()) clearTimeout(timer);
    this.timers.clear();
  }

  private drain(msgId: string): void {
    const queue = this.queues.get(msgId) ?? [];
    if (!queue.length) return;

    const next = queue.shift()!;
    this._labels.update(m => new Map(m).set(msgId, next));

    if (queue.length > 0) {
      this.scheduleNext(msgId, this.displayMs);
    }
    // Queue empty → no timer set; the next push() will be real-time.
  }

  private scheduleNext(msgId: string, delayMs: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(msgId);
      this.drain(msgId);
    }, delayMs);
    this.timers.set(msgId, timer);
  }

  private extractLabel(text: string): string {
    const firstLine = text
      .split('\n')
      .map(l => l.replace(/\*\*/g, '').trim())
      .find(l => l.length > 0);
    return firstLine ?? 'Thinking...';
  }
}
