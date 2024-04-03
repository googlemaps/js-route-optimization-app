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

import { createAction, props } from '@ngrx/store';
import { Update } from '@ngrx/entity';

import { Shipment } from '../models/shipment.model';

export const loadShipments = createAction(
  '[Shipment/API] Load Shipments',
  props<{ shipments: Shipment[] }>()
);

export const addShipment = createAction(
  '[Shipment/API] Add Shipment',
  props<{ shipment: Shipment }>()
);

export const upsertShipment = createAction(
  '[Shipment/API] Upsert Shipment',
  props<{ shipment: Shipment }>()
);

export const addShipments = createAction(
  '[Shipment/API] Add Shipments',
  props<{ shipments: Shipment[] }>()
);

export const upsertShipments = createAction(
  '[Shipment/API] Upsert Shipments',
  props<{ shipments: Shipment[] }>()
);

export const updateShipment = createAction(
  '[Shipment/API] Update Shipment',
  props<{ shipment: Update<Shipment> }>()
);

export const updateShipments = createAction(
  '[Shipment/API] Update Shipments',
  props<{ shipments: Update<Shipment>[] }>()
);

export const deleteShipment = createAction(
  '[Shipment/API] Delete Shipment',
  props<{ id: number }>()
);

export const deleteShipments = createAction(
  '[Shipment/API] Delete Shipments',
  props<{ ids: number[] }>()
);

export const clearShipments = createAction('[Shipment/API] Clear Shipments');

export const confirmDeleteShipment = createAction(
  '[Shipment/API] Confirm Delete Shipment',
  props<{ id: number }>()
);

export const confirmDeleteShipments = createAction(
  '[Shipment/API] Confirm Delete Shipments',
  props<{ ids: number[] }>()
);
