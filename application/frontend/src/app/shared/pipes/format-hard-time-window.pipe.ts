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
