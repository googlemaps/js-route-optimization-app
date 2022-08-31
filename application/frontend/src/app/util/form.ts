/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AbstractControl } from '@angular/forms';

export function setControlDisabled(control: AbstractControl, disabled: boolean): void {
  if (control.disabled === disabled) {
    return;
  }
  if (disabled) {
    control.disable();
  } else {
    control.enable();
  }
}

export function showError(...controls: AbstractControl[]): boolean {
  return controls?.filter(Boolean).every((c) => c.dirty || c.touched);
}
