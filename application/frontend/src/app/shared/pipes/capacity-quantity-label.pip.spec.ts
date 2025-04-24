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

import { CapacityQuantityLabelPipe } from './capacity-quantity-label.pipe';

describe('CapacityQuantityLabelPipe', () => {
  const pipe = new CapacityQuantityLabelPipe();

  it('returns undefined when fed a null value', () => {
    expect(pipe.transform(null)).toBeUndefined();
  });

  it('returns undefined when fed an empty string', () => {
    expect(pipe.transform('')).toBeUndefined();
  });

  it('capitalizes a valid string by default', () => {
    expect(pipe.transform('label')).toBe('Label');
  });

  it('does not capitalize a valid string', () => {
    expect(pipe.transform('label', false)).toBe('label');
  });
});
