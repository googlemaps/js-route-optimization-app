/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IVehicle } from './dispatcher.model';

export interface Vehicle extends IVehicle {
  /** Equivalent to shipment route id */
  id: number;
  changeTime?: number;
}

export interface MapVehicle extends Vehicle {
  position: [number, number];
  heading: number;
  atDepot: boolean;
}
