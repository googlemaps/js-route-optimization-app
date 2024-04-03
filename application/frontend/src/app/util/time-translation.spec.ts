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

import * as Long from 'long';
import {
  formatDuration,
  formatTime,
  formatLongDuration,
  formatLongTime,
  timeToPixel,
  pixelToTime,
  formatDate,
  formatSecondsDate,
  timeStringToSeconds,
  localDateTimeToUtcSeconds,
} from './time-translation';

describe('util', () => {
  describe('formatLongDuration', () => {
    it('should return zero', () => {
      expect(formatLongDuration(null)).toBe('00:00');
    });

    it('should return formatted time', () => {
      expect(
        formatLongDuration(Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000))
      ).toBe('04:15');
    });

    it('should use UTC', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000)
        )
      ).toBe('04:15');
    });

    it('should use 24H', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('22:39');
    });

    it('should return no offset', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-02T22:38:59.999Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('22:38');
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-02T01:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('01:39');
    });

    it('should return +1 offset', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-02T22:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('22:39+1');
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-03T01:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('01:39+1');
    });

    it('should return +2 offset', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-10-04T01:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('01:39+2');
    });

    it('should return -1 offset', () => {
      expect(
        formatLongDuration(
          Long.fromNumber(Date.parse('2019-09-30T01:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('01:39-1');
    });
  });

  describe('formatDuration', () => {
    it('should return zero', () => {
      expect(formatDuration(null)).toBe('00:00');
      expect(formatDuration(0)).toBe('00:00');
    });

    it('should use UTC', () => {
      expect(formatDuration(Date.parse('2019-10-01T04:15:00.000Z') / 1000)).toBe('04:15');
    });

    it('should use 24H', () => {
      expect(formatDuration(Date.parse('2019-10-01T22:39:00.000Z') / 1000)).toBe('22:39');
    });
  });

  describe('formatLongTime', () => {
    it('should return zero', () => {
      expect(formatLongTime(null)).toBe('00:00');
    });

    it('should return formatted time', () => {
      expect(
        formatLongTime(Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000))
      ).toBe('04:15');
    });

    it('should use UTC', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T04:15:00.000Z')).div(1000)
        )
      ).toBe('04:15');
    });

    it('should use 24H', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('22:39');
    });

    it('should return no offset', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-02T22:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-02T00:00:00.000Z')).div(1000)
        )
      ).toBe('22:39');
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-02T23:59:59.999Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-02T00:00:00.000Z')).div(1000)
        )
      ).toBe('23:59');
    });

    it('should return +1 offset', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-02T22:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('22:39+1');
    });

    it('should return +2 offset', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-10-03T01:39:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T23:39:00.000Z')).div(1000)
        )
      ).toBe('01:39+2');
    });

    it('should return -1 offset', () => {
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-09-30T23:45:00.000Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('23:45-1');
      expect(
        formatLongTime(
          Long.fromNumber(Date.parse('2019-09-30T23:59:59.999Z')).div(1000),
          Long.fromNumber(Date.parse('2019-10-01T22:39:00.000Z')).div(1000)
        )
      ).toBe('23:59-1');
    });
  });

  describe('formatTime', () => {
    it('should return zero', () => {
      expect(formatTime(null)).toBe('00:00');
      expect(formatTime(0)).toBe('00:00');
    });

    it('should use UTC', () => {
      expect(formatTime(Date.parse('2019-10-01T04:15:00.000Z') / 1000)).toBe('04:15');
    });

    it('should use 24H', () => {
      expect(formatTime(Date.parse('2019-10-01T22:39:00.000Z') / 1000)).toBe('22:39');
    });

    it('should return no offset', () => {
      expect(
        formatTime(
          Date.parse('2019-10-02T22:39:00.000Z') / 1000,
          Date.parse('2019-10-02T00:00:00.000Z') / 1000
        )
      ).toBe('22:39');
      expect(
        formatTime(
          Date.parse('2019-10-02T23:59:59.999Z') / 1000,
          Date.parse('2019-10-02T00:00:00.000Z') / 1000
        )
      ).toBe('23:59');
    });

    it('should return +1 offset', () => {
      expect(
        formatTime(
          Date.parse('2019-10-02T22:39:00.000Z') / 1000,
          Date.parse('2019-10-01T22:39:00.000Z') / 1000
        )
      ).toBe('22:39+1');
    });

    it('should return +2 offset', () => {
      expect(
        formatTime(
          Date.parse('2019-10-03T01:39:00.000Z') / 1000,
          Date.parse('2019-10-01T23:39:00.000Z') / 1000
        )
      ).toBe('01:39+2');
    });

    it('should return -1 offset', () => {
      expect(
        formatTime(
          Date.parse('2019-09-30T23:59:59.999Z') / 1000,
          Date.parse('2019-10-01T22:39:00.000Z') / 1000
        )
      ).toBe('23:59-1');
      expect(
        formatTime(
          Date.parse('2019-09-30T23:45:00.000Z') / 1000,
          Date.parse('2019-10-01T22:39:00.000Z') / 1000
        )
      ).toBe('23:45-1');
    });
  });

  describe('timeToPixel', () => {
    it('should return zero when durationSeconds is zero', () => {
      expect(timeToPixel(Long.ZERO, Long.ZERO, Long.ZERO)).toBe(0);
    });

    it('should convert time to pixels', () => {
      expect(
        timeToPixel(Long.fromNumber(2000), Long.fromNumber(1000), Long.fromNumber(1000))
      ).toBeCloseTo(1);
    });
  });

  describe('pixelToTime', () => {
    it('should return 0 when there is no usable width', () => {
      expect(pixelToTime(100, 0, Long.ZERO, Long.ZERO)).toEqual(Long.ZERO);
    });

    it('should convert pixel to time', () => {
      expect(pixelToTime(100, 100, Long.ZERO, Long.fromNumber(100))).toEqual(Long.fromNumber(100));
    });
  });

  describe('formatDate', () => {
    it('should return formated date string', () => {
      expect(formatDate(1658351700)).toEqual(new Date(1658351700 * 1000).toLocaleDateString());
      expect(formatDate(1658351700, -1000)).toEqual(
        new Date((1658351700 - 1000) * 1000).toLocaleDateString()
      );
      expect(formatDate(1658351700, 100)).toEqual(
        new Date((1658351700 + 100) * 1000).toLocaleDateString()
      );
    });
  });

  describe('formatSecondsDate', () => {
    it('should return formatted date from seconds', () => {
      expect(formatSecondsDate(1658351700)).toBe('2022/07/20 9:15PM');
      expect(formatSecondsDate(1658351700, 3600)).toBe('2022/07/20 10:15PM');
      expect(formatSecondsDate(1658351700, 3600, 'dd/MM/yyyy')).toBe('20/07/2022');
    });
  });

  describe('timeStringToSeconds', () => {
    it('should return seconds from timestring', () => {
      expect(timeStringToSeconds('0:1:0')).toBe(60);
      expect(timeStringToSeconds('02:15:33')).toBe(8133);
      expect(timeStringToSeconds('00:00:4500')).toBe(4500);
      expect(timeStringToSeconds('00:100:00')).toBe(6000);
    });
  });

  describe('localDateTimeToUtcSeconds', () => {
    it('should return null', () => {
      expect(localDateTimeToUtcSeconds(null, null, null)).toBeNull();
      expect(localDateTimeToUtcSeconds(new Date(), null, null)).toBeNull();
      expect(localDateTimeToUtcSeconds(new Date(), null, Infinity)).toBeNull();
    });

    it('should convert date to UTC seconds', () => {
      const date = new Date('2022-07-20T21:00:00Z');
      expect(localDateTimeToUtcSeconds(date, '2022-07-20T21:00:00Z', 0)).toBe(
        date.getTime() / 1000 + date.getTimezoneOffset() * -60
      );
      expect(localDateTimeToUtcSeconds(date, '2022-07-20T21:00:00Z', 1000)).toBe(
        date.getTime() / 1000 + date.getTimezoneOffset() * -60 - 1000
      );
      expect(localDateTimeToUtcSeconds(date, '21:00:00', 100)).toBe(
        date.getTime() / 1000 + date.getTimezoneOffset() * -60 - 100
      );
    });
  });
});
