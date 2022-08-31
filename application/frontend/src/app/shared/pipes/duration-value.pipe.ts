/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { durationSeconds } from 'src/app/util';
import { google } from '@google-cloud/optimization/build/protos/protos';

/**
 * Converts a protobuf duration to seconds and optionally convert the value
 * by a supplied factor of units per second.
 */
@Pipe({ name: 'durationValue' })
export class DurationValuePipe implements PipeTransform {
  transform(duration?: google.protobuf.IDuration, unitsPerSecond = 1): number {
    const seconds = durationSeconds(duration, null);
    if (seconds == null) {
      return;
    }
    if (unitsPerSecond === 1 || !unitsPerSecond || !isFinite(unitsPerSecond)) {
      return seconds.toNumber();
    }
    return seconds.toNumber() * unitsPerSecond;
  }
}
