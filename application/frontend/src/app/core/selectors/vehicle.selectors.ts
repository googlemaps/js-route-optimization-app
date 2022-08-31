/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getAvailableTimeRange, getBounds } from 'src/app/util';
import { ILatLng } from '../models';
import { Vehicle } from '../models/vehicle.model';
import * as fromVehicle from '../reducers/vehicle.reducer';
import * as fromUI from './ui.selectors';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectVehicleState = createFeatureSelector<fromVehicle.State>(
  fromVehicle.vehiclesFeatureKey
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromVehicle.adapter.getSelectors(selectVehicleState);

export const selectById = (id: number) =>
  createSelector(selectEntities, (vehicles: Dictionary<Vehicle>) => vehicles[id]);

export const selectByIds = (ids: number[]) =>
  createSelector(
    selectEntities,
    (vehicles: Dictionary<Vehicle>) => ids?.map((id) => vehicles[id]) || []
  );

export const selectByIdFn = createSelector(
  selectEntities,
  (vehicles: Dictionary<Vehicle>) => (id: number) => vehicles[id]
);

export const selectAllBounds = createSelector(selectAll, (vehicles) => {
  const locations: ILatLng[] = [];
  vehicles.forEach((v) =>
    locations.push(v.startWaypoint?.location?.latLng, v.endWaypoint?.location?.latLng)
  );
  return getBounds(locations);
});

export const selectVehicleAvailability = (id: number) =>
  createSelector(
    ShipmentModelSelectors.selectGlobalDuration,
    selectById(id),
    (globalDuration: [Long, Long], vehicle: Vehicle) => {
      const availableTimeRange =
        vehicle &&
        getAvailableTimeRange(globalDuration, vehicle.startTimeWindows, vehicle.endTimeWindows);
      return availableTimeRange
        ? ([availableTimeRange.start, availableTimeRange.end] as [Long, Long])
        : null;
    }
  );

export const selectClickedVehicle = createSelector(
  selectEntities,
  fromUI.selectClickedVehicleId,
  (vehicles, id) => vehicles[id]
);

export const selectChangeTime = createSelector(selectVehicleState, fromVehicle.selectChangeTime);

export const selectLastDeletedIndices = createSelector(
  selectVehicleState,
  fromVehicle.selectLastDeletedIndices
);

export const selectVehicleIndexById = createSelector(
  selectIds,
  (ids: number[] | string[]) => new Map((ids as number[]).map((id, index) => [id, index]))
);

export const selectNextVehicleId = createSelector(selectIds, (ids: number[] | string[]) =>
  ids.length ? Math.max.apply(null, ids) + 1 : 1
);

export const selectVisitTags = createSelector(selectAll, (vehicles) => {
  const visitTags = new Set<string>();
  vehicles.forEach((vehicle) => {
    vehicle.startTags?.forEach((tag) => visitTags.add(tag));
    vehicle.endTags?.forEach((tag) => visitTags.add(tag));
  });
  return visitTags;
});

export const selectVisitTypes = createSelector(selectAll, (vehicles) => {
  const visitTypes = new Set<string>();
  vehicles.forEach((vehicle) => {
    if (vehicle.extraVisitDurationForVisitType) {
      Object.keys(vehicle.extraVisitDurationForVisitType).forEach((visitType) =>
        visitTypes.add(visitType)
      );
    }
  });
  return visitTypes;
});

export const selectOperatorTypes = createSelector(selectAll, (vehicles) => {
  const operatorTypes = new Set<string>();
  vehicles.forEach((vehicle) => {
    vehicle.requiredOperatorTypes?.forEach((type) => operatorTypes.add(type));
  });
  return operatorTypes;
});
