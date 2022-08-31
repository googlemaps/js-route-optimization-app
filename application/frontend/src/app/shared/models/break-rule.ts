/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface BreakRuleValue {
  earliestStartTime?: string;
  minDuration?: { min: number; sec: number };
}
