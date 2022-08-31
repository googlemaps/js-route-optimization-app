/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { ShipmentRoute } from '../models/shipment-route.model';

export const loadShipmentRoutes = createAction(
  '[ShipmentRoute/API] Load Shipment Routes',
  props<{ shipmentRoutes: ShipmentRoute[] }>()
);

export const addShipmentRoute = createAction(
  '[ShipmentRoute/API] Add Shipment Route',
  props<{ shipmentRoute: ShipmentRoute }>()
);

export const upsertShipmentRoute = createAction(
  '[ShipmentRoute/API] Upsert Shipment Route',
  props<{ shipmentRoute: ShipmentRoute }>()
);

export const addShipmentRoutes = createAction(
  '[ShipmentRoute/API] Add Shipment Routes',
  props<{ shipmentRoutes: ShipmentRoute[] }>()
);

export const upsertShipmentRoutes = createAction(
  '[ShipmentRoute/API] Upsert Shipment Routes',
  props<{ shipmentRoutes: ShipmentRoute[] }>()
);

export const updateShipmentRoute = createAction(
  '[ShipmentRoute/API] Update Shipment Route',
  props<{ shipmentRoute: Update<ShipmentRoute> }>()
);

export const updateShipmentRoutes = createAction(
  '[ShipmentRoute/API] Update Shipment Routes',
  props<{ shipmentRoutes: Update<ShipmentRoute>[] }>()
);

export const deleteShipmentRoute = createAction(
  '[ShipmentRoute/API] Delete Shipment Route',
  props<{ id: number }>()
);

export const deleteShipmentRoutes = createAction(
  '[ShipmentRoute/API] Delete Shipment Routes',
  props<{ ids: number[] }>()
);

export const clearShipmentRoutes = createAction('[ShipmentRoute/API] Clear Shipment Routes');
