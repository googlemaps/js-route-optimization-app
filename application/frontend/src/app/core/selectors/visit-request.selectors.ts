/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getBounds } from 'src/app/util';
import { ILatLng, Shipment } from '../models';
import { VisitRequest } from '../models/visit-request.model';
import * as fromVisitRequest from '../reducers/visit-request.reducer';
import ShipmentSelectors, * as fromShipment from './shipment.selectors';
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
    fromShipment.selectEntities,
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
    fromShipment.selectEntities,
    selectEntities,
    (shipments: Dictionary<Shipment>, visitRequests: Dictionary<VisitRequest>) =>
      shipments[visitRequests[visitRequestId]?.shipmentId]
  );

const selectSkippedVisitRequests = createSelector(
  ShipmentSelectors.selectSkipped,
  fromShipment.selectEntities,
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
