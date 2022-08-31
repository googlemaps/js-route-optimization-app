/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import ShipmentRouteSelectors, * as fromShipmentRoute from './shipment-route.selectors';
import RoutesChartSelectors from './routes-chart.selectors';
import { ShipmentRoute } from '../models';
import { Feature, LineString } from '@turf/helpers';
import { toTurfLineString } from 'src/app/util';

const routeToDeckGL = (route: ShipmentRoute, path: google.maps.LatLng[]) => {
  return {
    ...route,
    path: path && path.map((p) => [p.lng(), p.lat()]),
  };
};

export const selectRoutes = createSelector(
  fromShipmentRoute.selectEntities,
  ShipmentRouteSelectors.selectOverviewPolylinePaths,
  (routes, paths) => {
    return Object.values(routes).map((route) => {
      const path = paths[route.id];
      return routeToDeckGL(route, path);
    });
  }
);

export const selectFilteredRoutes = createSelector(
  selectRoutes,
  RoutesChartSelectors.selectFilteredRouteIds,
  (paths, filteredRouteIds) => {
    return filteredRouteIds ? paths.filter((p) => filteredRouteIds.has(p.id)) : paths;
  }
);

export const selectFilteredRoutesSelected = createSelector(
  selectRoutes,
  RoutesChartSelectors.selectFilteredRouteIds,
  RoutesChartSelectors.selectSelectedRoutesLookup,
  RoutesChartSelectors.selectSelectedRoutesColors,
  (paths, filteredRouteIds, selectedRoutesLookup, colors) => {
    const selectedRoutes = paths.filter(
      (p) => (filteredRouteIds == null || filteredRouteIds.has(p.id)) && selectedRoutesLookup[p.id]
    );
    return selectedRoutes.map((route) => ({
      ...route,
      color: colors[route.id],
    }));
  }
);

export const selectFilteredRouteOverviewPolylinePaths = createSelector(
  RoutesChartSelectors.selectFilteredRoutes,
  ShipmentRouteSelectors.selectOverviewPolylinePaths,
  (routes, paths) => {
    const filteredPaths: { [routeId: number]: google.maps.LatLng[] } = {};
    routes.forEach((route) => (filteredPaths[route.id] = paths[route.id]));
    return filteredPaths;
  }
);

export const selectFilteredRouteTurfLineStrings = createSelector(
  selectFilteredRouteOverviewPolylinePaths,
  (paths) => {
    const turfLineStrings: { [routeId: number]: Feature<LineString> } = {};
    Object.keys(paths).forEach((id) => {
      turfLineStrings[+id] = paths[+id] ? toTurfLineString(paths[+id]) : undefined;
    });
    return turfLineStrings;
  }
);
