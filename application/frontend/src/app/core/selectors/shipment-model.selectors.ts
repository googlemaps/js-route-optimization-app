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

import * as fromShipmentModel from '../reducers/shipment-model.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as Long from 'long';

export const selectShipmentModelState = createFeatureSelector<fromShipmentModel.State>(
  fromShipmentModel.shipmentModelFeatureKey
);

const selectGlobalDurationCostPerHour = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectGlobalDurationCostPerHour
);

const selectMaxActiveVehicles = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectMaxActiveVehicles
);

const selectGlobalStartTime = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectGlobalStartTime
);

const selectGlobalEndTime = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectGlobalEndTime
);

const selectGlobalDuration = createSelector(
  selectGlobalStartTime,
  selectGlobalEndTime,
  (start, end): [Long, Long] => {
    return start != null && end != null ? [Long.fromValue(start), Long.fromValue(end)] : null;
  }
);

const selectPrecedenceRules = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectPrecedenceRules
);

const selectShipmentTypeIncompatibilities = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectShipmentTypeIncompatibilities
);

const selectShipmentTypeRequirements = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectShipmentTypeRequirements
);

const selectTransitionAttributes = createSelector(
  selectShipmentModelState,
  fromShipmentModel.selectTransitionAttributes
);

export const ShipmentModelSelectors = {
  selectGlobalDuration,
  selectGlobalDurationCostPerHour,
  selectGlobalEndTime,
  selectGlobalStartTime,
  selectMaxActiveVehicles,
  selectPrecedenceRules,
  selectShipmentTypeIncompatibilities,
  selectShipmentTypeRequirements,
  selectTransitionAttributes,
};

export default ShipmentModelSelectors;
