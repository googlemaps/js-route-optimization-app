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
