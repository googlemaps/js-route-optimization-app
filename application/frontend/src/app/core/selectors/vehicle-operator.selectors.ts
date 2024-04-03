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

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import { getAvailableTimeRange } from 'src/app/util';
import { VehicleOperator } from '../models/vehicle-operator.model';
import * as fromVehicleOperator from '../reducers/vehicle-operator.reducer';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectVehicleOperatorState = createFeatureSelector<fromVehicleOperator.State>(
  fromVehicleOperator.vehicleOperatorsFeatureKey
);

export const { selectIds, selectEntities, selectAll, selectTotal } =
  fromVehicleOperator.adapter.getSelectors(selectVehicleOperatorState);

export const selectById = (id: number) =>
  createSelector(
    selectEntities,
    (vehicleOperators: Dictionary<VehicleOperator>) => vehicleOperators[id]
  );

export const selectByIds = (ids: number[]) =>
  createSelector(
    selectEntities,
    (vehicleOperators: Dictionary<VehicleOperator>) => ids?.map((id) => vehicleOperators[id]) || []
  );

export const selectByIdFn = createSelector(
  selectEntities,
  (vehicleOperators: Dictionary<VehicleOperator>) => (id: number) => vehicleOperators[id]
);

export const selectVehicleOperatorAvailability = (id: number) =>
  createSelector(
    ShipmentModelSelectors.selectGlobalDuration,
    selectById(id),
    (globalDuration: [Long, Long], vehicleOperator: VehicleOperator) => {
      const availableTimeRange =
        vehicleOperator &&
        getAvailableTimeRange(
          globalDuration,
          vehicleOperator.startTimeWindows,
          vehicleOperator.endTimeWindows
        );
      return availableTimeRange
        ? ([availableTimeRange.start, availableTimeRange.end] as [Long, Long])
        : null;
    }
  );

export const selectChangeTime = createSelector(
  selectVehicleOperatorState,
  fromVehicleOperator.selectChangeTime
);

export const selectLastDeletedOperatorTypes = createSelector(
  selectVehicleOperatorState,
  fromVehicleOperator.selectLastDeletedTypes
);

export const selectVehicleOperatorIndexById = createSelector(
  selectIds,
  (ids: number[] | string[]) => new Map((ids as number[]).map((id, index) => [id, index]))
);

export const selectNextVehicleOperatorId = createSelector(selectIds, (ids: number[] | string[]) =>
  ids.length ? Math.max.apply(null, ids) + 1 : 1
);

export const selectRequestedIds = createSelector(
  selectVehicleOperatorState,
  fromVehicleOperator.selectRequestedIds
);
