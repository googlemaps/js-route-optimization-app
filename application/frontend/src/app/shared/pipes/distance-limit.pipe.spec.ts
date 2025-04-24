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

import { DistanceLimitPipe } from './distance-limit.pipe';

describe('DistanceLimitPipe', () => {
  const pipe = new DistanceLimitPipe();

  it('returns undefined when fed a null value', () => {
    expect(pipe.transform()).toBeUndefined();
    expect(pipe.transform(null)).toBeUndefined();
  });

  it('returns null values when fed null values', () => {
    expect(pipe.transform({})).toEqual({
      maxMeters: null,
      maxSoftMeters: null,
      costPerKilometerAfterSoftMax: null,
    });
  });

  it('returns numbers when fed numbers', () => {
    expect(
      pipe.transform({
        maxMeters: 100,
        softMaxMeters: 10,
        costPerKilometerBelowSoftMax: 5,
        costPerKilometerAboveSoftMax: 8,
      })
    ).toEqual({
      maxMeters: 100,
      maxSoftMeters: 10,
      costPerKilometerAfterSoftMax: 8,
    });
  });
});
