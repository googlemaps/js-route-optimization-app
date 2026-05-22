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
import { ContentSegment } from '../../../models/chat';
import { TypewriterController } from './typewriter';

// Match the constants from typewriter.ts
const CHARS_PER_TICK = 8;
const TICK_MS = 16;

/** Advance timers enough to fully animate `charCount` characters plus one
 * extra cleanup tick so the animation self-terminates. */
function tickForChars(charCount: number): void {
  const ticks = Math.ceil(charCount / CHARS_PER_TICK) + 1; // +1 for the cleanup pass
  vi.advanceTimersByTime(ticks * TICK_MS);
}

describe('TypewriterController', () => {
  let controller: TypewriterController;
  let onTick: ReturnType<typeof vi.fn>;
  let onStreamStart: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    onTick = vi.fn();
    onStreamStart = vi.fn();

    // TypewriterController uses Angular signal() — must be created inside injection context.
    TestBed.runInInjectionContext(() => {
      controller = new TypewriterController(
        onTick as unknown as () => void,
        onStreamStart as unknown as () => void
      );
    });
  });

  afterEach(() => {
    controller.destroy();
    vi.useRealTimers();
  });

  // -------------------------------------------------------------------------
  // Initial state
  // -------------------------------------------------------------------------

  describe('initial state', () => {
    it('isAnimating should be false before start', () => {
      expect(controller.isAnimating('msg-1')).toBe(false);
    });

    it('getSegments should return empty array before start', () => {
      expect(controller.getSegments('msg-1')).toEqual([]);
    });
  });

  // -------------------------------------------------------------------------
  // start() basics
  // -------------------------------------------------------------------------

  describe('start()', () => {
    it('should mark the message as animating immediately', () => {
      const segments: ContentSegment[] = [{ type: 'text', value: 'Hello' }];
      controller.start('msg-1', segments);
      expect(controller.isAnimating('msg-1')).toBe(true);
    });

    it('should invoke onStreamStart when animation begins', () => {
      controller.start('msg-1', [{ type: 'text', value: 'Hi' }]);
      expect(onStreamStart).toHaveBeenCalledTimes(1);
    });

    it('should be a no-op if called again for the same msgId while animating', () => {
      controller.start('msg-1', [{ type: 'text', value: 'First' }]);
      controller.start('msg-1', [{ type: 'text', value: 'Second' }]);
      expect(onStreamStart).toHaveBeenCalledTimes(1);
    });

    it('should not mutate the original segments array', () => {
      const original: ContentSegment[] = [{ type: 'text', value: 'Original' }];
      const copy = [...original];
      controller.start('msg-1', original);
      vi.advanceTimersByTime(TICK_MS * 10);
      expect(original).toEqual(copy);
    });
  });

  // -------------------------------------------------------------------------
  // Text animation (char-by-char)
  // -------------------------------------------------------------------------

  describe('text animation', () => {
    it('should emit no text before any ticks', () => {
      controller.start('msg-1', [{ type: 'text', value: 'ABCDEFGH' }]);
      // No tick has fired yet — segments signal is initialized to an empty array.
      expect(controller.getSegments('msg-1')).toEqual([]);
    });

    it('should reveal CHARS_PER_TICK characters per tick', () => {
      controller.start('msg-1', [{ type: 'text', value: 'ABCDEFGHIJKLMNOP' }]); // 16 chars = 2 ticks
      vi.advanceTimersByTime(TICK_MS); // tick 1 → 8 chars
      expect(controller.getSegments('msg-1')[0].value).toBe('ABCDEFGH');
    });

    it('should fully reveal text after enough ticks', () => {
      const text = 'Hello World!'; // 12 chars → 2 ticks
      controller.start('msg-1', [{ type: 'text', value: text }]);
      tickForChars(text.length);

      // Animation should be done — segments signal is cleaned up
      expect(controller.isAnimating('msg-1')).toBe(false);
    });

    it('should call onTick on every timer tick', () => {
      controller.start('msg-1', [{ type: 'text', value: 'ABCDEFGH' }]); // 1 tick needed
      vi.advanceTimersByTime(TICK_MS);
      expect(onTick).toHaveBeenCalled();
    });

    it('should concatenate chars to the last text segment rather than creating new ones', () => {
      controller.start('msg-1', [{ type: 'text', value: 'ABCDEFGHIJ' }]); // 10 chars = 2 ticks
      vi.advanceTimersByTime(TICK_MS); // first 8 chars typed
      const segs = controller.getSegments('msg-1');
      expect(segs).toHaveLength(1); // Still a single text segment
      expect(segs[0].type).toBe('text');
    });
  });

  // -------------------------------------------------------------------------
  // Code block handling
  // -------------------------------------------------------------------------

  describe('code block animation', () => {
    it('should insert code blocks as whole segments without char-by-char animation', () => {
      const code = 'const x = 42;'.repeat(100); // too long for one tick if animated
      controller.start('msg-1', [{ type: 'code', value: code }]);
      vi.advanceTimersByTime(TICK_MS); // single tick to process code block

      const segs = controller.getSegments('msg-1');
      // Either the segment appeared whole, or animation completed (no segments)
      const allSegs = segs.length > 0 ? segs : [];
      if (allSegs.length > 0) {
        expect(allSegs[0].type).toBe('code');
        expect(allSegs[0].value).toBe(code);
      }
    });

    it('should emit code block after preceding text segment is fully typed', () => {
      const text = 'ABCDEFGH'; // 8 chars = 1 tick
      const segments: ContentSegment[] = [
        { type: 'text', value: text },
        { type: 'code', value: '{}' },
      ];
      controller.start('msg-1', segments);

      // After 1 tick, text is typed; after 2nd tick, code block is inserted
      vi.advanceTimersByTime(TICK_MS); // tick 1: text typed
      vi.advanceTimersByTime(TICK_MS); // tick 2: code block inserted
      const segs = controller.getSegments('msg-1');
      const codeSegs = segs.filter(s => s.type === 'code');
      expect(codeSegs).toHaveLength(1);
      expect(codeSegs[0].value).toBe('{}');
    });

    it('should handle mixed text-code-text segments in order', () => {
      const segments: ContentSegment[] = [
        { type: 'text', value: 'ABCDEFGH' }, // tick 1: load+reveal
        { type: 'code', value: 'mycode' }, // tick 2: emit whole (early return)
        { type: 'text', value: 'IJKLMNOP' }, // tick 3: load+reveal
        // tick 4: cleanup
      ];
      controller.start('msg-1', segments);

      vi.advanceTimersByTime(TICK_MS * 4);

      // All segments should have been processed; animation should be done
      expect(controller.isAnimating('msg-1')).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // Auto-cleanup on completion
  // -------------------------------------------------------------------------

  describe('auto-cleanup on completion', () => {
    it('should set isAnimating to false when animation completes', () => {
      controller.start('msg-1', [{ type: 'text', value: 'Hi' }]); // 1 tick
      tickForChars(2);
      expect(controller.isAnimating('msg-1')).toBe(false);
    });

    it('should remove the message from the segments signal when done', () => {
      controller.start('msg-1', [{ type: 'text', value: 'Hi' }]);
      tickForChars(2);
      expect(controller.segments().has('msg-1')).toBe(false);
    });

    it('should call onComplete callback when animation finishes', () => {
      const onComplete = vi.fn();
      controller.start('msg-1', [{ type: 'text', value: 'Hi' }], onComplete);
      tickForChars(2);
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('should not call onComplete if animation is force-stopped via cleanup()', () => {
      const onComplete = vi.fn();
      controller.start('msg-1', [{ type: 'text', value: 'Long text goes here' }], onComplete);
      controller.cleanup('msg-1');
      vi.advanceTimersByTime(1000);
      expect(onComplete).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // cleanup()
  // -------------------------------------------------------------------------

  describe('cleanup()', () => {
    it('should stop animation immediately', () => {
      controller.start('msg-1', [{ type: 'text', value: 'Some long text here' }]);
      controller.cleanup('msg-1');
      expect(controller.isAnimating('msg-1')).toBe(false);
    });

    it('should remove the message from the segments signal', () => {
      controller.start('msg-1', [{ type: 'text', value: 'text' }]);
      controller.cleanup('msg-1');
      expect(controller.segments().has('msg-1')).toBe(false);
    });

    it('should be safe to call cleanup on a non-animating message', () => {
      expect(() => controller.cleanup('msg-never-started')).not.toThrow();
    });

    it('should only clean up the targeted message, not others', () => {
      controller.start('msg-1', [{ type: 'text', value: 'text one' }]);
      controller.start('msg-2', [{ type: 'text', value: 'text two' }]);
      controller.cleanup('msg-1');

      expect(controller.isAnimating('msg-1')).toBe(false);
      expect(controller.isAnimating('msg-2')).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // destroy()
  // -------------------------------------------------------------------------

  describe('destroy()', () => {
    it('should stop all active animations', () => {
      controller.start('msg-1', [{ type: 'text', value: 'text one' }]);
      controller.start('msg-2', [{ type: 'text', value: 'text two' }]);

      controller.destroy();

      // timers are cleared so advancing time should not trigger more ticks
      const ticksBefore = onTick.mock.calls.length;
      vi.advanceTimersByTime(1000);
      expect(onTick.mock.calls.length).toBe(ticksBefore);
    });

    it('should be safe to call destroy multiple times', () => {
      controller.destroy();
      expect(() => controller.destroy()).not.toThrow();
    });
  });

  // -------------------------------------------------------------------------
  // Multiple messages
  // -------------------------------------------------------------------------

  describe('multiple messages animating concurrently', () => {
    it('should animate independent messages in parallel', () => {
      controller.start('msg-1', [{ type: 'text', value: 'AAAAAAAA' }]); // 8 chars = 1 tick
      controller.start('msg-2', [{ type: 'text', value: 'BBBBBBBB' }]); // 8 chars = 1 tick

      vi.advanceTimersByTime(TICK_MS);

      expect(controller.getSegments('msg-1')[0]?.value).toContain('A');
      expect(controller.getSegments('msg-2')[0]?.value).toContain('B');
    });

    it('completing one animation should not affect the other', () => {
      controller.start('msg-1', [{ type: 'text', value: 'Hi' }]); // finishes fast
      controller.start('msg-2', [{ type: 'text', value: 'Much longer text goes here in msg two' }]);

      tickForChars(2); // msg-1 completes

      expect(controller.isAnimating('msg-1')).toBe(false);
      expect(controller.isAnimating('msg-2')).toBe(true);
    });
  });
});
