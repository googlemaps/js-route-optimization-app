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
