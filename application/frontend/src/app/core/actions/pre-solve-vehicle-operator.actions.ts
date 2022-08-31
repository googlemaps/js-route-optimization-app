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

export const selectVehicleOperator = createAction(
  '[PreSolveVehicleOperator] Select VehicleOperator',
  props<{ vehicleOperatorId: number }>()
);

export const selectVehicleOperators = createAction(
  '[PreSolveVehicleOperator] Select VehicleOperators',
  props<{ vehicleOperatorIds: number[] }>()
);

export const deselectVehicleOperator = createAction(
  '[PreSolveVehicleOperator] Deselect VehicleOperator',
  props<{ vehicleOperatorId: number }>()
);

export const deselectVehicleOperators = createAction(
  '[PreSolveVehicle] Deselect VehicleOperators',
  props<{ vehicleOperatorIds: number[] }>()
);

export const updateVehicleOperatorsSelection = createAction(
  '[PreSolveVehicleOperator] Update VehicleOperators Selection',
  props<{ addedVehicleOperatorIds: number[]; removedVehicleOperatorIds: number[] }>()
);

export const addFilter = createAction(
  '[PreSolveVehicleOperator] Add Filter',
  props<{ filter: ActiveFilter }>()
);

export const editFilter = createAction(
  '[PreSolveVehicleOperator] Edit Filter',
  props<{ currentFilter: ActiveFilter; previousFilter: ActiveFilter }>()
);

export const removeFilter = createAction(
  '[PreSolveVehicleOperator] Remove Filter',
  props<{ filter: ActiveFilter }>()
);

export const changePage = createAction(
  '[PreSolveVehicleOperator] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const changeSort = createAction(
  '[PreSolveVehicleOperator] Change Sort',
  props<{ active: string; direction: string }>()
);

export const showOnMap = createAction(
  '[PreSolveVehicleOperator] Show On Map',
  props<{ vehicleOperatorId: number }>()
);

export const changeDisplayColumns = createAction(
  '[PreSolveVehicleOperator] Change Display Columns',
  props<{ displayColumns: { [columnId: string]: boolean } }>()
);

export const editVehicleOperator = createAction(
  '[PreSolveVehicleOperator] Edit VehicleOperator',
  props<{ vehicleOperatorId: number }>()
);

export const addVehicleOperator = createAction(
  '[PreSolveVehicleOperator] Add Vehicle Operator',
  props<{ vehicleOperatorId?: number }>()
);

export const editVehicleOperators = createAction(
  '[PreSolveVehicleOperator] Edit VehicleOperators',
  props<{ vehicleOperatorIds: number[] }>()
);
