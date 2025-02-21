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
import { IDistanceLimit } from 'src/app/core/models';
import Long from 'long';

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
