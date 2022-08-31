/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
