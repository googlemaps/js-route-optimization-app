/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { ValidationResult } from '../models';

export const showWarning = createAction(
  '[Validation Result] Show Warning',
  props<{ validationResult: ValidationResult }>()
);

export const editPreSolveShipment = createAction(
  '[Validation Result] Edit Pre-Solve Shipment',
  props<{ shipmentId: number }>()
);

export const editPreSolveVehicle = createAction(
  '[Validation Result] Edit Pre-Solve Vehicle',
  props<{ vehicleId: number }>()
);

export const solve = createAction('[Validation Result] Solve');
