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

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { pick, pickBy } from 'src/app/util';
import { Visit } from '../models';
import * as fromVisit from '../reducers/visit.reducer';
import ShipmentSelectors, * as fromShipment from './shipment.selectors';
import * as fromVisitRequest from './visit-request.selectors';

export const selectVisitState = createFeatureSelector<fromVisit.State>(fromVisit.visitsFeatureKey);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromVisit.adapter.getSelectors(selectVisitState);

const selectById = (id: number) =>
  createSelector(selectEntities, (visits: Dictionary<Visit>) => visits[id]);

const selectByIds = (ids: number[]) =>
  createSelector(selectEntities, (visits: Dictionary<Visit>) => pick(visits, ids));

const selectVisitRequests = createSelector(
  selectIds,
  fromVisitRequest.selectEntities,
  (ids: number[] | string[], visitRequests) => ids.map((id) => visitRequests[id])
);

const selectVisitForEdit = (id: number, shipmentRouteId: number) =>
  createSelector(
    selectById(id),
    fromVisitRequest.selectEntities,
    fromVisitRequest.selectIds,
    (visit, visitRequests, ids: number[] | string[]): Visit => {
      if (visit) {
        return visit;
      }
      if (visitRequests[id]) {
        return {
          id,
          shipmentRouteId: shipmentRouteId ?? null,
        };
      }
      const nextId = ids.length ? Math.max.apply(null, ids) + 1 : 1;
      return {
        id: nextId,
        shipmentRouteId: shipmentRouteId ?? null,
      };
    }
  );

const selectDeliveryByShipmentId = (id: number) =>
  createSelector(ShipmentSelectors.selectById(id), selectEntities, (shipment, visits) =>
    fromShipment.getDelivery(shipment, visits)
  );

const selectPickupByShipmentId = (id: number) =>
  createSelector(ShipmentSelectors.selectById(id), selectEntities, (shipment, visits) =>
    fromShipment.getPickup(shipment, visits)
  );

const selectChangedVisitsFromIds = (ids: number[]) =>
  createSelector(selectByIds(ids), (visits: Dictionary<Visit>) =>
    pickBy(visits, (visit) => visit.changeTime)
  );

export const VisitSelectors = {
  selectById,
  selectByIds,
  selectVisitRequests,
  selectVisitForEdit,
  selectDeliveryByShipmentId,
  selectPickupByShipmentId,
  selectChangedVisitsFromIds,
};

export default VisitSelectors;
