/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
