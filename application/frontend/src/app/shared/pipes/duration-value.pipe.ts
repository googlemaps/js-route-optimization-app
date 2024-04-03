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
