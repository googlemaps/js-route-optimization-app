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
