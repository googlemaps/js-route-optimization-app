/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ShipmentRoute } from '.';

export interface RouteStats {
  startTime?: Long;
  endTime?: Long;
  breakDuration?: Long;
  idleDuration?: Long;
  serviceDuration?: Long;
  travelDuration?: Long;
  travelDistanceMeters?: number;
  totalDuration?: Long;
  shipmentCount?: number;
}

export interface DeckGLRoute extends ShipmentRoute {
  path: number[][];
}
