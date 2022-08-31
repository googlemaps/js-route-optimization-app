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
