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
