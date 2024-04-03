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
import * as Long from 'long';
import { ITimeWindow } from 'src/app/core/models';
import { formatTimeWindowDuration, timeWindowToDuration } from 'src/app/util';

/** Formats a hard time window */
@Pipe({ name: 'formatHardTimeWindow' })
export class FormatHardTimeWindowPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(
    timeWindow: ITimeWindow,
    defaults?: [Long, Long],
    timezoneOffset?: number
  ): {
    startDate: string;
    startTime: string;
    endDate?: string;
    endTime: string;
  } {
    // if start or end is not set and no corresponding default is defined, return undefined
    if (
      (!timeWindow?.startTime && !(defaults?.length >= 1)) ||
      (!timeWindow?.endTime && !(defaults?.length >= 2))
    ) {
      return undefined;
    }

    const timeWindowDuration = timeWindowToDuration(
      timeWindow?.startTime,
      timeWindow?.endTime,
      defaults
    );
    return formatTimeWindowDuration(timeWindowDuration, this.locale, timezoneOffset || 0);
  }
}
