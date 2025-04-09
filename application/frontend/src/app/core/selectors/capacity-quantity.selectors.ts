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
import ShipmentSelectors from 'src/app/core/selectors/shipment.selectors';
import * as fromVehicles from 'src/app/core/selectors/vehicle.selectors';
import * as fromVisitRequests from 'src/app/core/selectors/visit-request.selectors';
import { Shipment, Vehicle, VisitRequest } from '../models';

export const selectUniqueCapacities = createSelector(
  fromVehicles.selectAll,
  (vehicles: Vehicle[]) => {
    const limits = vehicles.flatMap((v) => Array.from(Object.keys(v.loadLimits || {})));

    return new Set(limits);
  }
);

export const selectUniqueDemands = createSelector(
  ShipmentSelectors.selectAll,
  fromVisitRequests.selectAll,
  (shipments: Shipment[], visitRequests: VisitRequest[]) => {
    const demands = shipments
      .flatMap((s) => Array.from(Object.keys(s.loadDemands || {})))
      .concat(visitRequests.flatMap((vr) => Array.from(Object.keys(vr.loadDemands || {}))));

    return new Set(demands);
  }
);
