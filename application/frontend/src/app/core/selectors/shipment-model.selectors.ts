/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
