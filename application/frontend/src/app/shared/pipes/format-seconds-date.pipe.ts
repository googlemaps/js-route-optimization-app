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
import { formatSecondsDate } from 'src/app/util';

/** Formats seconds as date */
@Pipe({ name: 'formatSecondsDate' })
export class FormatSecondsDatePipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(
    seconds: number | Long,
    timezoneOffset?: number,
    format = 'yyyy/MM/dd h:mm aa'
  ): string {
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
