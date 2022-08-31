/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ShipmentRoute } from 'src/app/core/models';
import { google } from '@google-cloud/optimization/build/protos/protos';

export interface RouteMetadata {
  capacityUtilization: {
    name: string;
    used: number;
    total: number;
  }[];
  cost: number;
  endLocation: google.type.ILatLng;
  route: ShipmentRoute;
  selected: boolean;
  startLocation: google.type.ILatLng;
  totalDropoffs: number;
  totalPickups: number;
  totalShipments: number;
  traveledTime: number;
}
