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
