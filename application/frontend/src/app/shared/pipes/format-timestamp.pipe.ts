/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { ITimestamp } from 'src/app/core/models';
import { durationSeconds, formatSecondsDate } from 'src/app/util';

/** Formats a timestamp */
@Pipe({ name: 'formatTimestamp' })
export class FormatTimestampPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(timestamp: ITimestamp, timezoneOffset?: number, format = 'yyyy/MM/dd h:mmaa'): string {
    if (timestamp) {
      return formatSecondsDate(
        durationSeconds(timestamp).toNumber(),
        timezoneOffset,
        format,
        this.locale
      );
    }
  }
}
