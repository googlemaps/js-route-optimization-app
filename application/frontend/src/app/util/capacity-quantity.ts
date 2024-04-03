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
