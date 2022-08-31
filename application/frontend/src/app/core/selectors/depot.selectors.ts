/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
