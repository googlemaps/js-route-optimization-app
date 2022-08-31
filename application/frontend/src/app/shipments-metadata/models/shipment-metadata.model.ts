/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  ITimeWindow,
  Shipment,
  ShipmentRoute,
  Vehicle,
  Visit,
  VisitRequest,
} from 'src/app/core/models';

export interface ShipmentMetadata {
  globalDuration?: [Long, Long];
  shipment: Shipment;
  shipmentRoute?: ShipmentRoute;
  vehicle?: Vehicle;
  visit?: Visit;
  visitRequest: VisitRequest;
  selected: boolean;
  skipped: boolean;
  skippedReasons?: string[];
  timeWindow?: ITimeWindow;
  traveledDistanceMeters?: number;
  vehicleIndex?: number;

  /** Whether this is the first item in a potential group of multiple visits */
  first?: boolean;
}
