/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  IPrecedenceRule,
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  ITransitionAttributes,
} from '.';

/**
  Shallow representation of top-level properties of `ShipmentModel`
  (i.e. without Shipments, Vehicles, etc.)
*/
export interface NormalizedShipmentModel {
  globalDurationCostPerHour?: number;
  globalEndTime?: string | number;
  globalStartTime?: string | number;
  maxActiveVehicles?: number;
  precedenceRules?: IPrecedenceRule[];
  shipmentTypeIncompatibilities?: IShipmentTypeIncompatibility[];
  shipmentTypeRequirements?: IShipmentTypeRequirement[];
  transitionAttributes?: ITransitionAttributes[];
}
