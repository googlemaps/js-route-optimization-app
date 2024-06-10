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
import buffer from '@turf/buffer';
import lineIntersect from '@turf/line-intersect';
import {
  bufferBounds,
  computeHeadingAlongPath,
  durationSeconds,
  findNearestCandidatePointToTargetAlongPath,
  findPathHeadingAtPointOptimized,
  fromDispatcherLatLng,
  fromTurfPoint,
  getPointAlongPathByDistance,
  pointsAreCoincident,
  toTurfLineString,
  toTurfPoint,
} from 'src/app/util';
import { ILatLng, Page, TravelMode, ShipmentRoute, VisitRequest } from '../models';
import * as fromDepot from './depot.selectors';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import RoutesChartSelectors from './routes-chart.selectors';
import ShipmentRouteSelectors from './shipment-route.selectors';
import { selectPage } from './ui.selectors';
import * as fromVehicle from './vehicle.selectors';
import VisitSelectors from './visit.selectors';
import VisitRequestSelectors from './visit-request.selectors';
import * as fromMap from '../reducers/map.reducer';
import { MapLayer, MapLayerId } from '../models/map';
import TravelSimulatorSelectors from './travel-simulator.selectors';
import * as fromShipmentRoute from './shipment-route.selectors';
import Long from 'long';

type MapLatLng = google.maps.LatLng;

export const selectMapState = createFeatureSelector<fromMap.State>(fromMap.mapFeatureKey);

const findAlternativeStartLocation = (path: MapLatLng[]): MapLatLng => {
  const distanceAlongPath = google.maps.geometry.spherical.computeLength(path) / 10;
  return getPointAlongPathByDistance(path, distanceAlongPath);
};

export const getVehicleStartingLocation = (
  path: MapLatLng[],
  bufferDistance: number,
  occupiedStartLocations: MapLatLng[]
): MapLatLng => {
  const startingPoint = toTurfPoint(path[0]);
  const buffered = buffer(startingPoint, bufferDistance, { units: 'meters' });
  const route = toTurfLineString(path);
  const intersectingPoints = lineIntersect(route, buffered);

  let vehicleStartLocation: MapLatLng;
  if (intersectingPoints.features.length === 1) {
    vehicleStartLocation = fromTurfPoint(intersectingPoints.features[0].geometry);
  } else if (intersectingPoints.features.length === 0) {
    // eslint-disable-next-line no-console
    console.log(
      'Vehicle starting position not found using buffer.  Using distance along path instead.'
    );
    vehicleStartLocation = findAlternativeStartLocation(path);
  } else if (intersectingPoints.features.length > 1) {
    vehicleStartLocation = findNearestCandidatePointToTargetAlongPath(
      intersectingPoints,
      startingPoint.geometry,
      route.geometry
    );
  }

  occupiedStartLocations.forEach((location) => {
    if (location && pointsAreCoincident(location, vehicleStartLocation, bufferDistance / 100)) {
      // eslint-disable-next-line no-console
      console.log('Found coincident vehicle start locations.  Moving one of them.');
      vehicleStartLocation = findAlternativeStartLocation(path);
    }
  });
  return vehicleStartLocation;
};

export const selectScenarioBounds = createSelector(
  fromDepot.selectBounds,
  fromVehicle.selectAllBounds,
  VisitRequestSelectors.selectAllBounds,
  (depotBounds, vehiclesBounds, visitRequestsBounds) => {
    const bounds = new google.maps.LatLngBounds();
    bounds.union(depotBounds.union(vehiclesBounds).union(visitRequestsBounds));
    return bounds;
  }
);

export const selectScenarioBoundsRadius = createSelector(selectScenarioBounds, (bounds) => {
  const neRadius = google.maps.geometry.spherical.computeDistanceBetween(
    bounds.getCenter(),
    bounds.getNorthEast()
  );
  const swRadius = google.maps.geometry.spherical.computeDistanceBetween(
    bounds.getCenter(),
    bounds.getSouthWest()
  );
  return (neRadius + swRadius) / 2;
});

