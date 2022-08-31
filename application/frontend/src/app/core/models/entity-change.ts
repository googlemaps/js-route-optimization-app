/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Shipment } from './shipment.model';
import { VisitRequest } from './visit-request.model';

export interface ShipmentChanges {
  shipment: {
    upsert: Shipment[];
  };
  visitRequest: {
    upsert: VisitRequest[];
    delete: number[];
  };
}
