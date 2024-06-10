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
import {
  selectPostSolveMapLayers,
  selectVehicleLocationsOnRouteWithHeadings,
} from './map.selectors';
import { vehicleToDeckGL } from './pre-solve-vehicle-layer.selectors';
import RoutesChartSelectors from './routes-chart.selectors';
import * as fromVehicle from './vehicle.selectors';
import { MapLayerId } from '../models/map';
import { Page, TravelMode } from '../models';
import RoutesMetadataSelectors from './routes-metadata.selectors';
import * as fromUi from './ui.selectors';

export const selectFilteredVehicles = createSelector(
  fromVehicle.selectEntities,
  fromUi.selectPage,
  selectVehicleLocationsOnRouteWithHeadings,
  RoutesChartSelectors.selectFilteredRoutesWithTransitionsLookup,
  RoutesMetadataSelectors.selectFilteredRouteLookup,
  selectPostSolveMapLayers,
  (
    vehicles,
    currentPage,
    locations,
    chartFilteredRoutesLookup,
    metadataSelectedRoutesLookup,
    mapLayers
  ) => {
    const vehiclesArray = Object.values(vehicles);
    const lookup =
      currentPage === Page.RoutesChart ? chartFilteredRoutesLookup : metadataSelectedRoutesLookup;
    const filteredVehicles = lookup.size
      ? vehiclesArray.filter(
          (v) =>
            lookup.has(v.id) &&
            ((v.travelMode ?? TravelMode.DRIVING) === TravelMode.DRIVING
              ? mapLayers[MapLayerId.PostSolveFourWheel].visible
              : mapLayers[MapLayerId.PostSolveWalking].visible)
        )
      : [];
    return filteredVehicles.map((vehicle) =>
      vehicleToDeckGL(vehicle, locations[vehicle.id].location, locations[vehicle.id].heading)
    );
  }
);

export const selectFilteredVehiclesSelected = createSelector(
  fromVehicle.selectEntities,
  fromUi.selectPage,
  selectVehicleLocationsOnRouteWithHeadings,
  RoutesChartSelectors.selectFilteredRoutesSelectedWithTransitionsLookup,
  RoutesMetadataSelectors.selectFilteredRoutesSelectedLookup,
  RoutesChartSelectors.selectSelectedRoutesColors,
  selectPostSolveMapLayers,
  (
    vehicles,
    currentPage,
    locations,
    chartSelectedRoutesLookup,
    metadataSelectedRoutesLookup,
    colors,
    mapLayers
  ) => {
    const metadataSet = new Set(Object.keys(metadataSelectedRoutesLookup).map(Number));
    const lookup = currentPage === Page.RoutesChart ? chartSelectedRoutesLookup : metadataSet;
    const selectedVehicles = Object.values(vehicles).filter(
      (v) =>
        lookup.has(v.id) &&
        ((v.travelMode ?? TravelMode.DRIVING) === TravelMode.DRIVING
          ? mapLayers[MapLayerId.PostSolveFourWheel].visible
          : mapLayers[MapLayerId.PostSolveWalking].visible)
    );
    return selectedVehicles.map((vehicle) => ({
      ...vehicleToDeckGL(vehicle, locations[vehicle.id].location, locations[vehicle.id].heading),
      color: colors[vehicle.id],
    }));
  }
);
