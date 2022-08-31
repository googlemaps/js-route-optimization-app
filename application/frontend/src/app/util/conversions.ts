/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

const metersPerMile = 1609.34;

export function toFiniteOrNull(value: number): number {
  return Number.isFinite(+value) ? value : null;
}

export function perKilometersToPerMiles(perKilometers: number): number {
  return (perKilometers / 1000) * metersPerMile;
}

export function perMilesToPerKilometers(perMiles: number): number {
  return (perMiles * 1000) / metersPerMile;
}

export function metersToMiles(meters: number): number {
  return meters / metersPerMile;
}

export function milesToMeters(miles: number): number {
  return miles * metersPerMile;
}
