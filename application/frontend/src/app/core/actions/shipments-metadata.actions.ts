/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

export const initialize = createAction('[ShipmentsMetadata] Initialize');

export const selectShipment = createAction(
  '[ShipmentsMetadata] Select Shipment',
  props<{ shipmentId: number }>()
);

export const selectShipments = createAction(
  '[ShipmentsMetadata] Select Shipments',
  props<{ shipmentIds: number[] }>()
);

export const deselectShipment = createAction(
  '[ShipmentsMetadata] Deselect Shipment',
  props<{ shipmentId: number }>()
);

export const deselectShipments = createAction(
  '[ShipmentsMetadata] Deselect Shipments',
  props<{ shipmentIds: number[] }>()
);

export const changePage = createAction(
  '[ShipmentsMetadata] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const changeSort = createAction(
  '[ShipmentsMetadata] Change Sort',
  props<{ active: string; direction: string }>()
);

export const editShipment = createAction(
  '[ShipmentsMetadata] Edit Shipment',
  props<{ shipmentId: number }>()
);
