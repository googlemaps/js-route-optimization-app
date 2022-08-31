/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Update } from '@ngrx/entity';
import { createAction, props } from '@ngrx/store';
import { Visit } from '../models/visit.model';

export const loadVisits = createAction('[Visit/API] Load Visits', props<{ visits: Visit[] }>());

export const addVisit = createAction('[Visit/API] Add Visit', props<{ visit: Visit }>());

export const upsertVisit = createAction('[Visit/API] Upsert Visit', props<{ visit: Visit }>());

export const addVisits = createAction('[Visit/API] Add Visits', props<{ visits: Visit[] }>());

export const upsertVisits = createAction('[Visit/API] Upsert Visits', props<{ visits: Visit[] }>());

export const updateVisit = createAction(
  '[Visit/API] Update Visit',
  props<{ visit: Update<Visit> }>()
);

export const updateVisits = createAction(
  '[Visit/API] Update Visits',
  props<{ visits: Update<Visit>[] }>()
);

export const deleteVisit = createAction('[Visit/API] Delete Visit', props<{ id: number }>());

export const deleteVisits = createAction('[Visit/API] Delete Visits', props<{ ids: number[] }>());

export const clearVisits = createAction('[Visit/API] Clear Visits');
