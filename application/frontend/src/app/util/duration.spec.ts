/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Long from 'long';
import {
  durationMinutesSeconds,
  durationSeconds,
  durationToMinutes,
  durationToRequestString,
  minutesToDuration,
  pad,
  secondsToDuration,
  secondsToFormattedTime,
  timeWindowToDuration,
} from './duration';

describe('duration util', () => {
  describe('secondsToDuration', () => {
    it('should return null for null', () => {
      expect(secondsToDuration(null)).toBeNull();
    });

    it('should return null for negative number', () => {
      expect(secondsToDuration(-100)).toBeNull();
    });

    it('should return duration for number', () => {
      expect(secondsToDuration(101)).toEqual({ seconds: 101 });
    });
  });

  describe('minutesToDuration', () => {
    it('should return null for null', () => {
      expect(minutesToDuration(null)).toBeNull();
    });

    it('should return null for negative number', () => {
      expect(minutesToDuration(-100)).toBeNull();
    });

    it('should return duration for number', () => {
      expect(minutesToDuration(10)).toEqual({ seconds: 600 });
    });
  });

  describe('durationToRequestString', () => {
    it('should return duration request string from duration', () => {
      expect(durationToRequestString({ seconds: 100 })).toEqual('100s');
    });

    it('should return duration request string for only seconds from duration with seconds and nanos', () => {
      expect(durationToRequestString({ seconds: 100, nanos: 203 })).toEqual('100s');
    });
  });

  describe('durationSeconds', () => {
    it('should return default value for null inputs', () => {
      expect(durationSeconds(null)).toEqual(Long.ZERO);
      expect(durationSeconds(null, Long.fromValue(1234))).toEqual(Long.fromValue(1234));
    });

    it('should return the value of a duration with only seconds', () => {
      expect(durationSeconds({ seconds: 1001 })).toEqual(Long.fromValue(1001));
      expect(durationSeconds({ seconds: -50 })).toEqual(Long.fromValue(-50));
      expect(durationSeconds({ seconds: '50' })).toEqual(Long.fromValue(50));
      expect(durationSeconds({ seconds: 'abc' }, Long.fromValue(100))).toEqual(Long.fromValue(0));
    });

    it('should return the value of a duration with only nanos', () => {
      expect(durationSeconds({ nanos: 1500000000 })).toEqual(Long.fromValue(1.5));
      expect(durationSeconds({ nanos: -5000000000 })).toEqual(Long.fromValue(-5));
    });

    it('should return the value of a duration with seconds and nanos', () => {
      expect(durationSeconds({ seconds: 33, nanos: 100000000 })).toEqual(Long.fromValue(33.1));
      expect(durationSeconds({ seconds: 21, nanos: -5000000000 })).toEqual(Long.fromValue(16));
    });
  });

  describe('durationToMinutes', () => {
    it('should return default value for null input', () => {
      expect(durationToMinutes(null)).toEqual(Long.ZERO);
      expect(durationToMinutes(null, Long.fromValue(100))).toEqual(Long.fromValue(100));
    });

    it('should return minutes from seconds', () => {
      expect(durationToMinutes({ seconds: 600 })).toBe(10);
      expect(durationToMinutes({ seconds: 66 })).toBe(1.1);
    });
  });

  describe('secondsToFormattedTime', () => {
    it('should return formatted time', () => {
      expect(secondsToFormattedTime(1658248391)).toBe('16:33:11');
    });
  });

  describe('durationMinutesSeconds', () => {
    it('should return minutes and seconds', () => {
      expect(durationMinutesSeconds({ seconds: 60 })).toEqual({ minutes: 1, seconds: 0 });
      expect(durationMinutesSeconds({ seconds: 4 })).toEqual({ minutes: 0, seconds: 4 });
      expect(durationMinutesSeconds({ seconds: 133 })).toEqual({ minutes: 2, seconds: 13 });
    });
  });

  describe('pad', () => {
    it('should pad a string', () => {
      expect(pad('1')).toBe('01');
      expect(pad('0')).toBe('00');
    });

    it('should not pad a string', () => {
      expect(pad('31')).toBe('31');
      expect(pad('654')).toBe('654');
      expect(pad('-1')).toBe('-1');
    });
  });

  describe('timeWindowToDuration', () => {
    it('should convert time window to duration', () => {
      expect(
        timeWindowToDuration({ seconds: 1000 }, { seconds: 600 }, [
          Long.fromValue(0),
          Long.fromValue(0),
        ])
      ).toEqual([Long.fromValue(1000), Long.fromValue(600)]);
    });
    it('should return default values', () => {
      expect(
        timeWindowToDuration({ seconds: null }, { seconds: null }, [
          Long.fromValue(1),
          Long.fromValue(2),
        ])
      ).toEqual([Long.fromValue(1), Long.fromValue(2)]);
    });
  });
});
