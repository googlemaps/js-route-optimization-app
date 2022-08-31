/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { DispatcherActions, VehicleOperatorActions } from '../actions';
import { VehicleOperator } from '../models/vehicle-operator.model';

export const vehicleOperatorsFeatureKey = 'vehicleOperators';

export interface State extends EntityState<VehicleOperator> {
  // additional entities state properties
  changeTime?: number;
  lastDeletedTypes: string[];
  requestedIDs: number[];
}

export const adapter: EntityAdapter<VehicleOperator> = createEntityAdapter<VehicleOperator>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  changeTime: null,
  lastDeletedTypes: [],
  requestedIDs: [],
});

export const reducer = createReducer(
  initialState,
  on(VehicleOperatorActions.addVehicleOperator, (state, action) =>
    adapter.addOne(action.vehicleOperator, state)
  ),
  on(VehicleOperatorActions.upsertVehicleOperator, (state, action) =>
    adapter.upsertOne(action.vehicleOperator, state)
  ),
  on(VehicleOperatorActions.addVehicleOperators, (state, action) =>
    adapter.addMany(action.vehicleOperators, state)
  ),
  on(VehicleOperatorActions.upsertVehicleOperators, (state, action) =>
    adapter.upsertMany(action.vehicleOperators, state)
  ),
  on(VehicleOperatorActions.updateVehicleOperator, (state, action) =>
    adapter.updateOne(action.vehicleOperator, state)
  ),
  on(VehicleOperatorActions.updateVehicleOperators, (state, action) =>
    adapter.updateMany(action.vehicleOperators, state)
  ),
  on(VehicleOperatorActions.deleteVehicleOperator, (state, action) => ({
    ...adapter.removeOne(action.id, state),
    lastDeletedTypes: [Object.values(state.entities).find((anObj) => anObj.id === action.id).type],
  })),
  on(VehicleOperatorActions.deleteVehicleOperators, (state, action) => ({
    ...adapter.removeMany(action.ids, state),
    lastDeletedTypes: Object.values(state.entities)
      .filter((e) => action.ids.includes(e.id))
      .map((el) => el.type),
  })),
  on(VehicleOperatorActions.loadVehicleOperators, DispatcherActions.loadScenario, (state, action) =>
    adapter.setAll(action.vehicleOperators, state)
  ),
  on(
    VehicleOperatorActions.clearVehicleOperators,
    DispatcherActions.uploadScenarioSuccess,
    (state) => adapter.removeAll(state)
  ),
  on(DispatcherActions.loadScenario, (state, { changeTime }) => ({ ...state, changeTime })),
  on(VehicleOperatorActions.upsertVehicleOperator, (state, { vehicleOperator }) => ({
    ...state,
    changeTime: vehicleOperator.changeTime,
  })),
  on(VehicleOperatorActions.upsertVehicleOperators, (state, { changeTime }) => ({
    ...state,
    changeTime,
  })),
  on(VehicleOperatorActions.setRequestIds, (state, { requestedIDs }) => ({
    ...state,
    requestedIDs: requestedIDs,
  }))
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();

export const selectChangeTime = (state: State): number => state.changeTime;

export const selectLastDeletedTypes = (state: State): string[] => state.lastDeletedTypes;

export const selectRequestedIds = (state: State): number[] => state.requestedIDs;
