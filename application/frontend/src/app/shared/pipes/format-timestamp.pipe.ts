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
import { ITimestamp } from 'src/app/core/models';
import { durationSeconds, formatSecondsDate } from 'src/app/util';

/** Formats a timestamp */
@Pipe({ name: 'formatTimestamp' })
export class FormatTimestampPipe implements PipeTransform {
  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(timestamp: ITimestamp, timezoneOffset?: number, format = 'yyyy/MM/dd h:mm aa'): string {
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
