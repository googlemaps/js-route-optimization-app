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

import { UntypedFormArray } from '@angular/forms';
import { detectTimeWindowOverlap, localDateTimeToUtcSeconds } from 'src/app/util';

/** Overlap validator for form array of {@link TimeWindowComponent} time window form groups */
export function overlapValidator(control: UntypedFormArray): { [error: string]: boolean } {
  if (control.length < 2) {
    return null;
  }

  const timeWindows = control.controls
    .filter((form) => form.valid)
    .map((form) => ({
      startTime:
        localDateTimeToUtcSeconds(form.get('startDate').value, form.get('startTime').value, 0) ||
        Number.MIN_SAFE_INTEGER,
      endTime:
        localDateTimeToUtcSeconds(form.get('endDate').value, form.get('endTime').value, 0) ||
        Number.MAX_SAFE_INTEGER,
    }));

  // Check every time window against every other time window
  if (detectTimeWindowOverlap(timeWindows)) {
    return { overlap: true };
  }
  return null;
}
