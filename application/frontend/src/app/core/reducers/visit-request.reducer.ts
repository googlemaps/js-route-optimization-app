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
import {
  DispatcherActions,
  PreSolveShipmentActions,
  ShipmentActions,
  VisitRequestActions,
} from '../actions';
import { VisitRequest } from '../models/visit-request.model';

export const visitRequestsFeatureKey = 'visitRequests';

export interface State extends EntityState<VisitRequest> {
  // additional entities state properties
  changeTime?: number;
}

export const adapter: EntityAdapter<VisitRequest> = createEntityAdapter<VisitRequest>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
  changeTime: null,
});

export const reducer = createReducer(
  initialState,
  on(VisitRequestActions.addVisitRequest, (state, action) =>
    adapter.addOne(action.visitRequest, state)
  ),
  on(VisitRequestActions.upsertVisitRequest, (state, action) =>
    adapter.upsertOne(action.visitRequest, state)
  ),
  on(VisitRequestActions.addVisitRequests, (state, action) =>
    adapter.addMany(action.visitRequests, state)
  ),
  on(VisitRequestActions.upsertVisitRequests, (state, action) =>
    adapter.upsertMany(action.visitRequests, state)
  ),
  on(VisitRequestActions.updateVisitRequest, (state, action) =>
    adapter.updateOne(action.visitRequest, state)
  ),
  on(VisitRequestActions.updateVisitRequests, (state, action) =>
    adapter.updateMany(action.visitRequests, state)
  ),
  on(VisitRequestActions.deleteVisitRequest, (state, action) =>
    adapter.removeOne(action.id, state)
  ),
  on(VisitRequestActions.deleteVisitRequests, (state, action) =>
    adapter.removeMany(action.ids, state)
  ),
  on(VisitRequestActions.loadVisitRequests, DispatcherActions.loadScenario, (state, action) =>
    adapter.setAll(action.visitRequests, state)
  ),
  on(VisitRequestActions.clearVisitRequests, DispatcherActions.uploadScenarioSuccess, (state) =>
    adapter.removeAll(state)
  ),
  on(
    PreSolveShipmentActions.saveShipment,
    PreSolveShipmentActions.saveShipments,
    (state, { changes }) => adapter.upsertMany(changes.visitRequest.upsert, state)
  ),
  on(
    PreSolveShipmentActions.saveShipment,
    PreSolveShipmentActions.saveShipments,
    (state, { changes }) => adapter.removeMany(changes.visitRequest.delete, state)
  ),
  on(DispatcherActions.loadScenario, (state, { changeTime }) => ({ ...state, changeTime })),
  on(
    PreSolveShipmentActions.saveShipment,
    PreSolveShipmentActions.saveShipments,
    (state, { changeTime }) => ({ ...state, changeTime })
  ),
  on(ShipmentActions.deleteShipment, (state, action) => {
    return adapter.removeMany(
      (state.ids as number[]).filter((id) => state.entities[id].shipmentId === action.id),
      state
    );
  }),
  on(ShipmentActions.deleteShipments, (state, action) => {
    return adapter.removeMany(
      (state.ids as number[]).filter((id) => action.ids.includes(state.entities[id].shipmentId)),
      state
    );
  })
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();

export const selectChangeTime = (state: State): number => state.changeTime;
