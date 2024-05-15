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

import { VisitRequest } from '../models/visit-request.model';

export const loadVisitRequests = createAction(
  '[VisitRequest/API] Load Visit Requests',
  props<{ visitRequests: VisitRequest[] }>()
);

export const addVisitRequest = createAction(
  '[VisitRequest/API] Add Visit Request',
  props<{ visitRequest: VisitRequest }>()
);

export const upsertVisitRequest = createAction(
  '[VisitRequest/API] Upsert Visit Request',
  props<{ visitRequest: VisitRequest }>()
);

export const addVisitRequests = createAction(
  '[VisitRequest/API] Add Visit Requests',
  props<{ visitRequests: VisitRequest[] }>()
);

export const upsertVisitRequests = createAction(
  '[VisitRequest/API] Upsert Visit Requests',
  props<{ visitRequests: VisitRequest[] }>()
);

export const updateVisitRequest = createAction(
  '[VisitRequest/API] Update Visit Request',
  props<{ visitRequest: Update<VisitRequest> }>()
);

export const updateVisitRequests = createAction(
  '[VisitRequest/API] Update Visit Requests',
  props<{ visitRequests: Update<VisitRequest>[] }>()
);

export const deleteVisitRequest = createAction(
  '[VisitRequest/API] Delete Visit Request',
  props<{ id: number }>()
);

export const deleteVisitRequests = createAction(
  '[VisitRequest/API] Delete Visit Requests',
  props<{ ids: number[] }>()
);

export const clearVisitRequests = createAction('[VisitRequest/API] Clear Visit Requests');
