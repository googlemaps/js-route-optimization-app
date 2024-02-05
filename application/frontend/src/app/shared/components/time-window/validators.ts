/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
