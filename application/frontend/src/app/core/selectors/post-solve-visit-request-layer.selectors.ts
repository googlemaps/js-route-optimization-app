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
import { Page, VisitRequest } from '../models';
import RoutesChartSelectors from './routes-chart.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import { fromDispatcherToTurfPoint } from 'src/app/util';
import { Feature, Point } from '@turf/helpers';
import RoutesMetadataSelectors from './routes-metadata.selectors';
import * as fromUI from './ui.selectors';
import ShipmentRouteSelectors from './shipment-route.selectors';
import { selectVisitRequestStopOrder } from './shipment-route.selectors';

export const selectVisitRequests = createSelector(
  fromVisitRequest.selectAll,
  PreSolveShipmentSelectors.selectRequestedLookup,
  (visitRequests, requested) =>
    visitRequests.filter((visitRequest) => requested.has(visitRequest.shipmentId))
);

export const selectFilteredRouteVisitRequests = createSelector(
  RoutesChartSelectors.selectRoutes,
  RoutesChartSelectors.selectFilteredRouteIds,
  RoutesChartSelectors.selectHasActiveFilters,
  RoutesMetadataSelectors.selectFilteredRouteIds,
  RoutesMetadataSelectors.selectHasActiveFilters,
  fromUI.selectPage,
  selectVisitRequests,
  (
    allRoutes,
    chartRouteIds,
    chartHasFilters,
    tableRouteIds,
    tableHasFilters,
    page,
    visitRequests
  ) => {
    const hasFilter = page === Page.RoutesChart ? chartHasFilters : tableHasFilters;
    const routeIds = page === Page.RoutesChart ? chartRouteIds : new Set(tableRouteIds);
    if (!hasFilter) {
      return visitRequests;
    }
    const filteredVisitRequestIds = new Set<number>();
    allRoutes
      .filter((route) => routeIds.has(route.id))
      .forEach((route) => route.visits.forEach((id) => filteredVisitRequestIds.add(id)));
    return visitRequests.filter((v) => filteredVisitRequestIds.has(v.id));
  }
);

const selectSelectedRoutesVisitsIds = createSelector(
  RoutesChartSelectors.selectSelectedRoutes,
  RoutesMetadataSelectors.selectedSelectedRoutesIds,
  fromUI.selectPage,
  ShipmentRouteSelectors.selectRoutesVisitIdsFn,
  (chartSelectedRouteIds, tableSelectedRouteIds, page, routesVisitIdsFn) => {
    const routeIds = page === Page.RoutesChart ? chartSelectedRouteIds : tableSelectedRouteIds;
    return routesVisitIdsFn(routeIds);
  }
);

export const selectFilteredRouteVisitRequestsSelected = createSelector(
  selectSelectedRoutesVisitsIds,
  selectFilteredRouteVisitRequests,
  (selectedRouteVisitIds, visitRequests) => {
    return visitRequests.filter((v) => selectedRouteVisitIds.includes(v.id));
  }
);

export const selectSelectedRouteVisitRequests = createSelector(
  RoutesChartSelectors.selectSelectedRoutesVisitIds,
  selectVisitRequests,
  (selectedRouteVisitIds, visitRequests) => {
    return visitRequests.filter((v) => selectedRouteVisitIds.includes(v.id));
  }
);

const visitRequestToDeckGL = (visitRequest: VisitRequest, made: boolean) => {
  return {
    ...visitRequest,
    arrivalPosition: [
      visitRequest.arrivalWaypoint?.location?.latLng?.longitude,
      visitRequest.arrivalWaypoint?.location?.latLng?.latitude,
    ],
    departurePosition: visitRequest.departureWaypoint?.location?.latLng
      ? [
          visitRequest.departureWaypoint.location.latLng.longitude,
          visitRequest.departureWaypoint.location.latLng.latitude,
        ]
      : undefined,
    made,
  };
};

export const selectFilteredVisitRequests = createSelector(
  selectFilteredRouteVisitRequests,
  fromVisit.selectEntities,
  (visitRequests, visits) => {
    return visitRequests.map((visitRequest) => {
      const made = !!visits[visitRequest.id];
      return visitRequestToDeckGL(visitRequest, made);
    });
  }
);

