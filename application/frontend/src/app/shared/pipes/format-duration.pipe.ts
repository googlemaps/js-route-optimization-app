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

import { Pipe, PipeTransform } from '@angular/core';

interface DurationUnit {
  label: UnitLabel;
  perMilliseconds: number;
  /** Optional threshold, otherwise perMilliseconds */
  thresholdMilliseconds?: number;
}

interface UnitLabel {
  abbr: string;
  one: string;
  other: string;
}

/** Formats a milliseconds duration value */
@Pipe({ name: 'formatDuration' })
export class FormatDurationPipe implements PipeTransform {
  /** Order matters, largest to smallest threshold */
  private static readonly units: DurationUnit[] = [
    { label: { abbr: 'd', one: 'day', other: 'days' }, perMilliseconds: 1000 * 60 * 60 * 24 },
    { label: { abbr: 'h', one: 'hour', other: 'hours' }, perMilliseconds: 1000 * 60 * 60 },
    { label: { abbr: 'm', one: 'minute', other: 'minutes' }, perMilliseconds: 1000 * 60 },
    {
      label: { abbr: 's', one: 'second', other: 'seconds' },
      perMilliseconds: 1000,
      thresholdMilliseconds: Number.MIN_VALUE,
    },
  ];

  transform(
    milliseconds?: number,
    fixed = false,
    precision = 2
  ): { unit: UnitLabel; value: string } {
    if (!isFinite(milliseconds)) {
      return;
    }
    if (!isFinite(precision) || precision < 0 || precision > 20) {
      precision = 0;
    }

    let value = milliseconds;
    let label: UnitLabel = { abbr: 'ms', one: 'millisecond', other: 'milliseconds' };
    for (const unit of FormatDurationPipe.units) {
      if (
        milliseconds >=
        (unit.thresholdMilliseconds != null ? unit.thresholdMilliseconds : unit.perMilliseconds)
      ) {
        value = milliseconds / unit.perMilliseconds;
        label = unit.label;
        break;
      }
    }
    const fixedValue = value.toFixed(precision);
    return {
      unit: label,
      value: (fixed ? fixedValue : +fixedValue) + '',
    };
  }
}
