/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import * as fromShipments from 'src/app/core/selectors/shipment.selectors';
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
  fromShipments.selectAll,
  fromVisitRequests.selectAll,
  (shipments: Shipment[], visitRequests: VisitRequest[]) => {
    const demands = shipments
      .flatMap((s) => Array.from(Object.keys(s.loadDemands || {})))
      .concat(visitRequests.flatMap((vr) => Array.from(Object.keys(vr.loadDemands || {}))));

    return new Set(demands);
  }
);
