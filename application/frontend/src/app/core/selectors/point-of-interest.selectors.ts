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
import { createFeatureSelector, createSelector, MemoizedSelector } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import {
  durationSeconds,
  fromDispatcherLatLng,
  maxLong,
  minLong,
  pointsAreCoincident,
} from 'src/app/util';
import {
  ILatLng,
  PointOfInterest,
  PointOfInterestCategory,
  ShipmentRoute,
  Vehicle,
  Visit,
  VisitCategory,
  VisitVisitRequest,
} from '../models';
import * as fromPointsOfInterest from '../reducers/points-of-interest.reducer';
import * as fromDepot from './depot.selectors';
import ShipmentRouteSelectors, * as fromShipmentRoute from './shipment-route.selectors';
import ShipmentSelectors, * as fromShipment from './shipment.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';

const visitCategoryToPointOfInterestCategory = {
  [VisitCategory.Pickup]: PointOfInterestCategory.Pickup,
  [VisitCategory.Delivery]: PointOfInterestCategory.Delivery,
  [VisitCategory.ServiceCall]: PointOfInterestCategory.ServiceCall,
};

/**
 * @remarks
 * Assumes visits are ordered ascending chronologically
 */
const getRouteStartLocation = (
  vehicle: Vehicle,
  visitVisitRequests: VisitVisitRequest[]
): ILatLng => {
  const { startWaypoint } = vehicle;
  if (startWaypoint?.location?.latLng) {
    return startWaypoint.location.latLng;
  }
  if (visitVisitRequests.length) {
    const { visitRequest } = visitVisitRequests[0];
    return (
      visitRequest.departureWaypoint?.location?.latLng ||
      visitRequest.arrivalWaypoint?.location?.latLng
    );
  }
};

/**
 * @remarks
 * Assumes visits are ordered ascending chronologically
 */
const getRouteEndLocation = (
  vehicle: Vehicle,
  visitVisitRequests: VisitVisitRequest[]
): ILatLng => {
  const { endWaypoint } = vehicle;
  if (endWaypoint?.location?.latLng) {
    return endWaypoint.location.latLng;
  }
  if (visitVisitRequests.length) {
    const { visitRequest } = visitVisitRequests[visitVisitRequests.length - 1];
    return visitRequest.arrivalWaypoint?.location?.latLng;
  }
};

const getVisitPointsOfInterest = (visit: Visit): PointOfInterest => {
  const startTime = visit.startTime ? durationSeconds(visit.startTime) : null;
  if (startTime != null) {
    const visitCategory = !visit.isPickup ? VisitCategory.Delivery : VisitCategory.Pickup;
    return [visit.id, visitCategoryToPointOfInterestCategory[visitCategory], startTime];
  }
};

const getPointsOfInterest = (
  depot: ILatLng,
  route: ShipmentRoute,
  vehicle: Vehicle,
  visitVisitRequests: VisitVisitRequest[]
): PointOfInterest[] | undefined => {
  if (!route || !visitVisitRequests?.length) {
    return [];
  }

  const pointsOfInterest: PointOfInterest[] = [];
  visitVisitRequests.forEach(({ visit }) => {
    const poi = getVisitPointsOfInterest(visit);
    if (poi) {
      pointsOfInterest.push(poi);
    }
  });

  // Create depot POIs when a depot is present
  const depotLatLng = depot && fromDispatcherLatLng(depot);
  if (depotLatLng) {
    const vehicleStartTime = route.vehicleStartTime
      ? durationSeconds(route.vehicleStartTime)
      : null;

    // If the vehicle starts at the depot, create a depot POI
    const startLocation = getRouteStartLocation(vehicle, visitVisitRequests);
    if (startLocation && pointsAreCoincident(fromDispatcherLatLng(startLocation), depotLatLng)) {
      // Place POI at vehicle start time or first visit start time, whichever's lesser;
      // first visit start time is taken into account to handle situations where the visit
      // has been moved such that it precedes the vehicle start time as determined by the
      // Cloud Fleet Routing API.
      // Assumes visits ordered ascending chronologically
      const visitStartTime = visitVisitRequests[0].visit.startTime;
      const firstVisitStartTime = minLong(
        vehicleStartTime,
        visitStartTime ? durationSeconds(visitStartTime) : vehicleStartTime
      );
      pointsOfInterest.splice(0, 0, [null, PointOfInterestCategory.Depot, firstVisitStartTime]);
    }

    // If the vehicle ends at the depot, create a depot POI
    const endLocation = getRouteEndLocation(vehicle, visitVisitRequests);
    if (endLocation && pointsAreCoincident(fromDispatcherLatLng(endLocation), depotLatLng)) {
      // Place POI at vehicle end time or last visit end time, whichever's greater;
      // last visit end time is taken into account to handle situations where the visit
      // has been moved such that it exceeds the vehicle end time as determined by the
      // Cloud Fleet Routing API.
      // Assumes visits ordered ascending chronologically
      const vehicleEndTime = route.vehicleEndTime ? durationSeconds(route.vehicleEndTime) : null;
      const lastVisitVisitRequest = visitVisitRequests[visitVisitRequests.length - 1];
      const lastVisitStartTime = lastVisitVisitRequest.visit.startTime
        ? durationSeconds(lastVisitVisitRequest.visit.startTime)
        : vehicleStartTime;
      const lastVisitEndTime = maxLong(
        lastVisitStartTime.add(durationSeconds(lastVisitVisitRequest.visitRequest.duration)),
        vehicleEndTime
      );
      pointsOfInterest.splice(0, 0, [null, PointOfInterestCategory.Depot, lastVisitEndTime]);
    }
  }
  return pointsOfInterest;
};

