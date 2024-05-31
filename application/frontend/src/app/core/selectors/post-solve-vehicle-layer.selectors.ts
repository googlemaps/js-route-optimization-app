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
  selectVehicleHeadings,
  selectVehicleStartLocationsOnRoute,
} from './map.selectors';
import { vehicleToDeckGL } from './pre-solve-vehicle-layer.selectors';
import RoutesChartSelectors from './routes-chart.selectors';
import * as fromVehicle from './vehicle.selectors';
import { MapLayerId } from '../models/map';
import { TravelMode } from '../models';

export const selectFilteredVehicles = createSelector(
  fromVehicle.selectEntities,
  selectVehicleStartLocationsOnRoute,
  selectVehicleHeadings,
  RoutesChartSelectors.selectFilteredRoutesWithTransitionsLookup,
  selectPostSolveMapLayers,
  (vehicles, startLocations, headings, filteredRoutesLookup, mapLayers) => {
    const vehiclesArray = Object.values(vehicles);
    const filteredVehicles = filteredRoutesLookup.size
      ? vehiclesArray.filter(
          (v) =>
            filteredRoutesLookup.has(v.id) &&
            ((v.travelMode ?? TravelMode.DRIVING) === TravelMode.DRIVING
              ? mapLayers[MapLayerId.PostSolveFourWheel].visible
              : mapLayers[MapLayerId.PostSolveWalking].visible)
        )
      : [];
    return filteredVehicles.map((vehicle) =>
      vehicleToDeckGL(vehicle, startLocations[vehicle.id], headings[vehicle.id])
    );
  }
);

export const selectFilteredVehiclesSelected = createSelector(
  fromVehicle.selectEntities,
  selectVehicleStartLocationsOnRoute,
  selectVehicleHeadings,
  RoutesChartSelectors.selectFilteredRoutesSelectedWithTransitionsLookup,
  RoutesChartSelectors.selectSelectedRoutesColors,
  selectPostSolveMapLayers,
  (vehicles, startLocations, headings, selectedRoutesLookup, colors, mapLayers) => {
    const selectedVehicles = Object.values(vehicles).filter(
      (v) =>
        selectedRoutesLookup.has(v.id) &&
        ((v.travelMode ?? TravelMode.DRIVING) === TravelMode.DRIVING
          ? mapLayers[MapLayerId.PostSolveFourWheel].visible
          : mapLayers[MapLayerId.PostSolveWalking].visible)
    );
    return selectedVehicles.map((vehicle) => ({
      ...vehicleToDeckGL(vehicle, startLocations[vehicle.id], headings[vehicle.id]),
      color: colors[vehicle.id],
    }));
  }
);
