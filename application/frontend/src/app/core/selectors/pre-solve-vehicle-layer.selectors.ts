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
import { Feature, Point } from '@turf/helpers';
import { fromDispatcherLatLng, fromDispatcherToTurfPoint } from 'src/app/util';
import * as fromLinearReferencing from '../../util/linear-referencing';
import { MapVehicle, TravelMode, Vehicle } from '../models';
import * as fromDepot from './depot.selectors';
import { selectUsedMapLayers, selectVehicleInitialHeadings } from './map.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import { MapLayerId } from '../models/map';

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
  selectUsedMapLayers,
  (vehicles, headings, depot, visibleMapLayers) => {
    const selectedVehicles: MapVehicle[] = [];
    vehicles
      .filter((vehicle) =>
        vehicle.travelMode ?? TravelMode.DRIVING
          ? visibleMapLayers[MapLayerId.FourWheel].visible
          : visibleMapLayers[MapLayerId.Walking].visible
      )
      .forEach((vehicle) => {
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
