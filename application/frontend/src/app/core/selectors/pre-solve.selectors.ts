/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
  (page) => page === Page.Shipments || page === Page.Vehicles
);

export const selectInactive = createSelector(selectActive, (active) => !active);
