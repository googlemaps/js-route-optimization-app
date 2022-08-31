/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Shipment, VisitRequest } from 'src/app/core/models';

export interface ShipmentItem {
  shipment: Shipment;
  visitRequest: VisitRequest;

  /** Whether this is the first item in a potential group of multiple visit requests */
  first?: boolean;
}
