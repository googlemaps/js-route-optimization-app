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
import { ValidationContext } from '../models';
import DenormalizeSelectors from './denormalize.selectors';
import * as fromShipmentRoute from './shipment-route.selectors';
import ShipmentSelectors from './shipment.selectors';
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
  ShipmentSelectors.selectEntities,
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
