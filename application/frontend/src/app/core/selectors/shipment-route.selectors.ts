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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as Long from 'long';
import { decodePath, durationSeconds, maxLong, minLong, pick } from 'src/app/util';
import { IBreak, RouteStats, ShipmentRoute, VisitVisitRequest } from '../models';
import * as fromShipmentRoute from '../reducers/shipment-route.reducer';
import * as fromUI from './ui.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';
import { Dictionary } from '@ngrx/entity';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectShipmentRouteState = createFeatureSelector<fromShipmentRoute.State>(
  fromShipmentRoute.shipmentRoutesFeatureKey
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromShipmentRoute.adapter.getSelectors(selectShipmentRouteState);

const selectRouteByIdFn = createSelector(
  selectEntities,
  (shipmentRoutes) => (routeId: number) => shipmentRoutes[routeId]
);

const selectOverviewPolylinePointsFn = createSelector(
  selectEntities,
  (shipmentRoutes) => (routeId: number) => shipmentRoutes[routeId]?.routePolyline?.points
);

const selectOverviewPolylinePathFn = createSelector(
  selectOverviewPolylinePointsFn,
  (pointsFn) => (routeId: number) => {
    const points = pointsFn(routeId);
    return points && decodePath(points);
  }
);

const selectOverviewPolylinePaths = createSelector(
  selectEntities,
  selectOverviewPolylinePathFn,
  (routes, pathFn) => {
    const paths: { [routeId: number]: google.maps.LatLng[] } = {};
    Object.values(routes).forEach((route) => (paths[route.id] = pathFn(route.id)));
    return paths;
  }
);

const getBounds = (path: google.maps.LatLng[]) => {
  const bounds = new google.maps.LatLngBounds();
  if (Array.isArray(path)) {
    path.forEach((vertex) => bounds.extend(vertex));
  }
  return bounds;
};

const selectBoundsFn = createSelector(
  selectOverviewPolylinePaths,
  (paths: { [routeId: number]: google.maps.LatLng[] }) => (routeId: number) =>
    getBounds(paths[routeId])
);

const selectAllBounds = createSelector(
  selectIds,
  selectBoundsFn,
  (routeIds: number[] | string[], boundsFn) => {
    const bounds = new google.maps.LatLngBounds();
    routeIds.forEach((routeId) => bounds.union(boundsFn(routeId)));
    return bounds;
  }
);

const selectClickedVehicleRoute = createSelector(
  selectEntities,
  fromUI.selectClickedVehicleId,
  (shipmentRoutes, vehicleId) => shipmentRoutes[vehicleId]
);

const selectClickedVisitRoute = createSelector(
  selectAll,
  fromUI.selectClickedVisitRequestId,
  (shipmentRoutes, visitId) =>
    shipmentRoutes.find((shipmentRoute) => shipmentRoute.visits.includes(visitId))
);

const getBreakStats = (breaks: IBreak[]) => {
  const stats: { min?: Long; max?: Long; sum: Long } = { min: null, max: null, sum: Long.ZERO };
  for (const brk of breaks) {
    const startTime = durationSeconds(brk.startTime);
    const duration = durationSeconds(brk.duration);
    if (startTime.lessThan(stats.min || Long.MAX_VALUE)) {
      stats.min = startTime;
    }
    const endTime = startTime.add(duration);
    if (endTime.greaterThan(stats.max || Long.MIN_VALUE)) {
      stats.max = endTime;
    }
    stats.sum = stats.sum.add(duration);
  }
  return stats;
};

const getServiceStats = (visitVisitRequests: VisitVisitRequest[]) => {
  const stats: { min?: Long; max?: Long; sum: Long } = { min: null, max: null, sum: Long.ZERO };
  for (const { visit, visitRequest } of visitVisitRequests) {
    const startTime = durationSeconds(visit.startTime);
    const duration = durationSeconds(visitRequest.duration);
    if (startTime.lessThan(stats.min || Long.MAX_VALUE)) {
      stats.min = startTime;
    }
    const endTime = startTime.add(duration);
    if (endTime.greaterThan(stats.max || Long.MIN_VALUE)) {
      stats.max = endTime;
    }
    stats.sum = stats.sum.add(duration);
  }
  return stats;
};

const getTravelStats = (route: ShipmentRoute) => {
  const stats: { min?: Long; max?: Long; sum: Long; distanceMeters: number } = {
    min: route.vehicleStartTime ? durationSeconds(route.vehicleStartTime) : null,
    max: route.vehicleEndTime ? durationSeconds(route.vehicleEndTime) : null,
    sum: Long.ZERO,
    distanceMeters: 0,
  };
  for (const transition of route.transitions || []) {
    stats.distanceMeters += transition.travelDistanceMeters || 0;
    stats.sum = stats.sum.add(durationSeconds(transition.travelDuration));
  }
  return stats;
};

/**
 * @remarks
 * Where traffic infeasibilities are present, clamp transition duration as it contributes to the
 * sum to the available duration.  This is to preserve representation of idle time consistent with
 * timelines.
 */
const getInfeasibleTravelStats = (
  route: ShipmentRoute,
  visitVisitRequests: VisitVisitRequest[]
) => {
  // With each visit's associated visit request derive visit end time; this is used to determine
  // the travel start time after the first transition (the first's is the vehicle start time).
  const stats: { min?: Long; max?: Long; sum: Long; distanceMeters: number } = {
    min: route.vehicleStartTime ? durationSeconds(route.vehicleStartTime) : null,
    max: route.vehicleEndTime ? durationSeconds(route.vehicleEndTime) : null,
    sum: Long.ZERO,
    distanceMeters: 0,
  };
  (route.transitions || []).forEach((transition, index) => {
    const { visit: prevVisit, visitRequest: prevVisitRequest } =
      visitVisitRequests[index - 1] || {};
    const { visit: nextVisit } = visitVisitRequests[index] || {};
    const startTime = prevVisit
      ? durationSeconds(prevVisit.startTime).add(durationSeconds(prevVisitRequest.duration))
      : durationSeconds(route.vehicleStartTime);
    const endTime = durationSeconds(nextVisit ? nextVisit.startTime : route.vehicleEndTime);

    const availableTravelDuration = endTime.subtract(startTime);
    const likelyTravelDuration = durationSeconds(transition.travelDuration);
    const travelDuration = minLong(likelyTravelDuration, availableTravelDuration);
    stats.distanceMeters += transition.travelDistanceMeters || 0;
    stats.sum = stats.sum.add(travelDuration);
  });
  return stats;
};

const selectRouteVisitIdsFn = createSelector(
  selectEntities,
  (routes) => (routeId: number) => routes[routeId]?.visits
);

const selectRoutesVisitIdsFn = createSelector(
  selectRouteVisitIdsFn,
  (routeVisitIdsFn) => (routeIds: number[]) => {
    const visitIds: number[] = [];
    routeIds.forEach((routeId) => {
      routeVisitIdsFn(routeId).forEach((visitId) => visitIds.push(visitId));
    });
    return visitIds;
  }
);

const selectRouteVisitRequestsFn = createSelector(
  selectRouteVisitIdsFn,
  fromVisitRequest.selectEntities,
  (routeVisitIdsFn, visitRequests) => (routeId: number) =>
    routeVisitIdsFn(routeId).map((visitId) => visitRequests[visitId])
);

const selectRouteVisitVisitRequestsFn = createSelector(
  selectEntities,
  fromVisit.selectEntities,
  fromVisitRequest.selectEntities,
  (routes, visits, visitRequests) => (routeId: number) =>
    routes[routeId]?.visits.map<VisitVisitRequest>((visitId) => ({
      visit: visits[visitId],
      visitRequest: visitRequests[visitId],
    }))
);

const selectStatsFn = createSelector(
  selectRouteByIdFn,
  selectRouteVisitVisitRequestsFn,
  (routeByIdFn, visitVisitRequestsFn) =>
    (routeId: number): RouteStats => {
      const shipmentRoute = routeByIdFn(routeId);
      if (!shipmentRoute) {
        return {};
      }

      // Route without visits is unused
      const visitVisitRequests = visitVisitRequestsFn(routeId);
      if (!visitVisitRequests?.length) {
        return {};
      }

      const breakStats = getBreakStats(shipmentRoute.breaks || []);
      const serviceStats = getServiceStats(visitVisitRequests);
      const travelStats = shipmentRoute.hasTrafficInfeasibilities
        ? getInfeasibleTravelStats(shipmentRoute, visitVisitRequests)
        : getTravelStats(shipmentRoute);
      const totalStats: { min?: Long; max?: Long } = { min: null, max: null };
      [travelStats, breakStats, serviceStats].forEach((local) => {
        totalStats.min = minLong(totalStats.min, local.min);
        totalStats.max = maxLong(totalStats.max, local.max);
      });

      const totalDuration = (totalStats.max || Long.ZERO).subtract(totalStats.min || Long.ZERO);
      const idleDuration = totalDuration.subtract(
        travelStats.sum.add(breakStats.sum).add(serviceStats.sum)
      );
      const shipmentCount = new Set<number>(
        visitVisitRequests.map((pair) => pair.visit.shipmentIndex || 0)
      ).size;
      return {
        startTime: totalStats.min,
        endTime: totalStats.max,
        breakDuration: breakStats.sum,
        idleDuration,
        serviceDuration: serviceStats.sum,
        travelDuration: travelStats.sum,
        travelDistanceMeters: travelStats.distanceMeters,
        totalDuration,
        shipmentCount,
      };
    }
);

const selectRouteByVisitId = (visitId: number) =>
  createSelector(selectAll, (routes: ShipmentRoute[]) => {
    for (const route of routes) {
      if (route.visits.includes(visitId)) {
        return route;
      }
    }
  });

const selectRoutesByVisitIds = (visitIds: number[]) =>
  createSelector(selectAll, (routes: ShipmentRoute[]) => {
    const matchingRoutes = routes.filter((route) =>
      route.visits.some((id) => visitIds.includes(id))
    );
    return matchingRoutes.reduce((map, route) => {
      map[route.id] = route;
      return map;
    }, {});
  });

const selectRoutesByIds = (routeIds: number[]) =>
  createSelector(selectEntities, (shipmentRoutes: Dictionary<ShipmentRoute>) =>
    pick(shipmentRoutes, routeIds)
  );

const selectVehicleByVisitId = (id: number) =>
  createSelector(
    selectRouteByVisitId(id),
    fromVehicle.selectEntities,
    (route, vehicles) => vehicles[route?.id]
  );

const selectRouteShipmentCount = (id: number) =>
  createSelector(
    selectStatsFn,
    (routeStatsFn: (id: number) => RouteStats) => routeStatsFn(id).shipmentCount
  );

const selectRouteIndexById = createSelector(
  selectIds,
  (ids: number[] | string[]) => new Map((ids as number[]).map((id, index) => [id, index]))
);

const selectRoutesDuration = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectEntities,
  selectStatsFn,
  (scenarioDuration, routes, statsFn): [Long, Long] => {
    if (!scenarioDuration) {
      scenarioDuration = [Long.ZERO, Long.ZERO];
    }
    const globalTime: { min?: Long; max?: Long } = { min: null, max: null };
    Object.values(routes).forEach((route) => {
      const { startTime, endTime } = statsFn(route.id);
      if (startTime && startTime.lessThan(globalTime.min || Long.MAX_VALUE)) {
        globalTime.min = startTime;
      }
      if (endTime && endTime.greaterThan(globalTime.max || Long.MIN_VALUE)) {
        globalTime.max = endTime;
      }
    });
    return [globalTime.min || scenarioDuration[0], globalTime.max || scenarioDuration[1]];
  }
);

export const selectVisitRequestStopOrder = createSelector(
  selectEntities,
  (routes) => {
    const stopOrders = {}
    Object.keys(routes).forEach(key => routes[key].visits.forEach((id, index) => {
      stopOrders[id] = index
    }));
    return stopOrders;
  }
)

export const ShipmentRouteSelectors = {
  selectRouteByIdFn,
  selectOverviewPolylinePointsFn,
  selectOverviewPolylinePathFn,
  selectOverviewPolylinePaths,
  getBounds,
  selectBoundsFn,
  selectAllBounds,
  selectClickedVehicleRoute,
  selectClickedVisitRoute,
  getBreakStats,
  getServiceStats,
  getTravelStats,
  selectRouteVisitIdsFn,
  selectRoutesVisitIdsFn,
  selectRouteVisitRequestsFn,
  selectRouteVisitVisitRequestsFn,
  selectStatsFn,
  selectRouteByVisitId,
  selectRoutesByVisitIds,
  selectRoutesByIds,
  selectVehicleByVisitId,
  selectRouteShipmentCount,
  selectRouteIndexById,
  selectRoutesDuration,
  selectVisitRequestStopOrder,
};

export default ShipmentRouteSelectors;
