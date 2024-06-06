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

import { formatDate } from '@angular/common';
import Long from 'long';
import {
  compareTimeWindows,
  formatTimeWindowDuration,
  getChosenTimeWindow,
  getSoftEndTimeMissedCost,
  getSoftEndTimeMissedSeconds,
  getSoftPenalty,
  getSoftStartTimeMissedCost,
  getSoftStartTimeMissedSeconds,
  timeWindowHasTime,
} from './time-window';

describe('time windows util', () => {
  describe('getChosenTimeWindow', () => {
    it('should return undefined when an empty list of time windows is given', () => {
      expect(getChosenTimeWindow([], {})).toBeUndefined();
    });

    it('should return undefined when no start time is given', () => {
      expect(getChosenTimeWindow([{ startTime: { seconds: 0 } }], null)).toBeUndefined();
    });

    it('should return undefined when no time window contains the start time', () => {
      expect(
        getChosenTimeWindow([{ startTime: { seconds: 0 }, endTime: { seconds: 100 } }], {
          seconds: 2000,
        })
      ).toBeUndefined();
    });

    it('should return the first time window that contains the start time', () => {
      expect(
        getChosenTimeWindow([{ startTime: { seconds: 0 }, endTime: { seconds: 100 } }], {
          seconds: 50,
        })
      ).toEqual({ startTime: { seconds: 0 }, endTime: { seconds: 100 } });
      expect(
        getChosenTimeWindow(
          [
            { startTime: { seconds: 0 }, endTime: { seconds: 100 } },
            { startTime: { seconds: 50 }, endTime: { seconds: 200 } },
          ],
          { seconds: 60 }
        )
      ).toEqual({ startTime: { seconds: 0 }, endTime: { seconds: 100 } });
    });

    it('should use default long values for start and end time if not provided', () => {
      expect(getChosenTimeWindow([{ startTime: { seconds: 0 } }], { seconds: 50 })).toEqual({
        startTime: { seconds: 0 },
      });
      expect(getChosenTimeWindow([{ endTime: { seconds: 500 } }], { seconds: 50 })).toEqual({
        endTime: { seconds: 500 },
      });
      expect(getChosenTimeWindow([{}], { seconds: 50 })).toEqual({});
    });
  });

  describe('getSoftStartTimeMissedSeconds', () => {
    it('should return NaN when softStartTime is undefined', () => {
      expect(getSoftStartTimeMissedSeconds({}, { seconds: 100 })).toBeNaN();
      expect(getSoftStartTimeMissedSeconds(null, { seconds: 100 })).toBeNaN();
    });

    it('should return number of seconds after soft start', () => {
      expect(
        getSoftStartTimeMissedSeconds({ softStartTime: { seconds: 100 } }, { seconds: 100 })
      ).toBe(0);
      expect(
        getSoftStartTimeMissedSeconds({ softStartTime: { seconds: 100 } }, { seconds: 10 })
      ).toBe(90);
      expect(
        getSoftStartTimeMissedSeconds({ softStartTime: { seconds: 90 } }, { seconds: 110 })
      ).toBe(0);
    });
  });

  describe('getSoftStartTimeMissedCost', () => {
    it('should return NaN when no costPerHourBeforeSoftStartTime is defined', () => {
      expect(
        getSoftStartTimeMissedCost({ softStartTime: { seconds: 100 } }, { seconds: 10 })
      ).toBeNaN();
      expect(getSoftStartTimeMissedCost({}, { seconds: 10 })).toBeNaN();
      expect(getSoftStartTimeMissedCost({}, {})).toBeNaN();
    });

    it('should return NaN when softStartTime is not defined', () => {
      expect(
        getSoftStartTimeMissedCost({ costPerHourBeforeSoftStartTime: 10 }, { seconds: 0 })
      ).toBeNaN();
    });

    it('should return cost per hour', () => {
      expect(
        getSoftStartTimeMissedCost(
          { softStartTime: { seconds: 3600 }, costPerHourBeforeSoftStartTime: 10 },
          { seconds: 0 }
        )
      ).toBe(10);
      expect(
        getSoftStartTimeMissedCost(
          { softStartTime: { seconds: 0 }, costPerHourBeforeSoftStartTime: 10 },
          { seconds: 1000 }
        )
      ).toBe(0);
    });
  });

  describe('getSoftEndTimeMissedSeconds', () => {
    it('should return NaN when softEndTime is undefined', () => {
      expect(getSoftEndTimeMissedSeconds({}, { seconds: 100 })).toBeNaN();
      expect(getSoftEndTimeMissedSeconds(null, { seconds: 100 })).toBeNaN();
    });

    it('should return number of seconds before soft end', () => {
      expect(getSoftEndTimeMissedSeconds({ softEndTime: { seconds: 100 } }, { seconds: 100 })).toBe(
        0
      );
      expect(getSoftEndTimeMissedSeconds({ softEndTime: { seconds: 100 } }, { seconds: 10 })).toBe(
        0
      );
      expect(getSoftEndTimeMissedSeconds({ softEndTime: { seconds: 90 } }, { seconds: 110 })).toBe(
        20
      );
    });
  });

  describe('getSoftEndTimeMissedCost', () => {
    it('should return NaN when no costPerHourAfterSoftEndTime is defined', () => {
      expect(
        getSoftEndTimeMissedCost({ softEndTime: { seconds: 100 } }, { seconds: 10 })
      ).toBeNaN();
      expect(getSoftEndTimeMissedCost({}, { seconds: 10 })).toBeNaN();
      expect(getSoftEndTimeMissedCost({}, {})).toBeNaN();
    });

    it('should return NaN when softEndTime is not defined', () => {
      expect(
        getSoftEndTimeMissedCost({ costPerHourAfterSoftEndTime: 10 }, { seconds: 0 })
      ).toBeNaN();
    });

    it('should return cost per hour', () => {
      expect(
        getSoftEndTimeMissedCost(
          { softEndTime: { seconds: 3600 }, costPerHourAfterSoftEndTime: 10 },
          { seconds: 0 }
        )
      ).toBe(0);
      expect(
        getSoftEndTimeMissedCost(
          { softEndTime: { seconds: 0 }, costPerHourAfterSoftEndTime: 10 },
          { seconds: 3600 }
        )
      ).toBe(10);
    });
  });

  describe('getSoftPenalty', () => {
    it(`should return undefined if visit doesn't exist`, () => {
      expect(getSoftPenalty({}, null)).toBeUndefined();
      expect(
        getSoftPenalty({ startTime: { seconds: 100 }, endTime: { seconds: 100 } }, undefined)
      ).toBeUndefined();
    });

    it('should return no penalty for visits before time window', () => {
      expect(
        getSoftPenalty(
          { startTime: { seconds: 100 }, endTime: { seconds: 200 } },
          { startTime: { seconds: 1 } }
        )
      ).toBeUndefined();
    });

    it('should return no penalty for visits within time window', () => {
      expect(
        getSoftPenalty(
          { startTime: { seconds: 100 }, endTime: { seconds: 200 } },
          { startTime: { seconds: 150 } }
        )
      ).toBeUndefined();
    });

    it('should return no penalty for visits within soft time window', () => {
      expect(
        getSoftPenalty(
          {
            startTime: { seconds: 50 },
            softStartTime: { seconds: 100 },
            endTime: { seconds: 300 },
            softEndTime: { seconds: 200 },
          },
          {
            startTime: { seconds: 150 },
          }
        )
      ).toBeUndefined();
    });

    it('should return early penalty for visits before soft start', () => {
      expect(
        getSoftPenalty(
          {
            startTime: { seconds: 50 },
            softStartTime: { seconds: 100 },
            endTime: { seconds: 300 },
            softEndTime: { seconds: 200 },
          },
          {
            startTime: { seconds: 50 },
          }
        )
      ).toEqual({ early: true, seconds: 50 });

      expect(
        getSoftPenalty(
          {
            startTime: { seconds: 50 },
            softStartTime: { seconds: 100 },
            endTime: { seconds: 300 },
            softEndTime: { seconds: 200 },
          },
          {
            startTime: { seconds: 0 },
          }
        )
      ).toEqual({ early: true, seconds: 100 });
    });

    it('should return late penalty for visits after soft end', () => {
      expect(
        getSoftPenalty(
          {
            startTime: { seconds: 50 },
            softStartTime: { seconds: 100 },
            endTime: { seconds: 300 },
            softEndTime: { seconds: 200 },
          },
          {
            startTime: { seconds: 250 },
          }
        )
      ).toEqual({ early: false, seconds: 50 });

      expect(
        getSoftPenalty(
          {
            startTime: { seconds: 50 },
            softStartTime: { seconds: 100 },
            endTime: { seconds: 300 },
            softEndTime: { seconds: 200 },
          },
          {
            startTime: { seconds: 500 },
          }
        )
      ).toEqual({ early: false, seconds: 300 });
    });
  });

  describe('formatTimeWindowDuration', () => {
    it('should return null if start or end durations are not defined', () => {
      expect(formatTimeWindowDuration([] as any)).toBeNull();
      expect(formatTimeWindowDuration([null] as any)).toBeNull();
      expect(formatTimeWindowDuration([null, null])).toBeNull();
      expect(formatTimeWindowDuration([Long.ZERO, null])).toBeNull();
      expect(formatTimeWindowDuration([null, Long.ZERO])).toBeNull();
    });

    it('should format time window duration', () => {
      expect(formatTimeWindowDuration([Long.fromNumber(0), Long.fromNumber(3600)])).toEqual({
        startDate: formatDate(0, 'yyyy/MM/dd', 'en-us', 'UTC'),
        startTime: '12:00 am',
        endTime: '1:00 am',
      });
      expect(formatTimeWindowDuration([Long.fromNumber(0), Long.fromNumber(90000)])).toEqual({
        startDate: formatDate(0, 'yyyy/MM/dd', 'en-us', 'UTC'),
        startTime: '12:00 am',
        endDate: formatDate(new Date(90000 * 1000), 'yyyy/MM/dd', 'en-us', 'UTC'),
        endTime: '1:00 am',
      });
    });
  });

  describe('timeWindowHasTime', () => {
    it('should return false when no hard or soft start or end is defined', () => {
      expect(timeWindowHasTime({})).toBe(false);
    });

    it('should return true when at least one hard or soft start or end is defined', () => {
      expect(timeWindowHasTime({ startTime: { seconds: 0 } })).toBe(true);
      expect(timeWindowHasTime({ softStartTime: { seconds: 0 } })).toBe(true);
      expect(timeWindowHasTime({ endTime: { seconds: 0 } })).toBe(true);
      expect(timeWindowHasTime({ softEndTime: { seconds: 0 } })).toBe(true);

      expect(timeWindowHasTime({ startTime: { seconds: 0 }, softStartTime: { seconds: 0 } })).toBe(
        true
      );
      expect(
        timeWindowHasTime({
          startTime: { seconds: 0 },
          softStartTime: { seconds: 0 },
          endTime: { seconds: 0 },
        })
      ).toBe(true);
      expect(
        timeWindowHasTime({
          startTime: { seconds: 0 },
          softStartTime: { seconds: 0 },
          endTime: { seconds: 0 },
          softEndTime: { seconds: 0 },
        })
      ).toBe(true);
    });
  });

  describe('compareTimeWindows', () => {
    it('should return the difference between startTimeA and startTimeB', () => {
      expect(compareTimeWindows({}, {})).toBe(0);
      expect(
        compareTimeWindows({ startTime: { seconds: 100 } }, { startTime: { seconds: 10 } })
      ).toBe(90);
      expect(
        compareTimeWindows({ startTime: { seconds: 100 } }, { startTime: { seconds: 200 } })
      ).toBe(-100);
    });
  });
});
