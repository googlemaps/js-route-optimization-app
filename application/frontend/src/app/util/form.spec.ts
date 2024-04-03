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
