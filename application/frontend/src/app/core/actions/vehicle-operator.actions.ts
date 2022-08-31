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

import { VehicleOperator } from '../models/vehicle-operator.model';
import { TimeThreshold } from '../models/request-settings';

export const loadVehicleOperators = createAction(
  '[VehicleOperator/API] Load VehicleOperators',
  props<{ vehicleOperators: VehicleOperator[] }>()
);

export const addVehicleOperator = createAction(
  '[VehicleOperator/API] Add VehicleOperator',
  props<{ vehicleOperator: VehicleOperator }>()
);

export const upsertVehicleOperator = createAction(
  '[VehicleOperator/API] Upsert VehicleOperator',
  props<{ timeThresholds?: TimeThreshold[]; vehicleOperator: VehicleOperator }>()
);

export const addVehicleOperators = createAction(
  '[VehicleOperator/API] Add VehicleOperators',
  props<{ timeThresholds?: TimeThreshold[]; vehicleOperators: VehicleOperator[] }>()
);

export const upsertVehicleOperators = createAction(
  '[VehicleOperator/API] Upsert VehicleOperators',
  props<{
    changeTime: number;
    timeThresholds?: TimeThreshold[];
    vehicleOperators: VehicleOperator[];
  }>()
);

export const updateVehicleOperator = createAction(
  '[VehicleOperator/API] Update VehicleOperator',
  props<{ vehicleOperator: Update<VehicleOperator> }>()
);

export const updateVehicleOperators = createAction(
  '[VehicleOperator/API] Update VehicleOperators',
  props<{ vehicleOperators: Update<VehicleOperator>[] }>()
);

export const confirmDeleteVehicleOperator = createAction(
  '[PreSolveVehicleOperator] Confirm Delete VehicleOperator',
  props<{ id: number }>()
);

export const confirmDeleteVehicleOperators = createAction(
  '[PreSolveVehicleOperator] Confirm Delete VehicleOperators',
  props<{ ids: number[] }>()
);

export const deleteVehicleOperator = createAction(
  '[VehicleOperator/API] Delete VehicleOperator',
  props<{ id: number }>()
);

export const deleteVehicleOperators = createAction(
  '[VehicleOperator/API] Delete VehicleOperators',
  props<{ ids: number[] }>()
);

export const setRequestIds = createAction(
  '[VehicleOperator/API] Set VehicleOperators RequestIds',
  props<{ requestedIDs: number[] }>()
);

export const clearVehicleOperators = createAction('[VehicleOperator/API] Clear VehicleOperators');
