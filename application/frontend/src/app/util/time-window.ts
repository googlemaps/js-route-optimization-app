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
import { ITimestamp, ITimeWindow, IVisit } from '../core/models';
import { durationSeconds } from './duration';

export function getChosenTimeWindow(
  timeWindows: ITimeWindow[],
  startTime: ITimestamp
): ITimeWindow {
  if (!timeWindows) {
    return;
  }
  const startTimeSeconds = startTime ? durationSeconds(startTime) : null;
  if (startTimeSeconds === null) {
    return;
  }
  return timeWindows.find(
    (tw) =>
      startTimeSeconds.greaterThanOrEqual(
        tw.startTime ? durationSeconds(tw.startTime) : Long.MIN_VALUE
      ) &&
      startTimeSeconds.lessThanOrEqual(tw.endTime ? durationSeconds(tw.endTime) : Long.MAX_VALUE)
  );
}

export function getSoftStartTimeMissedSeconds(
  timeWindow: ITimeWindow,
  startTime: ITimestamp
): number {
  if (!(timeWindow?.softStartTime && startTime)) {
    return NaN;
  }
  return Math.max(
    0,
    durationSeconds(timeWindow.softStartTime).subtract(durationSeconds(startTime)).toNumber()
  );
}

export function getSoftStartTimeMissedCost(timeWindow: ITimeWindow, startTime: ITimestamp): number {
  const missedHours = getSoftStartTimeMissedSeconds(timeWindow, startTime) / 3600;
  const costPerHour = timeWindow?.costPerHourBeforeSoftStartTime
    ? timeWindow.costPerHourBeforeSoftStartTime
    : NaN;
  return missedHours * costPerHour;
}

export function getSoftEndTimeMissedSeconds(timeWindow: ITimeWindow, endTime: ITimestamp): number {
  if (!(timeWindow?.softEndTime && endTime)) {
    return NaN;
  }
  return Math.max(
    0,
    durationSeconds(endTime).subtract(durationSeconds(timeWindow.softEndTime)).toNumber()
  );
}

export function getSoftEndTimeMissedCost(timeWindow: ITimeWindow, startTime: ITimestamp): number {
  const missedHours = getSoftEndTimeMissedSeconds(timeWindow, startTime) / 3600;
  const costPerHour = timeWindow?.costPerHourAfterSoftEndTime
    ? timeWindow.costPerHourAfterSoftEndTime
    : NaN;
  return missedHours * costPerHour;
}

export function getSoftPenalty(
  timeWindow: ITimeWindow,
  visit: IVisit
): { early: boolean; seconds: number } {
  if (!visit) {
    return;
  }
  const earlySeconds = getSoftStartTimeMissedSeconds(timeWindow, visit.startTime);
  if (earlySeconds > 0) {
    return { early: true, seconds: earlySeconds };
  }
  const lateSeconds = getSoftEndTimeMissedSeconds(timeWindow, visit.startTime);
  if (lateSeconds > 0) {
    return { early: false, seconds: lateSeconds };
  }
}

export function formatTimeWindowDuration(
  duration: [Long, Long],
  locale = 'en-US',
  timezoneOffset = 0
): {
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
} {
  const startSeconds = duration[0]?.toNumber();
  const endSeconds = duration[1]?.toNumber();
  if (startSeconds == null || endSeconds == null) {
    return null;
  }

  const timezone = 'UTC';
  const startDateTime = new Date((startSeconds + timezoneOffset) * 1000);
  const formattedStartTime = formatDate(
    startDateTime,
    'h:mm aaa',
    locale,
    timezone
  ).toLocaleLowerCase(locale);
  const formattedStartDate = formatDate(startDateTime, 'yyyy/MM/dd', locale, timezone);
  const endDateTime = new Date((endSeconds + timezoneOffset) * 1000);
  const formattedEndTime = formatDate(endDateTime, 'h:mm aaa', locale, timezone).toLocaleLowerCase(
    locale
  );

  startDateTime.setUTCHours(0, 0, 0, 0);
  endDateTime.setUTCHours(0, 0, 0, 0);
  if (startDateTime.getTime() !== endDateTime.getTime()) {
    const formattedEndDate = formatDate(endDateTime, 'yyyy/MM/dd', locale, timezone);
    return {
      startDate: formattedStartDate,
      startTime: formattedStartTime,
      endDate: formattedEndDate,
      endTime: formattedEndTime,
    };
  }
  return {
    startDate: formattedStartDate,
    startTime: formattedStartTime,
    endTime: formattedEndTime,
  };
}

export function timeWindowHasTime(timeWindow: ITimeWindow): boolean {
  return (
    (timeWindow.startTime ||
      timeWindow.endTime ||
      timeWindow.softStartTime ||
      timeWindow.softEndTime) != null
  );
}

export function compareTimeWindows(a: ITimeWindow, b: ITimeWindow): number {
  return (
    durationSeconds(a.startTime, Long.MIN_VALUE).toNumber() -
    durationSeconds(b.startTime, Long.MIN_VALUE).toNumber()
  );
}
