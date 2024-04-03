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
