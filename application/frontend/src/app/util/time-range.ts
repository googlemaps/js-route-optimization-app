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
import { ITimeWindow } from '../core/models';
import { durationSeconds } from './duration';
import { maxLong, minLong } from './long';

/**
 * Gets the available time range for supplied time extent and time windows.
 * @returns If extent duration > 0, returns a time range with min <= start <= end <= max; otherwise undefined
 * @param timeExtent extent in seconds
 * @remarks
 * Does not allow duration of extent to be less than or equal to 0 (i.e. timeExtent[1] - timeExtent[0] > 0
 * must be true).
 */
export const getAvailableTimeRange = (
  timeExtent: [Long, Long],
  startTimeWindows?: ITimeWindow[],
  endTimeWindows?: ITimeWindow[],
  timezoneOffset = 0
): { min: Long; start: Long; end: Long; max: Long } => {
  if (!timeExtent) {
    return;
  }
  // Is the extent valid?
  const [extentStartTime, extentEndTime] = timeExtent;
  if (extentStartTime >= extentEndTime) {
    return;
  }

  // Extract condensed time range
  const minStartTime = (startTimeWindows || []).reduce((minTime, timeWindow) => {
    const startTime = timeWindow?.startTime ? durationSeconds(timeWindow.startTime) : null;
    return minLong(minTime, startTime != null ? startTime : extentStartTime);
  }, Long.MAX_VALUE);
  const maxEndTime = (endTimeWindows || []).reduce((maxTime, timeWindow) => {
    const endTime = timeWindow?.endTime ? durationSeconds(timeWindow.endTime) : null;
    return maxLong(maxTime, endTime != null ? endTime : extentEndTime);
  }, Long.MIN_VALUE);

  const start = (minStartTime.equals(Long.MAX_VALUE) ? extentStartTime : minStartTime).add(
    timezoneOffset
  );
  const end = (maxEndTime.equals(Long.MIN_VALUE) ? extentEndTime : maxEndTime).add(timezoneOffset);
  const min = extentStartTime.add(timezoneOffset);
  const max = extentEndTime.add(timezoneOffset);
  return { min, max, start, end };
};
