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
import { DispatcherActions, EditVisitActions, PoiActions, ShipmentRouteActions } from '../actions';
import { ShipmentRoute } from '../models/shipment-route.model';

export const shipmentRoutesFeatureKey = 'shipmentRoutes';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface State extends EntityState<ShipmentRoute> {
  // additional entities state properties
}

export const adapter: EntityAdapter<ShipmentRoute> = createEntityAdapter<ShipmentRoute>();

export const initialState: State = adapter.getInitialState({
  // additional entity state properties
});

export const reducer = createReducer(
  initialState,
  on(ShipmentRouteActions.addShipmentRoute, (state, action) =>
    adapter.addOne(action.shipmentRoute, state)
  ),
  on(ShipmentRouteActions.upsertShipmentRoute, (state, action) =>
    adapter.upsertOne(action.shipmentRoute, state)
  ),
  on(ShipmentRouteActions.addShipmentRoutes, (state, action) =>
    adapter.addMany(action.shipmentRoutes, state)
  ),
  on(
    ShipmentRouteActions.upsertShipmentRoutes,
    EditVisitActions.commitChanges,
    PoiActions.saveSuccess,
    (state, action) => adapter.upsertMany(action.shipmentRoutes, state)
  ),
  on(ShipmentRouteActions.updateShipmentRoute, (state, action) =>
    adapter.updateOne(action.shipmentRoute, state)
  ),
  on(ShipmentRouteActions.updateShipmentRoutes, (state, action) =>
    adapter.updateMany(action.shipmentRoutes, state)
  ),
  on(ShipmentRouteActions.deleteShipmentRoute, (state, action) =>
    adapter.removeOne(action.id, state)
  ),
  on(ShipmentRouteActions.deleteShipmentRoutes, (state, action) =>
    adapter.removeMany(action.ids, state)
  ),
  on(ShipmentRouteActions.loadShipmentRoutes, DispatcherActions.loadSolution, (state, action) =>
    adapter.setAll(action.shipmentRoutes, state)
  ),
  on(
    ShipmentRouteActions.clearShipmentRoutes,
    DispatcherActions.uploadScenarioSuccess,
    DispatcherActions.clearSolution,
    (state) => adapter.removeAll(state)
  )
);

export const { selectIds, selectEntities, selectAll, selectTotal } = adapter.getSelectors();
