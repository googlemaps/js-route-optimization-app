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
import { MapLayerId } from '../models/map';

export const hideMap = createAction('[Map] Hide Map');

export const showMap = createAction('[Map] Show Map');

export const toggleMap = createAction('[Map] Toggle Map');

export const deselectMapItems = createAction('[Map] Deselect Map Items');

export const selectPreSolveShipmentMapItems = createAction(
  '[Map] Select PreSolve Shipment Map Items',
  props<{ polygon }>()
);

export const selectPreSolveVehicleMapItems = createAction(
  '[Map] Select PreSolve Vehicle Map Items',
  props<{ polygon }>()
);

export const selectPostSolveMapItems = createAction(
  '[Map] Select PostSolve Map Items',
  props<{ polygon }>()
);

export const initializePostSolveVehicles = createAction('[Map] Initialize Post Solve Vehicles');

export const editPreSolveShipment = createAction(
  '[Map] Edit Pre Solve Shipment',
  props<{ shipmentId: number }>()
);

export const editPreSolveVehicle = createAction(
  '[Map] Edit Pre Solve Vehicle',
  props<{ vehicleId: number }>()
);

export const editVisit = createAction('[Map] Edit Visit', props<{ visitId: number }>());

export const setPostSolveLayerVisible = createAction(
  '[Map] Set Post Solve Layer Visible',
  props<{ layerId: MapLayerId; visible: boolean }>()
);
