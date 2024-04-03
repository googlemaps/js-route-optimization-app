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
