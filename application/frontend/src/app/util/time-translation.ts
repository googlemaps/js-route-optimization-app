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
import { formatDate as ngFormatDate } from '@angular/common';
import { getNormalTimeString } from './datetime';

export const secondsPerDay = 86400;
const millisecondsPerDay = secondsPerDay * 1000;
const localeStringOptions: any = {
  timeZone: 'UTC',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
};

export const defaultDateFormat = 'yyyy/MM/dd';
export const defaultTimeFormat = 'h:mmaa';
export const defaultDateTimeFormat = 'yyyy/MM/dd h:mmaa';

export function timeToPixel(
  time: Long,
  startTime: Long,
  durationSeconds: Long,
  precision = 1000000
): number {
  if (durationSeconds.isZero()) {
    return 0;
  }
  const relativeTime = time.subtract(startTime);
  return relativeTime.multiply(precision).divide(durationSeconds).toNumber() / (precision || 1);
}

export function pixelToTime(
  px: number,
  usableWidth: number,
  startTime: Long,
  durationSeconds: Long
): Long {
  if (usableWidth === 0) {
    return Long.ZERO;
  }
  return Long.fromNumber(px).multiply(durationSeconds).divide(usableWidth).add(startTime);
}

export function formatDuration(
  seconds: number,
  relativeToSeconds?: number,
  locale = 'en-us'
): string {
  if (seconds == null || seconds === 0) {
    return new Date(0).toLocaleTimeString(locale, localeStringOptions);
  }

  const date = new Date(seconds * 1000);
  const time = formatTimeFromDate(date);
  if (relativeToSeconds == null) {
    return time;
  }
  const offset = (seconds - relativeToSeconds) / secondsPerDay;
  return formatTimeWithOffset(time, offset);
}

export function formatTime(
  seconds: number,
  relativeToSeconds?: number,
  timezoneOffset = 0,
  locale = 'en-us'
): string {
  if (seconds == null) {
    seconds = 0;
  }

  seconds += timezoneOffset;

  if (seconds === 0) {
    return new Date(0).toLocaleTimeString(locale, localeStringOptions);
  }
  const date = new Date(seconds * 1000);
  const time = formatTimeFromDate(date);
  if (relativeToSeconds == null) {
    return time;
  }
  const relativeTo = new Date(relativeToSeconds * 1000);
  const start = new Date(
    relativeTo.getUTCFullYear(),
    relativeTo.getUTCMonth(),
    relativeTo.getUTCDate(),
    0,
    0,
    0,
    0
  );
  const end = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0);
  const offset = (end.getTime() - start.getTime()) / millisecondsPerDay;
  return formatTimeWithOffset(time, offset);
}

function formatTimeFromDate(date: Date, locale = 'en-us'): string {
  return date.toLocaleTimeString(locale, localeStringOptions);
}

function formatTimeWithOffset(time: string, offset?: number): string {
  if (offset == null || offset === 0) {
    return time;
  }
  const wholeOffset = offset > 0 ? Math.floor(offset) : Math.ceil(offset);
  if (wholeOffset === 0) {
    return time;
  }
  return time + (wholeOffset > 0 ? '+' + wholeOffset : wholeOffset);
}

export function formatLongDuration(seconds: Long, relativeToSeconds?: Long): string {
  return formatDuration(
    seconds && seconds.toNumber(),
    relativeToSeconds && relativeToSeconds.toNumber()
  );
}

export function formatLongTime(
  seconds: Long,
  relativeToSeconds?: Long,
  timezoneOffset?: number
): string {
  return formatTime(
    seconds && seconds.toNumber(),
    relativeToSeconds && relativeToSeconds.toNumber(),
    timezoneOffset
  );
}

export function formatLongTimeExtent(
  extent: [Long, Long],
  relativeToSeconds?: Long,
  timezoneOffset?: number
): string {
  return (
    formatLongTime(extent[0], relativeToSeconds, timezoneOffset) +
    ' - ' +
    formatLongTime(extent[1], relativeToSeconds, timezoneOffset)
  );
}

export function formatDate(seconds: number, timezoneOffset = 0, locale = 'en-us'): string {
  const date = new Date(0);
  date.setUTCSeconds(seconds + timezoneOffset);
  return date.toLocaleDateString(locale);
}

export function formatSecondsDate(
  seconds: number,
  timezoneOffset = 0,
  format = defaultDateTimeFormat,
  locale = 'en-us'
): string {
  const myTimezoneOffset = Number.isFinite(timezoneOffset) ? timezoneOffset : 0;
  const mySeconds = seconds + myTimezoneOffset;
  const date = new Date(mySeconds * 1000);
  return ngFormatDate(date.getTime(), format, locale, 'UTC');
}

export function timeStringToSeconds(time: string): number {
  const splitTime = time.split(':');
  const hours = splitTime[0];
  const minutes = splitTime[1];
  const seconds = splitTime[2];

  const hourSeconds = parseInt(hours, 10) * 3600;
  const minuteSeconds = parseInt(minutes, 10) * 60;
  return hourSeconds + minuteSeconds + (seconds ? parseInt(seconds, 10) : 0);
}

export function timeToDate(seconds: Long, timezoneOffset = 0): Date {
  const date = new Date(seconds.toNumber() * 1000);
  date.setSeconds(date.getSeconds() + date.getTimezoneOffset() * 60 + timezoneOffset);
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  return date;
}

export function localDateToMidnightUtc(date: Date): number {
  return date.getTime() / 1000 - date.getTimezoneOffset() * 60;
}

export function localDateTimeToUtcSeconds(
  localDate: Date,
  localTime: string,
  timezoneOffset: number
): number {
  if (localDate == null || !Number.isFinite(timezoneOffset) || typeof localTime !== 'string') {
    return null;
  }
  // Adjust user selected time to UTC time of day
  const normalLocalTime = getNormalTimeString(localTime);
  const timeSeconds = normalLocalTime ? timeStringToSeconds(normalLocalTime) : 0;
  // Adjust selected date back to midnight UTC
  const dateSeconds = localDateToMidnightUtc(localDate);
  return timeSeconds + dateSeconds - timezoneOffset;
}
