/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { ValidationContext } from '../models';
import DenormalizeSelectors from './denormalize.selectors';
import * as fromShipmentRoute from './shipment-route.selectors';
import * as fromShipment from './shipment.selectors';
import { ShipmentModelSelectors } from './shipment-model.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';

export const selectValidateRequest = createSelector(
  DenormalizeSelectors.selectRequestShipments,
  DenormalizeSelectors.selectRequestVehicles,
  DenormalizeSelectors.selectIgnoredShipmentIds,
  DenormalizeSelectors.selectIgnoredVehicleIds,
  (shipments, vehicles, ignoreShipmentIds, ignoreVehicleIds) => ({
    shipments,
    vehicles,
    ignoreShipmentIds,
    ignoreVehicleIds,
  })
);

const selectValidationContextEntities = createSelector(
  fromShipmentRoute.selectEntities,
  fromShipment.selectEntities,
  fromVehicle.selectEntities,
  fromVisit.selectEntities,
  fromVisitRequest.selectEntities,
  (shipmentRoutes, shipments, vehicles, visits, visitRequests) => ({
    shipmentRoutes,
    shipments,
    vehicles,
    visits,
    visitRequests,
  })
);

export const selectValidationContext = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  ShipmentModelSelectors.selectShipmentTypeIncompatibilities,
  ShipmentModelSelectors.selectShipmentTypeRequirements,
  selectValidationContextEntities,
  fromVehicle.selectVehicleIndexById,
  (
    globalDuration,
    shipmentTypeIncompatibilities,
    shipmentTypeRequirements,
    entities,
    vehicleIndexById
  ): ValidationContext => ({
    globalDuration,
    shipmentTypeIncompatibilities,
    shipmentTypeRequirements,
    ...entities,
    vehicleIndexById,
  })
);
