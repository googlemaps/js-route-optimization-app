/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
