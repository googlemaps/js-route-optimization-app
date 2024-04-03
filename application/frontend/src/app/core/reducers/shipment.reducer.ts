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
import { omit } from 'src/app/util';
import { DispatcherActions, PreSolveShipmentActions, ShipmentActions } from '../actions';
import { ISkippedShipmentReason, Shipment } from '../models';

export const shipmentsFeatureKey = 'shipments';

export interface State extends EntityState<Shipment> {
  // additional entities state properties
  changeTime?: number;
  lastDeletedIndices: number[];
  /** Skipped shipment ids */
  skipped: number[];
  skippedReasons: { [id: number]: ISkippedShipmentReason[] };
}

export const adapter: EntityAdapter<Shipment> = createEntityAdapter<Shipment>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  changeTime: null,
  lastDeletedIndices: [],
  skipped: [],
  skippedReasons: {},
});

export const reducer = createReducer(
  initialState,
  on(ShipmentActions.addShipment, (state, action) => adapter.addOne(action.shipment, state)),
  on(ShipmentActions.upsertShipment, (state, action) => adapter.upsertOne(action.shipment, state)),
  on(ShipmentActions.addShipments, (state, action) => adapter.addMany(action.shipments, state)),
  on(ShipmentActions.upsertShipments, (state, action) =>
    adapter.upsertMany(action.shipments, state)
  ),
  on(ShipmentActions.updateShipment, (state, action) => adapter.updateOne(action.shipment, state)),
  on(ShipmentActions.updateShipments, (state, action) =>
    adapter.updateMany(action.shipments, state)
  ),
  on(ShipmentActions.deleteShipment, (state, action) => ({
    ...adapter.removeOne(action.id, state),
    skipped: state.skipped.filter((id) => id !== action.id),
    skippedReasons: omit(state.skippedReasons, [action.id]),
    lastDeletedIndices: [(state.ids as number[]).indexOf(action.id)],
  })),
  on(ShipmentActions.deleteShipments, (state, action) => {
    return {
      ...adapter.removeMany(action.ids, state),
      skipped: state.skipped.filter((id) => !action.ids.includes(id)),
      skippedReasons: omit(state.skippedReasons, action.ids),
      lastDeletedIndices: action.ids.map((id) => (state.ids as number[]).indexOf(id)),
    };
  }),
  on(ShipmentActions.loadShipments, DispatcherActions.loadScenario, (state, action) =>
    adapter.setAll(action.shipments, state)
  ),
  on(DispatcherActions.loadSolution, (state, action) => ({
    ...state,
    skipped: action.skippedShipments,
    skippedReasons: action.skippedShipmentReasons,
  })),
  on(
    PreSolveShipmentActions.saveShipment,
    PreSolveShipmentActions.saveShipments,
    (state, { changes }) => adapter.upsertMany(changes.shipment.upsert, state)
  ),
  on(ShipmentActions.clearShipments, DispatcherActions.uploadScenarioSuccess, (state) => ({
    ...adapter.removeAll(state),
    skipped: [],
  })),
  on(DispatcherActions.loadScenario, (state, { changeTime }) => ({ ...state, changeTime })),
  on(
    PreSolveShipmentActions.saveShipment,
    PreSolveShipmentActions.saveShipments,
    (state, { changeTime }) => ({ ...state, changeTime })
  ),
  on(DispatcherActions.clearSolution, (state) => ({
    ...state,
    changeTime: null,
    skipped: [],
    skippedReasons: [],
  }))
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();

export const selectChangeTime = (state: State): number => state.changeTime;

export const selectLastDeletedIndices = (state: State): number[] => state.lastDeletedIndices;

export const selectSkipped = (state: State): number[] => state.skipped;

export const selectSkippedReasons = (state: State): { [id: number]: ISkippedShipmentReason[] } =>
  state.skippedReasons;
