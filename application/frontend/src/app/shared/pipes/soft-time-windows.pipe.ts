/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ITimeWindow } from 'src/app/core/models';

/** Returns soft time windows */
@Pipe({ name: 'softTimeWindows' })
export class SoftTimeWindowsPipe implements PipeTransform {
  transform(timeWindows: ITimeWindow[]): ITimeWindow[] {
    return (
      timeWindows?.filter(
        (tw) => tw != null && (tw.softStartTime != null || tw.softEndTime != null)
      ) || []
    );
  }
}
