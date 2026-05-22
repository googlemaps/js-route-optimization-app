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

import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThinkingLabelQueue } from './thinking-label-queue';

// ThinkingLabelQueue uses Angular signal() which requires an injection context.
const makeQueue = (delayMs?: number) =>
  TestBed.runInInjectionContext(() => new ThinkingLabelQueue(delayMs));

describe('ThinkingLabelQueue', () => {
  let queue: ThinkingLabelQueue;

  beforeEach(() => {
    vi.useFakeTimers();
    queue = makeQueue();
  });

  afterEach(() => {
    queue.destroy();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('should return "Thinking..." when no label has been pushed', () => {
      expect(queue.getLabel('msg-1')).toBe('Thinking...');
    });

    it('should return "Thinking..." for any unknown message id', () => {
      queue.push('msg-1', 'Some step');
      expect(queue.getLabel('msg-never-seen')).toBe('Thinking...');
    });
  });

  // -------------------------------------------------------------------------
  // Label extraction
  // -------------------------------------------------------------------------

  describe('label extraction from raw step text', () => {
    it('should use the first non-empty line as the label', () => {
      queue = makeQueue(0); // 0 ms delay so timers fire instantly
      queue.push('msg-1', 'First line\nSecond line');
      vi.advanceTimersByTime(0);
      // After initial hold the first real label should come from "First line"
      vi.advanceTimersByTime(3000);
      expect(queue.getLabel('msg-1')).toBe('First line');
    });

    it('should strip markdown bold markers from extracted labels', () => {
      queue = makeQueue(0);
      queue.push('msg-1', '**Bold Title**\nMore text');
      vi.advanceTimersByTime(3000);
      expect(queue.getLabel('msg-1')).toBe('Bold Title');
    });

    it('should skip leading empty lines when extracting labels', () => {
      queue = makeQueue(0);
      queue.push('msg-1', '\n\nActual label');
      vi.advanceTimersByTime(3000);
      expect(queue.getLabel('msg-1')).toBe('Actual label');
    });

    it('should fall back to "Thinking..." if text has no non-empty lines', () => {
      queue = makeQueue(0);
      queue.push('msg-1', '\n  \n\t');
      vi.advanceTimersByTime(3000);
      expect(queue.getLabel('msg-1')).toBe('Thinking...');
    });
  });

  // -------------------------------------------------------------------------
  // Timer / display duration
  // -------------------------------------------------------------------------

  describe('display timing', () => {
    it('should not update the label before the first delay elapses', () => {
      queue = makeQueue(3000);
      queue.push('msg-1', 'Step 1');
      // No time has passed — label should still be "Thinking..."
      expect(queue.getLabel('msg-1')).toBe('Thinking...');
    });

    it('should update the label after the display delay', () => {
      queue = makeQueue(1000);
      queue.push('msg-1', 'Step A');
      vi.advanceTimersByTime(1000);
      expect(queue.getLabel('msg-1')).toBe('Step A');
    });

    it('should cycle through multiple queued labels, each held for displayMs', () => {
      queue = makeQueue(500);
      queue.push('msg-1', 'Step 1');
      queue.push('msg-1', 'Step 2');
      queue.push('msg-1', 'Step 3');

      vi.advanceTimersByTime(500); // Step 1 becomes visible
      expect(queue.getLabel('msg-1')).toBe('Step 1');

      vi.advanceTimersByTime(500); // Step 2 becomes visible
      expect(queue.getLabel('msg-1')).toBe('Step 2');

      vi.advanceTimersByTime(500); // Step 3 becomes visible
      expect(queue.getLabel('msg-1')).toBe('Step 3');
    });

    it('should show a new label immediately after the queue was previously drained', () => {
      queue = makeQueue(100);

      queue.push('msg-1', 'Step 1');
      vi.advanceTimersByTime(100); // Step 1 visible, queue now empty
      expect(queue.getLabel('msg-1')).toBe('Step 1');

      // After drain, next push should be immediate (real-time mode)
      queue.push('msg-1', 'Step 2');
      expect(queue.getLabel('msg-1')).toBe('Step 2');
    });
  });

  // -------------------------------------------------------------------------
  // Deduplication
  // -------------------------------------------------------------------------

  describe('deduplication', () => {
    it('should not enqueue consecutive duplicate labels', () => {
      queue = makeQueue(100);
      queue.push('msg-1', 'Step A');
      queue.push('msg-1', 'Step A'); // duplicate — should be skipped
      queue.push('msg-1', 'Step B');

      vi.advanceTimersByTime(100); // Step A
      expect(queue.getLabel('msg-1')).toBe('Step A');
      vi.advanceTimersByTime(100); // Step B (not a second Step A)
      expect(queue.getLabel('msg-1')).toBe('Step B');
    });

    it('should allow the same label if it appears non-consecutively', () => {
      queue = makeQueue(100);
      queue.push('msg-1', 'Step A');
      queue.push('msg-1', 'Step B');
      queue.push('msg-1', 'Step A'); // non-consecutive — should be enqueued

      vi.advanceTimersByTime(100); // Step A
      vi.advanceTimersByTime(100); // Step B
      vi.advanceTimersByTime(100); // Step A again
      expect(queue.getLabel('msg-1')).toBe('Step A');
    });
  });

  // -------------------------------------------------------------------------
  // Multiple message ids
  // -------------------------------------------------------------------------

  describe('multiple message ids', () => {
    it('should maintain independent queues per message id', () => {
      queue = makeQueue(100);
      queue.push('msg-A', 'LabelA1');
      queue.push('msg-B', 'LabelB1');

      vi.advanceTimersByTime(100);
      expect(queue.getLabel('msg-A')).toBe('LabelA1');
      expect(queue.getLabel('msg-B')).toBe('LabelB1');

      queue.push('msg-A', 'LabelA2');
      vi.advanceTimersByTime(100);
      expect(queue.getLabel('msg-A')).toBe('LabelA2');
      // msg-B queue is still drained, so label stays at last visible value
      expect(queue.getLabel('msg-B')).toBe('LabelB1');
    });
  });

  // -------------------------------------------------------------------------
  // destroy
  // -------------------------------------------------------------------------

  describe('destroy', () => {
    it('should cancel all pending timers on destroy', () => {
      queue = makeQueue(5000);
      queue.push('msg-1', 'Step 1');

      queue.destroy();

      // Even after the delay the label should NOT have changed (timer was cancelled)
      vi.advanceTimersByTime(5000);
      expect(queue.getLabel('msg-1')).toBe('Thinking...');
    });

    it('should be safe to call destroy multiple times', () => {
      queue.destroy();
      expect(() => queue.destroy()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // labels signal
  // -------------------------------------------------------------------------

  describe('labels signal', () => {
    it('should expose a readonly labels signal that reflects current state', () => {
      queue = makeQueue(100);
      queue.push('msg-1', 'My step');
      vi.advanceTimersByTime(100);

      const labelsMap = queue.labels();
      expect(labelsMap.get('msg-1')).toBe('My step');
    });
  });
});
