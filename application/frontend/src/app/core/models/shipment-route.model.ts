/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IShipmentRoute } from 'src/app/core/models';

export interface ShipmentRoute extends Omit<IShipmentRoute, 'visits'> {
  /** Equivalent to vehicle id */
  id: number;
  visits: number[];
  changeTime?: number;
}