export const selectFilteredVisitRequestsWithStopOrderAndSelectionStatus = createSelector(
  selectFilteredVisitRequests,
  selectFilteredRouteVisitRequestsSelected,
  selectVisitRequestStopOrder,
  fromVisit.selectEntities,
  RoutesChartSelectors.selectSelectedRoutesColors,
  (visitRequests, selectedVisitRequests, stopOrder, visits, colors) => {
    const visitRequestsWithOrder = [];
    visitRequests.forEach((vr) => {
      const made = !!visits[vr.id];
      visitRequestsWithOrder.push({
        ...vr,
        color: made ? colors[visits[vr.id].shipmentRouteId] : null,
        stopOrder: stopOrder[vr.id],
        selected: selectedVisitRequests.some((svr) => svr.id === vr.id),
      });
    });
    return visitRequestsWithOrder;
  }
);

export const selectFilteredVisitRequestsWithStopOrder = createSelector(
  selectFilteredVisitRequests,
  selectVisitRequestStopOrder,
  (visitRequests, stopOrder) => {
    const visitRequestsWithOrder = [];
    visitRequests.forEach((vr) =>
      visitRequestsWithOrder.push({ ...vr, stopOrder: stopOrder[vr.id] })
    );
    return visitRequestsWithOrder;
  }
);

export const selectFilteredVisitRequestsSelectedWithStopOrder = createSelector(
  selectFilteredRouteVisitRequestsSelected,
  selectVisitRequestStopOrder,
  fromVisit.selectEntities,
  RoutesChartSelectors.selectSelectedRoutesColors,
  (visitRequests, stopOrder, visits, colors) => {
    return visitRequests.map((visitRequest) => {
      const made = !!visits[visitRequest.id];
      return {
        ...visitRequestToDeckGL(visitRequest, made),
        color: made ? colors[visits[visitRequest.id].shipmentRouteId] : null,
        stopOrder: stopOrder[visitRequest.id],
      };
    });
  }
);

export const selectFilteredVisitRequestsSelected = createSelector(
  selectFilteredRouteVisitRequestsSelected,
  fromVisit.selectEntities,
  RoutesChartSelectors.selectSelectedRoutesColors,
  (visitRequests, visits, colors) => {
    return visitRequests.map((visitRequest) => {
      const made = !!visits[visitRequest.id];
      return {
        ...visitRequestToDeckGL(visitRequest, made),
        color: made ? colors[visits[visitRequest.id].shipmentRouteId] : null,
      };
    });
  }
);

export const selectSelectedVisitRequests = createSelector(
  selectSelectedRouteVisitRequests,
  fromVisit.selectEntities,
  RoutesChartSelectors.selectSelectedRoutesColors,
  (visitRequests, visits, colors) => {
    return visitRequests.map((visitRequest) => {
      const made = !!visits[visitRequest.id];
      return {
        ...visitRequestToDeckGL(visitRequest, made),
        color: made ? colors[visits[visitRequest.id].shipmentRouteId] : null,
      };
    });
  }
);

export const selectFilteredVisitRequestsTurfPoints = createSelector(
  selectFilteredRouteVisitRequests,
  fromVisit.selectEntities,
  (visitRequests, visits) => {
    const turfPoints: { [routeId: number]: Feature<Point> } = {};
    visitRequests.forEach((visitRequest) => {
      const feature = fromDispatcherToTurfPoint(visitRequest.arrivalWaypoint?.location?.latLng);
      feature.properties.shipmentRouteId = visits[visitRequest.id]
        ? visits[visitRequest.id].shipmentRouteId
        : undefined;
      feature.properties.made = !!visits[visitRequest.id];
      turfPoints[visitRequest.id] = feature;
    });
    return turfPoints;
  }
);

export const selectMouseOverVisitRequests = createSelector(
  selectFilteredVisitRequestsWithStopOrder,
  RoutesChartSelectors.selectSelectedRoutesVisitIds,
  fromVisit.selectEntities,
  RoutesChartSelectors.selectSelectedRoutesColors,
  RoutesChartSelectors.selectHoveredVisitIds,
  (filtered, selected, visits, colors, visitIds) => {
    return filtered
      .filter((visitRequest) => visitIds.includes(visitRequest.id))
      .map((visitRequest) => {
        const made = !!visits[visitRequest.id];
        return {
          ...visitRequestToDeckGL(visitRequest, made),
          color: made ? colors[visits[visitRequest.id].shipmentRouteId] : null,
          selected: made ? selected[visits[visitRequest.id].shipmentRouteId] : null,
        };
      });
  }
);
