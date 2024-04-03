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

import { Timezone, utcTimezones } from 'src/app/shared/models';

export function matchTimezonesByOffset(zones: Timezone[], offset: number): Timezone[] {
  return zones.filter((tz) => tz.offset === offset);
}

export function getTimezonesByName(name: string): Timezone[] {
  const matches = utcTimezones.filter(
    (tz) =>
      tz.description.toLowerCase().replace('_', ' ').replace('(dst)', '').trim() ===
      name.toLowerCase().replace('_', ' ')
  );
  return matches;
}

export function getDstAdjustedUserTimezone(): Timezone {
  const name = getUserTimezoneName();
  const offset = getUserTimezoneOffset();

  const nameMatches = getTimezonesByName(name);
  const matches = matchTimezonesByOffset(nameMatches, offset);
  return matches ? matches[0] : null;
}

export function getUserTimezoneName(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function getUserTimezoneOffset(): number {
  // Offset in seconds to match internal timezone dataset
  // Number returned from getTimezoneOffset is the difference between UTC and local in minutes
  // So swapping the sign and multiplying by 60 gives the offset to apply to UTC times in the app
  return new Date().getTimezoneOffset() * -60;
}
