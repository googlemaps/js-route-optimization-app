/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { IDuration, IConstraintRelaxation } from '../models';
import { RequestSettings, TimeThreshold } from '../models/request-settings';

export const setRequestSettings = createAction(
  '[Request Settings] Set Request Settings',
  props<Partial<RequestSettings>>()
);

export const setLabel = createAction('[Request Settings] Set Label', props<{ label: string }>());

export const setInterpretInjectedSolutionsUsingLabels = createAction(
  '[Request Settings] Set Interpret Injected Solutions',
  props<{ interpretInjectedSolutionsUsingLabels: boolean }>()
);

export const setPopulateTransitionPolylines = createAction(
  '[Request Settings] Set Populate Transition Polyline',
  props<{ populateTransitionPolylines: boolean }>()
);

export const SetAllowLargeDeadlineDespiteInterruptionRisk = createAction(
  '[Request Settings] Set Allow Large Deadline Despite Interruption',
  props<{ allowLargeDeadlineDespiteInterruptionRisk: boolean }>()
);

export const SetUseGeodesicDistances = createAction(
  '[Request Settings] Set Use GeoDesic Distances',
  props<{ useGeodesicDistances: boolean }>()
);

export const setGeodesicMetersPerSecond = createAction(
  '[Request Settings] Set Geodesic Meters Per Second',
  props<{ geodesicMetersPerSecond: number }>()
);

export const setSearchMode = createAction(
  '[Request Settings] Set Search Mode',
  props<{ searchMode: number }>()
);

export const setTimeThreshold = createAction(
  '[Request Settings] Set Time Threshold',
  props<{ timeThreshold: string | number }>()
);

export const setTraffic = createAction(
  '[Request Settings] Set Traffic',
  props<{ traffic: boolean }>()
);

export const setTimeout = createAction(
  '[Request Settings] Set Timeout',
  props<{ timeout: IDuration }>()
);

export const upsertGlobalConstraints = createAction(
  '[Request Settings] Upsert Global Constraints',
  props<{
    constraints: TimeThreshold[];
  }>()
);

export const setGlobalConstraints = createAction(
  '[Request Settings] Set Global Constraints',
  props<{ constraints: TimeThreshold[] }>()
);

export const editAllGlobalRelaxationConstraints = createAction(
  '[Request Settings] Edit All Global Relaxation Constraints',
  props<{ constraintRelaxations: IConstraintRelaxation }>()
);

export const removeGlobalConstraint = createAction(
  '[Request Settings] Remove Global Constraint',
  props<{ index: number }>()
);

export const editSettings = createAction('[Request Settings] Edit Settings');
