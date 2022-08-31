/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import * as Long from 'long';
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
