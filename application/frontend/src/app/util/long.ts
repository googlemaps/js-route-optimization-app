/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as Long from 'long';

export function maxLong(a?: Long, b?: Long): Long {
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return a.greaterThan(b) ? a : b;
}

export function minLong(a?: Long, b?: Long): Long {
  if (a == null) {
    return b;
  }
  if (b == null) {
    return a;
  }
  return a.lessThan(b) ? a : b;
}