const getVisitRequestsBounds = (visitRequests: VisitRequest[]) => {
  const bounds = new google.maps.LatLngBounds();
  visitRequests.forEach((visitRequest) => {
    if (visitRequest.arrivalWaypoint?.location?.latLng) {
      bounds.extend(fromDispatcherLatLng(visitRequest.arrivalWaypoint.location.latLng));
    }
    if (visitRequest.departureWaypoint?.location?.latLng) {
      bounds.extend(fromDispatcherLatLng(visitRequest.departureWaypoint.location.latLng));
    }
  });
  return bounds;
};

export const selectSolutionBounds = createSelector(
  fromDepot.selectDepot,
  VisitSelectors.selectVisitRequests,
  ShipmentRouteSelectors.selectAllBounds,
  (depot: ILatLng, visitRequests: VisitRequest[], shipmentRouteBounds) => {
    const bounds = getVisitRequestsBounds(visitRequests);
    bounds.union(shipmentRouteBounds);
    if (!bounds.isEmpty() && depot) {
      bounds.extend(fromDispatcherLatLng(depot));
    }
    return bounds;
  }
);

export const selectBounds = createSelector(
  selectScenarioBounds,
  selectSolutionBounds,
  (scenarioBounds, solutionBounds): google.maps.LatLngBounds => {
    if (solutionBounds && !solutionBounds.isEmpty()) {
      return solutionBounds;
    }
    if (scenarioBounds && !scenarioBounds.isEmpty()) {
      return scenarioBounds;
    }
  }
);

const getVehicleStartLocationsOnRouteWithHeadings = (
  paths: { [id: number]: MapLatLng[] },
  boundsRadius: number
): { [id: number]: { location: MapLatLng; heading: number } } => {
  const occupiedStartLocations: MapLatLng[] = [];
  const lookup: { [id: number]: { location: MapLatLng; heading: number } } = {};
  Object.entries(paths).forEach(([key, vehiclePath]) => {
    const startLocation = vehiclePath?.length
      ? getVehicleStartingLocation(vehiclePath, boundsRadius / 4, occupiedStartLocations)
      : null;
    occupiedStartLocations.push(startLocation);
    lookup[+key] = {
      location: startLocation,
      heading: vehiclePath ? findPathHeadingAtPointOptimized(vehiclePath, startLocation) : null,
    };
  });
  return lookup;
};

const getSimulatedVehicleLocationsOnRouteWithHeadings = (
  routes: ShipmentRoute[],
  paths: { [routeId: number]: google.maps.LatLng[] },
  simulationTime: number
): { [id: number]: { location: MapLatLng; heading: number } } => {
  const lookup: { [id: number]: { location: MapLatLng; heading: number } } = {};
  routes.forEach((route) => {
    if (!route.transitions) {
      return;
    }

    const path = paths[route.id];
    let interpolationDistance = 0;
    let totalDistance = 0;

    if (durationSeconds(route.vehicleStartTime).greaterThan(simulationTime)) {
      lookup[route.id] = {
        location: path[0],
        heading: computeHeadingAlongPath(path[0], path.length > 1 ? path[1] : path[0]),
      };
    } else if (durationSeconds(route.vehicleEndTime).lessThan(simulationTime)) {
      lookup[route.id] = {
        location: path[path.length - 1],
        heading: computeHeadingAlongPath(
          path[path.length - 1],
          path.length > 1 ? path[path.length - 2] : path[path.length - 1]
        ),
      };
    } else {
      route.transitions.forEach((transition) => {
        const start = durationSeconds(transition.startTime, Long.ZERO);
        const duration = durationSeconds(transition.travelDuration, Long.ZERO);
        const end = start.add(duration);

        if (start.lessThanOrEqual(simulationTime)) {
          const transitionPercent = Math.min(
            1,
            Math.max(0, (simulationTime - start.toNumber()) / end.subtract(start).toNumber())
          );
          interpolationDistance =
            totalDistance + transition.travelDistanceMeters * transitionPercent;
        }
        totalDistance += transition.travelDistanceMeters;
      });
      const point = getPointAlongPathByDistance(path, interpolationDistance);
      const prevPoint = getPointAlongPathByDistance(
        path,
        interpolationDistance > 1 ? interpolationDistance - 1 : 0
      );
      lookup[route.id] = { location: point, heading: computeHeadingAlongPath(prevPoint, point) };
    }
  });
  return lookup;
};

