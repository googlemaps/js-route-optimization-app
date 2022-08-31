/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface LoadLimitFormValue {
  type: string;
  maxLoad?: number | Long | string;
  softMaxLoad?: number | Long | string;
  costPerUnitAboveSoftMax?: number;
  startLoadIntervalMin?: number | Long | string;
  startLoadIntervalMax?: number | Long | string;
  endLoadIntervalMin?: number | Long | string;
  endLoadIntervalMax?: number | Long | string;
}
