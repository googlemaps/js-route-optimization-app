/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { Feature, Point } from '@turf/helpers';
import { fromDispatcherLatLng, fromDispatcherToTurfPoint } from 'src/app/util';
import * as fromLinearReferencing from '../../util/linear-referencing';
import { MapVehicle, Vehicle } from '../models';
import * as fromDepot from './depot.selectors';
import { selectVehicleInitialHeadings } from './map.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';

export const vehicleToDeckGL = (
  vehicle: Vehicle,
  position?: google.maps.LatLng,
  heading?: number,
  atDepot = false
): MapVehicle => {
  return {
    ...vehicle,
    position: position
      ? [position.lng(), position.lat()]
      : [
          vehicle.startWaypoint?.location?.latLng?.longitude,
          vehicle.startWaypoint?.location?.latLng?.latitude,
        ],
    // Heading: degrees clockwise, Deck.gl angle: degrees counterclocwise. Both range [-180, 180].
    heading: -(heading ?? 0),
    atDepot,
  };
};

export const selectFilteredVehicles = createSelector(
  PreSolveVehicleSelectors.selectFilteredVehicles,
  selectVehicleInitialHeadings,
  fromDepot.selectDepot,
  (vehicles, headings, depot) => {
    const filteredVehicles: MapVehicle[] = [];
    vehicles.forEach((vehicle) => {
      if (vehicle.startWaypoint?.location?.latLng) {
        const position = fromDispatcherLatLng(vehicle.startWaypoint.location.latLng);
        const atDepot = depot
          ? fromLinearReferencing.pointsAreCoincident(position, fromDispatcherLatLng(depot))
          : false;
        filteredVehicles.push(vehicleToDeckGL(vehicle, position, headings[vehicle.id], atDepot));
      }
    });
    return filteredVehicles;
  }
);

export const selectFilteredVehiclesSelected = createSelector(
  PreSolveVehicleSelectors.selectFilteredVehiclesSelected,
  selectVehicleInitialHeadings,
  fromDepot.selectDepot,
  (vehicles, headings, depot) => {
    const selectedVehicles: MapVehicle[] = [];
    vehicles.forEach((vehicle) => {
      if (vehicle.startWaypoint?.location?.latLng) {
        const position = fromDispatcherLatLng(vehicle.startWaypoint.location.latLng);
        const atDepot = depot
          ? fromLinearReferencing.pointsAreCoincident(position, fromDispatcherLatLng(depot))
          : false;
        selectedVehicles.push(vehicleToDeckGL(vehicle, position, headings[vehicle.id], atDepot));
      }
    });
    return selectedVehicles;
  }
);

export const selectFilteredVehiclesTurfPoints = createSelector(
  selectFilteredVehicles,
  (vehicles) => {
    const turfPoints: { [vehicleId: number]: Feature<Point> } = {};
    vehicles.forEach((vehicle) => {
      const feature = fromDispatcherToTurfPoint(vehicle.startWaypoint?.location?.latLng);
      turfPoints[vehicle.id] = feature;
    });
    return turfPoints;
  }
);
