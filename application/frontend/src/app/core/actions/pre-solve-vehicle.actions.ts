/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
