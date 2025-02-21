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

import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import Long from 'long';
import { ITimeWindow } from 'src/app/core/models';
import { formatTimeWindowDuration, timeWindowToDuration } from 'src/app/util';

/** Formats a soft time window */
@Pipe({ name: 'formatSoftTimeWindow' })
export class FormatSoftTimeWindowPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(
    timeWindow: ITimeWindow,
    defaults: [Long, Long],
    timezoneOffset?: number
  ): { startDate: string; startTime: string; endDate?: string; endTime: string } {
    if (timeWindow && defaults && (timeWindow.softStartTime || timeWindow.softEndTime)) {
      const hardTimeWindowDuration = timeWindowToDuration(
        timeWindow.startTime,
        timeWindow.endTime,
        defaults
      );
      const softTimeWindowDuration = timeWindowToDuration(
        timeWindow.softStartTime,
        timeWindow.softEndTime,
        hardTimeWindowDuration
      );
      return formatTimeWindowDuration(softTimeWindowDuration, this.locale, timezoneOffset || 0);
    }
  }
}
