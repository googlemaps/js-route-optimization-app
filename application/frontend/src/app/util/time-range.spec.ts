/*
Copyright 2024 Google LLC

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

import Long from 'long';
import { getAvailableTimeRange } from './time-range';

describe('time-range util', () => {
  describe('getAvailableTimeRange', () => {
    it('should return undefined for a null time range', () => {
      expect(getAvailableTimeRange(null as any)).toBeUndefined();
    });
    it('should return undefined if start time is greater than or equal to end time', () => {
      expect(getAvailableTimeRange([1000, 800] as any)).toBeUndefined();
      expect(getAvailableTimeRange([1000, 1000] as any)).toBeUndefined();
    });

    it('should return time range', () => {
      expect(
        getAvailableTimeRange(
          [Long.ZERO, Long.fromNumber(1000)],
          [
            { startTime: { seconds: 10 } },
            { startTime: { seconds: 330 } },
            { startTime: { seconds: 750 } },
          ],
          [
            { endTime: { seconds: 909 } },
            { endTime: { seconds: 30 } },
            { endTime: { seconds: 555 } },
          ]
        )
      ).toEqual({
        min: Long.ZERO,
        max: Long.fromNumber(1000),
        start: Long.fromNumber(10),
        end: Long.fromNumber(909),
      });

      expect(
        getAvailableTimeRange(
          [Long.ZERO, Long.fromNumber(1000)],
          [
            { startTime: { seconds: 10 } },
            { startTime: { seconds: 330 } },
            { startTime: { seconds: 750 } },
          ],
          [
            { endTime: { seconds: 909 } },
            { endTime: { seconds: 30 } },
            { endTime: { seconds: 555 } },
          ],
          1000
        )
      ).toEqual({
        min: Long.fromNumber(1000),
        max: Long.fromNumber(2000),
        start: Long.fromNumber(1010),
        end: Long.fromNumber(1909),
      });

      expect(
        getAvailableTimeRange(
          [Long.ZERO, Long.fromNumber(1000)],
          [{ endTime: { seconds: 10 } }],
          [{ startTime: { seconds: 909 } }, {}]
        )
      ).toEqual({
        min: Long.ZERO,
        max: Long.fromNumber(1000),
        start: Long.ZERO,
        end: Long.fromNumber(1000),
      });

      expect(
        getAvailableTimeRange(
          [Long.fromNumber(200), Long.fromNumber(2222)],
          [{ startTime: { seconds: 100 } }, { endTime: { seconds: 600 } }],
          [{ endTime: { seconds: 8765 } }, {}]
        )
      ).toEqual({
        min: Long.fromNumber(200),
        max: Long.fromNumber(2222),
        start: Long.fromNumber(100),
        end: Long.fromNumber(8765),
      });
    });
  });
});
