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
import { formatSecondsDate } from 'src/app/util';

/** Formats seconds as date */
@Pipe({ name: 'formatSecondsDate' })
export class FormatSecondsDatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(seconds: number | Long, timezoneOffset?: number, format = 'yyyy/MM/dd h:mmaa'): string {
    if (seconds != null) {
      return formatSecondsDate(
        Long.fromValue(seconds).toNumber(),
        timezoneOffset,
        format,
        this.locale
      );
    }
  }
}
