/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { setControlDisabled, showError } from './form';
import { UntypedFormControl } from '@angular/forms';

describe('form', () => {
  let control: UntypedFormControl;
  beforeEach(() => {
    control = new UntypedFormControl('');
  });

  it('should disable control', () => {
    setControlDisabled(control, true);
    expect(control.disabled).toBe(true);
  });

  it('should enable control', () => {
    setControlDisabled(control, false);
    expect(control.enabled).toBe(true);
  });

  it('should show error - control touched', () => {
    control.markAsTouched();
    expect(showError(control)).toBe(true);
  });

  it('should not show error - control untouched', () => {
    control.markAsUntouched();
    expect(showError(control)).toBe(false);
  });

  it('should show error - control dirty', () => {
    control.markAsDirty();
    expect(showError(control)).toBe(true);
  });

  it('should not show error - control pristine', () => {
    control.markAsPristine();
    expect(showError(control)).toBe(false);
  });

  it('should show error - control pristine and touched', () => {
    control.markAsPristine();
    control.markAsTouched();
    expect(showError(control)).toBe(true);
  });

  it('should not show error - control pristine and untouched', () => {
    control.markAsPristine();
    control.markAsUntouched();
    expect(showError(control)).toBe(false);
  });
});
