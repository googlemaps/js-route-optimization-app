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
