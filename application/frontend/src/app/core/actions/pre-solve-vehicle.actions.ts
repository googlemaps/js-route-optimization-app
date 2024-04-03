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

export const selectVehicle = createAction(
  '[PreSolveVehicle] Select Vehicle',
  props<{ vehicleId: number }>()
);

export const selectVehicles = createAction(
  '[PreSolveVehicle] Select Vehicles',
  props<{ vehicleIds: number[] }>()
);

export const deselectVehicle = createAction(
  '[PreSolveVehicle] Deselect Vehicle',
  props<{ vehicleId: number }>()
);

export const deselectVehicles = createAction(
  '[PreSolveVehicle] Deselect Vehicles',
  props<{ vehicleIds: number[] }>()
);

export const updateVehiclesSelection = createAction(
  '[PreSolveVehicle] Update Vehicles Selection',
  props<{ addedVehicleIds: number[]; removedVehicleIds: number[] }>()
);

export const addFilter = createAction(
  '[PreSolveVehicle] Add Filter',
  props<{ filter: ActiveFilter }>()
);

export const editFilter = createAction(
  '[PreSolveVehicle] Edit Filter',
  props<{ currentFilter: ActiveFilter; previousFilter: ActiveFilter }>()
);

export const removeFilter = createAction(
  '[PreSolveVehicle] Remove Filter',
  props<{ filter: ActiveFilter }>()
);

export const changePage = createAction(
  '[PreSolveVehicle] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const changeSort = createAction(
  '[PreSolveVehicle] Change Sort',
  props<{ active: string; direction: string }>()
);

export const showOnMap = createAction(
  '[PreSolveVehicle] Show On Map',
  props<{ vehicleId: number }>()
);

export const changeDisplayColumns = createAction(
  '[PreSolveVehicle] Change Display Columns',
  props<{ displayColumns: { [columnId: string]: boolean } }>()
);

export const editVehicle = createAction(
  '[PreSolveVehicle] Edit Vehicle',
  props<{ vehicleId: number }>()
);

export const addVehicle = createAction(
  '[PreSolveVehicle] Add Vehicle',
  props<{ vehicleId?: number }>()
);

export const editVehicles = createAction(
  '[PreSolveVehicle] Edit Vehicles',
  props<{ vehicleIds: number[] }>()
);
