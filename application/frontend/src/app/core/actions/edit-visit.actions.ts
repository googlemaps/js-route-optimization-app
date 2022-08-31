/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { ShipmentRoute, Visit } from '../models';

export const cancel = createAction('[Edit Visit] Cancel');

export const save = createAction(
  '[Edit Visit] Save',
  props<{ visits: Visit[]; shipmentRoutes: ShipmentRoute[] }>()
);

export const saveSuccess = createAction(
  '[Edit Visit] Save Success',
  props<{ visits: Visit[]; shipmentRoutes: ShipmentRoute[] }>()
);

export const saveFailure = createAction('[Edit Visit] Save Failure', props<{ error: any }>());

export const saveCancel = createAction('[Edit Visit] Save Cancel');

export const commitChanges = createAction(
  '[Edit Visit] Commit Changes',
  props<{ visits: Visit[]; shipmentRoutes: ShipmentRoute[] }>()
);

export const editShipment = createAction(
  '[Edit Visit] Edit Shipment',
  props<{ shipmentId: number }>()
);
