/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export function getCapacityQuantityRoot(type?: string): string {
  if (typeof type !== 'string') {
    return;
  }
  if (!type) {
    return type;
  }
  const index = type.indexOf('_');
  if (index === 0) {
    return '';
  }
  return index > 0 ? type.substring(0, index) : type;
}

export function getCapacityQuantityUnit(type?: string): string {
  if (typeof type !== 'string') {
    return;
  }
  if (!type) {
    return type;
  }
  const index = type.indexOf('_');
  if (index < 0) {
    return;
  }
  return type.substring(index + 1);
}

export function getUnitAbbreviation(
  unit?: string,
  abbreviations?: { [unit: string]: string }
): string {
  if (typeof unit === 'string') {
    return (abbreviations && abbreviations[unit.toLowerCase()]) || unit;
  }
}

export function getFullUnitFromAbbrevation(
  unit?: string,
  abbreviations?: { [unit: string]: string }
): string {
  if (typeof unit === 'string') {
    return (
      (abbreviations &&
        (Object.keys(abbreviations).filter((key) => abbreviations[key] === unit) || [unit])[0]) ||
      unit
    );
  }
}
