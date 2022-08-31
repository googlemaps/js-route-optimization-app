/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import ShipmentSelectors from './shipment.selectors';

export const selectSkippedShipmentsLookup = createSelector(
  ShipmentSelectors.selectSkipped,
  PreSolveShipmentSelectors.selectRequestedLookup,
  (shipments, requested) => new Set(shipments.filter((id) => requested.has(id)))
);

export const selectTotalSkippedShipments = createSelector(
  selectSkippedShipmentsLookup,
  (lookup) => lookup.size
);