export const selectPointsOfInterest = (routeId: number) =>
  createSelector(
    fromDepot.selectDepot,
    fromShipmentRoute.selectEntities,
    fromVehicle.selectByIdFn,
    ShipmentRouteSelectors.selectRouteVisitVisitRequestsFn,
    (depot, routes: Dictionary<ShipmentRoute>, vehicleByIdFn, routeVisitVisitRequestsFn) =>
      getPointsOfInterest(
        depot,
        routes[routeId],
        vehicleByIdFn(routeId),
        routeVisitVisitRequestsFn(routeId)
      )
  );

/** Creates a memoized selector for each route's points of interest */
export const selectPointsOfInterestSelectors = createSelector(
  fromShipmentRoute.selectEntities,
  (routes) => {
    const lookup: {
      [id: number]: MemoizedSelector<fromRoot.State, PointOfInterest[] | undefined>;
    } = {};
    Object.values(routes).forEach(
      (route) => (lookup[route.id] = selectPointsOfInterest(route?.id))
    );
    return lookup;
  }
);

export const selectPointsOfInterestState = createFeatureSelector<fromPointsOfInterest.State>(
  fromPointsOfInterest.poiFeatureKey
);

export const selectDragStart = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectDragStart
);

export const selectDragEnd = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectDragEnd
);

export const selectIsDragging = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectIsDragging
);

export const selectSavePending = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectSavePending
);

export const selectSaveChanges = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectSaveChanges
);

export const selectSaveError = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectSaveError
);

export const selectDragVisitId = createSelector(selectDragStart, (start) => start?.visitId);

export const selectOverlapTimeline = createSelector(
  selectPointsOfInterestState,
  fromPointsOfInterest.selectOverlapTimeline
);

export const selectOverlapTimelineId = createSelector(
  selectOverlapTimeline,
  (timeline) => timeline?.id
);

export const selectOverlapTimelineY = createSelector(
  selectOverlapTimeline,
  (timeline) => timeline?.y
);

export const selectCurrentDragVisit = createSelector(
  selectDragStart,
  fromVisit.selectEntities,
  (dragStart, visits: Dictionary<Visit>) => (dragStart ? visits[dragStart.visitId] : null)
);

export const selectDragShipment = createSelector(
  selectDragStart,
  ShipmentSelectors.selectEntities,
  fromVisitRequest.selectEntities,
  (dragStart, shipments, visitRequests) => shipments[visitRequests[dragStart?.visitId]?.shipmentId]
);

export const selectDragVisitsToEdit = createSelector(
  selectDragShipment,
  fromVisit.selectEntities,
  (shipment, visits) =>
    [fromShipment.getPickup(shipment, visits), fromShipment.getDelivery(shipment, visits)].filter(
      Boolean
    )
);

export const selectVehicleByOverlap = createSelector(
  selectOverlapTimelineId,
  fromVehicle.selectEntities,
  (id, vehicles: Dictionary<Vehicle>) => vehicles[id]
);

const selectSaveChangesVisitIds = createSelector(selectSaveChanges, (changes) =>
  changes ? new Set(changes.visits.map((visit) => visit.id)) : null
);

export const selectPendingOldVisitIds = (routeId: number) =>
  createSelector(
    selectSaveChangesVisitIds,
    ShipmentRouteSelectors.selectRouteByIdFn,
    (changesVisitIds: Set<number>, routeByIdFn: (id: number) => ShipmentRoute) => {
      const visitIds =
        changesVisitIds?.size &&
        routeByIdFn(routeId)?.visits?.filter((id) => changesVisitIds.has(id));
      if (visitIds?.length) {
        return new Set(visitIds);
      }
    }
  );

export const selectPendingNewPois = (routeId: number) =>
  createSelector(selectSaveChanges, (changes: { visits: Visit[] }) => {
    return changes?.visits
      .filter((visit) => visit.shipmentRouteId === routeId)
      .map((visit) => getVisitPointsOfInterest(visit));
  });
