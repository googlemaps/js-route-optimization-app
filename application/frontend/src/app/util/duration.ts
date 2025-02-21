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
import { IDuration, ITimestamp } from '../core/models';

export function secondsToDuration(seconds?: number): IDuration | ITimestamp {
  return seconds > 0 ? { seconds } : null;
}

export function minutesToDuration(minutes?: number): IDuration | ITimestamp {
  return minutes > 0 ? { seconds: minutes * 60 } : null;
}

export function durationToMinutes(
  duration: IDuration | ITimestamp,
  defaultValue = Long.ZERO
): number | Long {
  const seconds = durationSeconds(duration, null);
  if (seconds == null) {
    return defaultValue;
  }
  return seconds.multiply(100).divide(60).toNumber() / 100;
}

export function secondsToFormattedTime(seconds: Long | number): string {
  seconds = Long.fromValue(seconds).toNumber();
  if (seconds == null) {
    return '00:00:00';
  }

  return new Date(1000 * seconds).toISOString().substring(11, 19);
}

export function formattedDurationSeconds(seconds: Long | number): string {
  if (!seconds) {
    return '0s';
  }

  seconds = Long.fromValue(seconds).toNumber();

  const days = Math.floor(seconds / 86400);
  seconds -= days * 86400;
  const hours = Math.floor(seconds / 3600);
  seconds -= hours * 3600;
  const minutes = Math.floor(seconds / 60);
  seconds -= minutes * 60;

  // Format string based on the highest unit of time in the duration
  if (days) {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }
  if (hours) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

export function durationSeconds(duration: IDuration | ITimestamp, defaultValue = Long.ZERO): Long {
  let seconds: Long;
  if (duration) {
    if (duration.seconds) {
      seconds = Long.fromValue(duration.seconds);
    }
    if (duration.nanos) {
      const fromNanos = Long.fromValue(duration.nanos).divide(1e9);
      seconds = seconds ? seconds.add(fromNanos) : fromNanos;
    }
  }
  return seconds == null ? defaultValue : seconds;
}

export function durationMinutesSeconds(
  duration: IDuration | ITimestamp,
  defaultValue = 0
): { minutes: number; seconds: number } {
  const seconds: any = durationSeconds(duration, null);
  if (seconds == null) {
    return {
      minutes: defaultValue,
      seconds: defaultValue,
    };
  }
  return {
    minutes: +Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0'),
    seconds: +Math.floor(seconds % 60)
      .toString()
      .padStart(2, '0'),
  };
}

export function pad(s: string): string {
  return s.length < 2 ? '0' + s : s;
}

export function timeWindowToDuration(
  startTime: ITimestamp,
  endTime: ITimestamp,
  defaults: [Long, Long]
): [Long, Long] {
  return [durationSeconds(startTime, defaults?.[0]), durationSeconds(endTime, defaults?.[1])];
}

export function durationToRequestString(duration: IDuration): string {
  return `${duration.seconds}s`;
}
