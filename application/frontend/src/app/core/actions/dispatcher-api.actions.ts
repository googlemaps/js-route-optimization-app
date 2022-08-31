/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { Scenario } from '../models';
import { ElapsedSolution } from '../models/elapsed-solution';

export const optimizeTours = createAction(
  '[Dispatcher/API] Optimize Tours',
  props<{ scenario: Scenario }>()
);

export const optimizeToursSuccess = createAction(
  '[Dispatcher/API] Optimize Tours Success',
  props<{
    elapsedSolution: ElapsedSolution;
    requestedShipmentIds: number[];
    requestedVehicleIds: number[];
  }>()
);

export const optimizeToursFailure = createAction(
  '[Dispatcher/API] Optimize Tours Failure',
  props<{ error: any }>()
);

export const optimizeToursCancel = createAction('[Dispatcher/API] Optimize Tours Cancel');

export const applySolution = createAction(
  '[Dispatcher/API] Apply Solution',
  props<{
    elapsedSolution: ElapsedSolution;
    requestedShipmentIds: number[];
    requestedVehicleIds: number[];
  }>()
);

export const recalculatePolylines = createAction(
  '[Dispatcher/API] Recalculate Polylines',
  props<{ scenario: Scenario; updateRouteIndexById: Map<number, number> }>()
);

export const recalculatePolylinesSuccess = createAction(
  '[Dispatcher/API] Recalculate Polylines Success',
  props<{ elapsedSolution: ElapsedSolution; updateRouteIndexById: Map<number, number> }>()
);

export const recalculatePolylinesFailure = createAction(
  '[Dispatcher/API] Recalculate Polylines Failure',
  props<{ error: any }>()
);

export const recalculatePolylinesCancel = createAction(
  '[Dispatcher/API] Recalculate Polylines Cancel'
);
