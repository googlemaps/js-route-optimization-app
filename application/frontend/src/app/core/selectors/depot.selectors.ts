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
import { fromDispatcherLatLng, getBounds, pointsAreCoincident } from 'src/app/util';
import { ILatLng, Page, Vehicle } from '../models';
import * as fromDispatcher from './dispatcher.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromUI from './ui.selectors';

const tryInferDepotFromVehicles = (vehicles: Vehicle[]): ILatLng => {
  const depot = vehicles?.[0]?.startWaypoint?.location?.latLng;
  if (!depot) {
    return;
  }
  const depotLatLng = fromDispatcherLatLng(depot);
  for (const vehicle of vehicles) {
    if (!vehicle.startWaypoint?.location?.latLng || !vehicle.endWaypoint?.location?.latLng) {
      return;
    }
    const startLatLng = fromDispatcherLatLng(vehicle.startWaypoint?.location?.latLng);
    if (!pointsAreCoincident(depotLatLng, startLatLng)) {
      return; // Vehicles don't share a common depot
    }
    const endLatLng = fromDispatcherLatLng(vehicle.endWaypoint?.location?.latLng);
    if (!pointsAreCoincident(startLatLng, endLatLng)) {
      return; // Vehicle doesn't return to depot
    }
  }
  return depot;
};

const getDepot = (depot: ILatLng, vehicles: Vehicle[]): ILatLng => {
  return depot || tryInferDepotFromVehicles(vehicles) || null;
};

export const selectScenarioDepot = createSelector(
  fromDispatcher.selectScenario,
  (scenario) => scenario?.depot
);

export const selectDepot = createSelector(selectScenarioDepot, fromVehicle.selectAll, getDepot);

export const selectHideDepotVehicles = createSelector(
  fromUI.selectPage,
  (page) => page !== Page.RoutesChart
);

export const selectBounds = createSelector(selectDepot, (depot) => getBounds([depot]));
