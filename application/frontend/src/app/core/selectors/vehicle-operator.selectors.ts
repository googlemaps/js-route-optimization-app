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
