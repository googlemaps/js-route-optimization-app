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

import { DestroyRef, inject, signal } from '@angular/core';
import { ContentSegment } from '../../../models/chat';

const CHARS_PER_TICK = 8;
const TICK_MS = 16; // ~500 chars/s

/**
 * Manages the per-message typewriter animation for streaming chat responses.
 *
 * Usage: call {@link start} once when a message has finished streaming and its
 * full `contentSegments` are available. The controller animates segments in
 * their original order — text revealed char-by-char, code blocks inserted
 * whole once the preceding text is fully typed. Segments are auto-removed
 * from the signal once the animation completes so the template can fall
 * through to reading `message.contentSegments` directly.
 *
 * The controller self-registers cleanup via its own injected {@link DestroyRef}, so
 * no manual teardown is required from the consuming component.
 */
export class TypewriterController {
  /** Animated segments exposed to the template, keyed by message ID. */
  private readonly _segments = signal<Map<string, ContentSegment[]>>(new Map());
  /** Read-only view for template binding. */
  readonly segments = this._segments.asReadonly();

  // Per-message animation state.
  /** Ordered remaining segments yet to be emitted for each message. */
  private readonly pendingQueue = new Map<string, ContentSegment[]>();
  /** Remaining chars from the current text segment being typed. */
  private readonly pendingText = new Map<string, string>();
  /** Active setInterval handles keyed by message ID. */
  private readonly timers = new Map<string, ReturnType<typeof setInterval>>();

  /**
   * @param onTick        Called on every timer tick — use to trigger scroll-to-bottom.
   * @param onStreamStart Called when animation begins — use to reset scroll-lock state.
   */
  constructor(
    private readonly onTick: () => void,
    private readonly onStreamStart: () => void
  ) {
    inject(DestroyRef).onDestroy(() => this.destroy());
  }

  /** Returns true if a typewriter animation is currently running for the given message. */
  isAnimating(msgId: string): boolean {
    return this._segments().has(msgId);
  }

  /**
   * Begins typewriter animation on the *complete* final segments for a message.
   * Call this once, after streaming ends. Calling again for the same `msgId`
   * while animation is already running is a no-op.
   * @param onComplete Optional callback invoked when animation fully drains.
   */
  start(msgId: string, segments: ContentSegment[], onComplete?: () => void): void {
    if (this.timers.has(msgId)) return; // already animating

    this.onStreamStart();

    // Clone to avoid mutating the store's data.
    this.pendingQueue.set(
      msgId,
      segments.map(s => ({ ...s }))
    );
    this.pendingText.set(msgId, '');
    this._segments.update(m => new Map(m).set(msgId, []));

    this.startTimer(msgId, onComplete);
  }

  /**
   * Returns the currently animated segments for a message.
   * Returns an empty array if animation has not started yet.
   */
  getSegments(msgId: string): ContentSegment[] {
    return this._segments().get(msgId) ?? [];
  }

  /**
   * Cancels animation for a message and removes it from the signal.
   * Prefer letting the timer self-clean on completion; call this only
   * when you need to force-stop (e.g. error path).
   */
  cleanup(msgId: string): void {
    const timer = this.timers.get(msgId);
    if (timer !== undefined) {
      clearInterval(timer);
      this.timers.delete(msgId);
    }
    this.pendingQueue.delete(msgId);
    this.pendingText.delete(msgId);
    this._segments.update(m => {
      const n = new Map(m);
      n.delete(msgId);
      return n;
    });
  }

  /** Stops all active timers. Registered automatically with the injected {@link DestroyRef}. */
  private destroy(): void {
    for (const timer of this.timers.values()) clearInterval(timer);
    this.timers.clear();
  }

  /**
   * Drives the animation loop for a message. On each tick it either reveals
   * the next batch of text characters or emits the next code block whole.
   * Cleans itself up automatically when all segments have been emitted.
   */
  private startTimer(msgId: string, onComplete?: () => void): void {
    const timer = setInterval(() => {
      const queue = this.pendingQueue.get(msgId)!;
      let remaining = this.pendingText.get(msgId) ?? '';

      // If the current text buffer is empty, pull the next segment.
      if (!remaining) {
        if (!queue.length) {
          // Animation complete — auto-cleanup so the template falls through
          // to reading message.contentSegments directly.
          clearInterval(timer);
          this.timers.delete(msgId);
          this.pendingQueue.delete(msgId);
          this.pendingText.delete(msgId);
          this._segments.update(m => {
            const n = new Map(m);
            n.delete(msgId);
            return n;
          });
          onComplete?.();
          return;
        }

        const next = queue[0];

        if (next.type === 'code') {
          // Code block: emit whole, no char-by-char.
          queue.shift();
          this._segments.update(m => {
            const segs = [...(m.get(msgId) ?? []), { type: 'code' as const, value: next.value }];
            return new Map(m).set(msgId, segs);
          });
          this.onTick();
          return;
        }

        // Text segment: load chars into the buffer.
        remaining = queue.shift()!.value;
        this.pendingText.set(msgId, remaining);
      }

      // Reveal the next batch of characters.
      const chunk = remaining.slice(0, CHARS_PER_TICK);
      this.pendingText.set(msgId, remaining.slice(CHARS_PER_TICK));

      this._segments.update(m => {
        const segs = [...(m.get(msgId) ?? [])];
        const last = segs[segs.length - 1];
        if (last?.type === 'text') {
          segs[segs.length - 1] = { type: 'text', value: last.value + chunk };
        } else {
          segs.push({ type: 'text', value: chunk });
        }
        return new Map(m).set(msgId, segs);
      });

      this.onTick();
    }, TICK_MS);

    this.timers.set(msgId, timer);
  }
}
