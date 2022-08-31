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
