/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IVehicleOperator } from './dispatcher.model';

export interface VehicleOperator extends IVehicleOperator {
  /** Equivalent to shipment route id */
  id: number;
  changeTime?: number;
}

export enum FormFields {
  Type = 'Type',
  Label = 'Label',
  StartTimeWindows = 'StartTimeWindows',
  EndTimeWindows = 'EndTimeWindows',
}
