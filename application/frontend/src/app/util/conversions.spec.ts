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

import {
  metersToMiles,
  milesToMeters,
  perKilometersToPerMiles,
  perMilesToPerKilometers,
  toFiniteOrNull,
} from '.';

describe('conversions', () => {
  it('should return value from toFiniteOrNull for number', () => {
    expect(toFiniteOrNull(123)).toEqual(123);
  });

  it('should return null from toFiniteOrNull for Infinity', () => {
    expect(toFiniteOrNull(Infinity)).toEqual(null);
  });

  it('should convert per kilometers to per miles', () => {
    expect(perKilometersToPerMiles(0.621371)).toBeCloseTo(1.0);
  });

  it('should convert per miles to per kilometers', () => {
    expect(perMilesToPerKilometers(1.0)).toBeCloseTo(0.621371);
  });

  it('should convert meters to miles', () => {
    expect(metersToMiles(1609.34)).toBeCloseTo(1.0);
  });

  it('should convert miles to meters', () => {
    expect(milesToMeters(1.0)).toBeCloseTo(1609.34);
  });
});
