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
import { getBounds } from 'src/app/util';
import { ILatLng, Shipment } from '../models';
import { VisitRequest } from '../models/visit-request.model';
import * as fromVisitRequest from '../reducers/visit-request.reducer';
import ShipmentSelectors from './shipment.selectors';
import * as fromUI from './ui.selectors';

export const selectVisitRequestState = createFeatureSelector<fromVisitRequest.State>(
  fromVisitRequest.visitRequestsFeatureKey
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromVisitRequest.adapter.getSelectors(selectVisitRequestState);

const selectById = (id: number) =>
  createSelector(selectEntities, (visitRequests: Dictionary<VisitRequest>) => visitRequests[id]);

const selectShipmentsVisitRequests = (shipmentIds: number[]) =>
  createSelector(
    ShipmentSelectors.selectEntities,
    selectEntities,
    (shipments: Dictionary<Shipment>, visitRequests: Dictionary<VisitRequest>) => {
      const shipmentsVisitRequests: VisitRequest[] = [];
      shipmentIds.forEach((shipmentId) => {
        const shipment = shipments[shipmentId];
        if (!shipment) {
          return;
        }
        shipmentsVisitRequests.push(
          ...shipment.pickups.map((visitRequestId) => visitRequests[visitRequestId]),
          ...shipment.deliveries.map((visitRequestId) => visitRequests[visitRequestId])
        );
      });
      return shipmentsVisitRequests;
    }
  );

const selectVisitRequestShipment = (visitRequestId: number) =>
  createSelector(
    ShipmentSelectors.selectEntities,
    selectEntities,
    (shipments: Dictionary<Shipment>, visitRequests: Dictionary<VisitRequest>) =>
      shipments[visitRequests[visitRequestId]?.shipmentId]
  );

const selectSkippedVisitRequests = createSelector(
  ShipmentSelectors.selectSkipped,
  ShipmentSelectors.selectEntities,
  selectEntities,
  (skipped, shipments, visitRequests) => {
    const skippedVisitRequests: VisitRequest[] = [];
    skipped.forEach((shipmentId) => {
      skippedVisitRequests.push(
        ...shipments[shipmentId].pickups.map((visitRequestId) => visitRequests[visitRequestId]),
        ...shipments[shipmentId].deliveries.map((visitRequestId) => visitRequests[visitRequestId])
      );
    });
    return skippedVisitRequests;
  }
);

const selectAllBounds = createSelector(selectAll, (visitRequests) => {
  const locations: ILatLng[] = [];
  visitRequests.forEach((v) =>
    locations.push(v.arrivalWaypoint?.location?.latLng, v.departureWaypoint?.location?.latLng)
  );
  return getBounds(locations);
});

const selectVisitTypes = createSelector(selectAll, (visitRequests) => {
  const visitTypes = new Set<string>();
  visitRequests.forEach((visitRequest) => {
    visitRequest.visitTypes?.forEach((visitType) => visitTypes.add(visitType));
  });
  return visitTypes;
});

const selectVisitTags = createSelector(selectAll, (visitRequests) => {
  const visitTags = new Set<string>();
  visitRequests.forEach((visitRequest) => {
    visitRequest.tags?.forEach((tag) => visitTags.add(tag));
  });
  return visitTags;
});

const selectClickedVisitRequest = createSelector(
  selectEntities,
  fromUI.selectClickedVisitRequestId,
  (visitRequests, id) => visitRequests[id]
);

const selectChangeTime = createSelector(selectVisitRequestState, fromVisitRequest.selectChangeTime);

const selectNextVisitRequestId = createSelector(selectIds, (ids: number[] | string[]) =>
  ids.length ? Math.max.apply(null, ids) + 1 : 1
);

const selectVisitRequestsByIds = (ids: number[]) =>
  createSelector(selectEntities, (visitRequests: Dictionary<VisitRequest>) =>
    ids.map((id) => visitRequests[id])
  );

export const VisitRequestSelectors = {
  selectNextVisitRequestId,
  selectVisitRequestsByIds,
  selectChangeTime,
  selectClickedVisitRequest,
  selectVisitTags,
  selectVisitTypes,
  selectAllBounds,
  selectSkippedVisitRequests,
  selectVisitRequestShipment,
  selectShipmentsVisitRequests,
  selectById,
};

export default VisitRequestSelectors;
