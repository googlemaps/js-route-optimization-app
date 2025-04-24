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

import { CapacityQuantityUnitPipe } from "./capacity-quantity-unit.pipe";


describe('CapacityQuantityUnitPipe', () => {
  const pipe = new CapacityQuantityUnitPipe();

  it('returns undefined when fed a null value', () => {
    expect(pipe.transform(null)).toBeUndefined();
  });

  it('returns undefined when value cannot be split', () => {
    expect(pipe.transform('label')).toBeUndefined();
  });

  it('returns default string when no abbreviations are provided', () => {
    expect(pipe.transform('weight_kilograms')).toBe('kilograms');
  });

  it('returns default string when abbreviations is not found', () => {
    expect(pipe.transform('weight_kilograms', { 'pounds': 'lb' })).toBe('kilograms');
  });

  it('returns abbreviation when provided', () => {
    expect(pipe.transform('weight_kilograms', { 'kilograms': 'kg' })).toBe('kg');
  });
});
