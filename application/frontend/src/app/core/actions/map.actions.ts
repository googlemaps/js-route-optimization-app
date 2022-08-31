/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

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
