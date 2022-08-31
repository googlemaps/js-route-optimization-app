/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { IDuration, IDurationLimit } from 'src/app/core/models';
import { durationSeconds } from 'src/app/util';

/**
 * Converts a protobuf DurationLimit to an object.
 */
@Pipe({ name: 'durationLimit' })
export class DurationLimitPipe implements PipeTransform {
  transform(durationLimit?: IDurationLimit): {
    maxDuration: IDuration;
    softMaxDuration: IDuration;
    costPerHourAfterSoftMax: number;
  } {
    if (!durationLimit) {
      return;
    }
    const maxDuration = durationSeconds(durationLimit.maxDuration, null);
    const softMaxDuration = durationSeconds(durationLimit.softMaxDuration, null);
    const costPerHourAfterSoftMax = durationLimit.costPerHourAfterSoftMax;
    if (maxDuration == null && softMaxDuration == null && costPerHourAfterSoftMax == null) {
      return;
    }
    return {
      maxDuration: durationLimit.maxDuration,
      softMaxDuration: durationLimit.softMaxDuration,
      costPerHourAfterSoftMax,
    };
  }
}
