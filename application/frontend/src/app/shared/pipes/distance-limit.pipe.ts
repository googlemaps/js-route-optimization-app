/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { IDistanceLimit } from 'src/app/core/models';
import * as Long from 'long';

/**
 * Converts a protobuf DistanceLimit to an object.
 */
@Pipe({ name: 'distanceLimit' })
export class DistanceLimitPipe implements PipeTransform {
  transform(distanceLimit?: IDistanceLimit): {
    maxMeters: number;
    maxSoftMeters: number;
    costPerKilometerAfterSoftMax: number;
  } {
    if (!distanceLimit) {
      return;
    }
    const maxMeters = distanceLimit.maxMeters;
    const maxSoftMeters = distanceLimit.softMaxMeters;
    const costPerKilometerAfterSoftMax = distanceLimit.costPerKilometerAboveSoftMax;

    return {
      maxMeters: maxMeters ? Long.fromValue(maxMeters)?.toNumber() : null,
      maxSoftMeters: maxSoftMeters ? Long.fromValue(maxSoftMeters)?.toNumber() : null,
      costPerKilometerAfterSoftMax: costPerKilometerAfterSoftMax
        ? Long.fromValue(costPerKilometerAfterSoftMax)?.toNumber()
        : null,
    };
  }
}
