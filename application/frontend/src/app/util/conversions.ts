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