export const selectVehicleStartLocationsOnRouteWithHeadings = createSelector(
  ShipmentRouteSelectors.selectOverviewPolylinePaths,
  selectScenarioBoundsRadius,
  (paths, boundsRadius) => getVehicleStartLocationsOnRouteWithHeadings(paths, boundsRadius)
);

export const selectSimulatedVehicleLocationsOnRouteWithHeadings = createSelector(
  fromShipmentRoute.selectAll,
  ShipmentRouteSelectors.selectOverviewPolylinePaths,
  TravelSimulatorSelectors.selectTime,
  (routes, paths, simulationTime) =>
    getSimulatedVehicleLocationsOnRouteWithHeadings(routes, paths, simulationTime)
);

export const selectVehicleLocationsOnRouteWithHeadings = createSelector(
  TravelSimulatorSelectors.selectActive,
  selectSimulatedVehicleLocationsOnRouteWithHeadings,
  selectVehicleStartLocationsOnRouteWithHeadings,
  (useSimulatedLocations, simulatedLocations, locations) =>
    useSimulatedLocations ? simulatedLocations : locations
);

export const selectVehicleInitialHeadings = createSelector(
  fromVehicle.selectEntities,
  (vehicles) => {
    const lookup: { [id: number]: number } = {};
    Object.keys(vehicles).forEach((key) => {
      lookup[+key] = Math.random() * 360 - 180;
    });
    return lookup;
  }
);

export const selectFormScenarioBounds = createSelector(selectScenarioBounds, (scenarioBounds) => {
  if (!scenarioBounds.isEmpty()) {
    return bufferBounds(scenarioBounds, 50);
  }
  return scenarioBounds;
});

export const selectPreSolveEditShipmentFormBounds = createSelector(
  selectFormScenarioBounds,
  PreSolveShipmentSelectors.selectEditShipmentVisitRequests,
  (formScenarioBounds, editShipmentVisitRequests) => {
    const visitRequestBounds = getVisitRequestsBounds(editShipmentVisitRequests);
    if (!visitRequestBounds.isEmpty()) {
      return bufferBounds(visitRequestBounds, 50);
    }
    return formScenarioBounds;
  }
);

export const selectInfoWindowVehicle = createSelector(
  fromVehicle.selectClickedVehicle,
  selectVehicleLocationsOnRouteWithHeadings,
  (vehicle, startLocations) => {
    return (
      vehicle && {
        id: vehicle.id,
        position: startLocations[vehicle.id].location
          ? startLocations[vehicle.id].location
          : fromDispatcherLatLng(vehicle.startWaypoint?.location?.latLng),
      }
    );
  }
);

export const selectInfoWindowVisitRequest = createSelector(
  VisitRequestSelectors.selectClickedVisitRequest,
  (visitRequest) => {
    return (
      visitRequest && {
        id: visitRequest.id,
        position: fromDispatcherLatLng(visitRequest.arrivalWaypoint?.location?.latLng),
      }
    );
  }
);

export const selectSelectionFilterActive = createSelector(
  selectPage,
  PreSolveShipmentSelectors.selectSelectionFilterActive,
  PreSolveVehicleSelectors.selectSelectionFilterActive,
  RoutesChartSelectors.selectSelectionFilterActive,
  (page, shipmentsActive, vehiclesActive, routesActive) => {
    if (page === Page.Shipments) {
      return shipmentsActive;
    } else if (page === Page.Vehicles) {
      return vehiclesActive;
    } else if (page === Page.RoutesChart) {
      return routesActive;
    }
  }
);

export const selectAllMapLayers = createSelector(selectMapState, fromMap.selectPostSolveMapLayers);

export const selectPostSolveMapLayers = createSelector(
  selectAllMapLayers,
  fromVehicle.selectAll,
  (layers, vehicles) => {
    const mapLayers: { [id in MapLayerId]?: MapLayer } = {};

    const usedTravelModes = new Set();
    vehicles.forEach((vehicle) => usedTravelModes.add(vehicle.travelMode ?? TravelMode.DRIVING));

    Object.keys(layers).forEach((layerId) => {
      const layer = layers[layerId];
      if (!layer.travelMode) {
        mapLayers[layerId] = layer;
        return;
      }
      if (usedTravelModes.has(layer.travelMode)) {
        mapLayers[layerId] = layer;
      }
    });

    return mapLayers;
  }
);
