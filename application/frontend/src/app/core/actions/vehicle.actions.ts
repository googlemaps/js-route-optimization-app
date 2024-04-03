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
