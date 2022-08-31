/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { Page } from '../models';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import * as fromUI from './ui.selectors';

export const selectGenerateDisabled = createSelector(
  PreSolveShipmentSelectors.selectTotalSelected,
  PreSolveVehicleSelectors.selectTotalSelected,
  (totalShipmentsSelected, totalVehiclesSelected) => {
    return !(totalShipmentsSelected > 0 && totalVehiclesSelected > 0);
  }
);

export const selectActive = createSelector(
  fromUI.selectPage,
  (page) => page === Page.Shipments || page === Page.Vehicles || page === Page.VehicleOperators
);

export const selectInactive = createSelector(selectActive, (active) => !active);
