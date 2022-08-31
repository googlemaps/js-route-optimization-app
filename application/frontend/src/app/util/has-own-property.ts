/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export function boundHasOwnProperty(root: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.bind(root).call(root, property);
}

export function hasOwnProperty(root: object, property: string): boolean {
  return Object.prototype.hasOwnProperty.call(root, property);
}
