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

import { Vehicle } from '../models/vehicle.model';
import { TimeThreshold } from '../models/request-settings';

export const loadVehicles = createAction(
  '[Vehicle/API] Load Vehicles',
  props<{ vehicles: Vehicle[] }>()
);

export const addVehicle = createAction('[Vehicle/API] Add Vehicle', props<{ vehicle: Vehicle }>());

export const upsertVehicle = createAction(
  '[Vehicle/API] Upsert Vehicle',
  props<{ timeThresholds?: TimeThreshold[]; vehicle: Vehicle }>()
);

export const addVehicles = createAction(
  '[Vehicle/API] Add Vehicles',
  props<{ timeThresholds?: TimeThreshold[]; vehicles: Vehicle[] }>()
);

export const upsertVehicles = createAction(
  '[Vehicle/API] Upsert Vehicles',
  props<{ changeTime: number; timeThresholds?: TimeThreshold[]; vehicles: Vehicle[] }>()
);

export const updateVehicle = createAction(
  '[Vehicle/API] Update Vehicle',
  props<{ vehicle: Update<Vehicle> }>()
);

export const updateVehicles = createAction(
  '[Vehicle/API] Update Vehicles',
  props<{ vehicles: Update<Vehicle>[] }>()
);

export const confirmDeleteVehicle = createAction(
  '[PreSolveVehicle] Confirm Delete Vehicle',
  props<{ id: number }>()
);

export const confirmDeleteVehicles = createAction(
  '[PreSolveVehicle] Confirm Delete Vehicles',
  props<{ ids: number[] }>()
);

export const deleteVehicle = createAction('[Vehicle/API] Delete Vehicle', props<{ id: number }>());

export const deleteVehicles = createAction(
  '[Vehicle/API] Delete Vehicles',
  props<{ ids: number[] }>()
);

export const clearVehicles = createAction('[Vehicle/API] Clear Vehicles');
