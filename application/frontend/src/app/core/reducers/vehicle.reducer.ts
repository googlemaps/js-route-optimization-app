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
import { DispatcherActions, VehicleActions } from '../actions';
import { Vehicle } from '../models/vehicle.model';

export const vehiclesFeatureKey = 'vehicles';

export interface State extends EntityState<Vehicle> {
  // additional entities state properties
  changeTime?: number;
  lastDeletedIndices: number[];
}

export const adapter: EntityAdapter<Vehicle> = createEntityAdapter<Vehicle>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  changeTime: null,
  lastDeletedIndices: [],
});

export const reducer = createReducer(
  initialState,
  on(VehicleActions.addVehicle, (state, action) => adapter.addOne(action.vehicle, state)),
  on(VehicleActions.upsertVehicle, (state, action) => adapter.upsertOne(action.vehicle, state)),
  on(VehicleActions.addVehicles, (state, action) => adapter.addMany(action.vehicles, state)),
  on(VehicleActions.upsertVehicles, (state, action) => adapter.upsertMany(action.vehicles, state)),
  on(VehicleActions.updateVehicle, (state, action) => adapter.updateOne(action.vehicle, state)),
  on(VehicleActions.updateVehicles, (state, action) => adapter.updateMany(action.vehicles, state)),
  on(VehicleActions.deleteVehicle, (state, action) => ({
    ...adapter.removeOne(action.id, state),
    lastDeletedIndices: [(state.ids as number[]).indexOf(action.id)],
  })),
  on(VehicleActions.deleteVehicles, (state, action) => ({
    ...adapter.removeMany(action.ids, state),
    lastDeletedIndices: action.ids.map((id) => (state.ids as number[]).indexOf(id)),
  })),
  on(VehicleActions.loadVehicles, DispatcherActions.loadScenario, (state, action) =>
    adapter.setAll(action.vehicles, state)
  ),
  on(VehicleActions.clearVehicles, DispatcherActions.uploadScenarioSuccess, (state) =>
    adapter.removeAll(state)
  ),
  on(DispatcherActions.loadScenario, (state, { changeTime }) => ({ ...state, changeTime })),
  on(VehicleActions.upsertVehicle, (state, { vehicle }) => ({
    ...state,
    changeTime: vehicle.changeTime,
  })),
  on(VehicleActions.upsertVehicles, (state, { changeTime }) => ({ ...state, changeTime }))
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();

export const selectChangeTime = (state: State): number => state.changeTime;

export const selectLastDeletedIndices = (state: State): number[] => state.lastDeletedIndices;
