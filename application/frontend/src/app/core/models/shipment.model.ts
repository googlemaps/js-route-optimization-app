/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IShipment } from 'src/app/core/models';

export interface Shipment extends Omit<IShipment, 'pickups' | 'deliveries'> {
  id: number;
  pickups: number[];
  deliveries: number[];
  changeTime?: number;
}
