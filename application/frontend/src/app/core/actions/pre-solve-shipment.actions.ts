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
import { ActiveFilter } from 'src/app/shared/models';
import { ShipmentChanges } from '../models';

export const selectShipment = createAction(
  '[PreSolveShipment] Select Shipment',
  props<{ shipmentId: number }>()
);

export const selectShipments = createAction(
  '[PreSolveShipment] Select Shipments',
  props<{ shipmentIds: number[] }>()
);

export const deselectShipment = createAction(
  '[PreSolveShipment] Deselect Shipment',
  props<{ shipmentId: number }>()
);

export const deselectShipments = createAction(
  '[PreSolveShipment] Deselect Shipments',
  props<{ shipmentIds: number[] }>()
);

export const updateShipmentsSelection = createAction(
  '[PreSolveShipment] Update Shipments Selection',
  props<{ addedShipmentIds: number[]; removedShipmentIds: number[] }>()
);

export const addFilter = createAction(
  '[PreSolveShipment] Add Filter',
  props<{ filter: ActiveFilter }>()
);

export const editFilter = createAction(
  '[PreSolveShipment] Edit Filter',
  props<{ currentFilter: ActiveFilter; previousFilter: ActiveFilter }>()
);

export const removeFilter = createAction(
  '[PreSolveShipment] Remove Filter',
  props<{ filter: ActiveFilter }>()
);

export const changePage = createAction(
  '[PreSolveShipment] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const changeSort = createAction(
  '[PreSolveShipment] Change Sort',
  props<{ active: string; direction: string }>()
);

export const showOnMap = createAction(
  '[PreSolveShipment] Show On Map',
  props<{ shipmentId: number }>()
);

export const changeDisplayColumns = createAction(
  '[PreSolveShipment] Change Display Columns',
  props<{ displayColumns: { [columnId: string]: boolean } }>()
);

export const addShipment = createAction(
  '[PreSolveShipment] Add Shipment',
  props<{ shipmentId?: number }>()
);

export const editShipment = createAction(
  '[PreSolveShipment] Edit Shipment',
  props<{ shipmentId: number }>()
);

export const editShipments = createAction(
  '[PreSolveShipment] Edit Shipments',
  props<{ shipmentIds: number[] }>()
);

export const saveShipment = createAction(
  '[PreSolveShipment] Save Shipment',
  props<{ changes: ShipmentChanges; changeTime: number }>()
);

export const saveShipments = createAction(
  '[PreSolveShipment] Save Shipments',
  props<{ changes: ShipmentChanges; changeTime: number }>()
);

export const cancelEditShipment = createAction('[PreSolveShipment] Cancel Edit Shipment');

export const mouseEnterVisitRequest = createAction(
  '[PreSolveShipment] Mouse Enter Visit Request',
  props<{ id: number }>()
);

export const mouseExitVisitRequest = createAction('[PreSolveShipment] Mouse Exit Visit Request');
