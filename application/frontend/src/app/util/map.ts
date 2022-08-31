/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { asyncScheduler, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';

export function onMapReady(
  map: google.maps.Map,
  callback: (map: google.maps.Map) => any,
  delay = 0
): void {
  timer(Math.max(0, delay), 100, asyncScheduler)
    .pipe(
      // Wait for the map to have width
      filter((i) => i > 9 || map.getDiv().clientWidth > 0),
      take(1)
    )
    .subscribe(() => callback(map));
}
