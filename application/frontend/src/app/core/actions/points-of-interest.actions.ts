/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import {
  PointOfInterestEndDrag,
  PointOfInterestStartDrag,
  PointOfInterestTimelineOverlapBegin,
  ShipmentRoute,
  Visit,
} from '../models';

export const startDrag = createAction(
  '[Points of Interest] Start Drag',
  props<{ dragStart: PointOfInterestStartDrag }>()
);

export const endDrag = createAction(
  '[Points of Interest] Stop Drag',
  props<{ dragEnd: PointOfInterestEndDrag }>()
);

export const beginTimelineOverlap = createAction(
  '[Points of Interest] Begin Timeline Overlap',
  props<{ overlap: PointOfInterestTimelineOverlapBegin }>()
);

export const endTimelineOverlap = createAction('[Points of Interest] End Timeline Overlap');

export const save = createAction(
  '[Points of Interest] Recalculate Polylines',
  props<{ visits: Visit[]; shipmentRoutes: ShipmentRoute[] }>()
);

export const saveSuccess = createAction(
  '[Points of Interest] Save Success',
  props<{ visits: Visit[]; shipmentRoutes: ShipmentRoute[] }>()
);

export const saveFailure = createAction(
  '[Points of Interest] Save Failure',
  props<{ error: any }>()
);

export const saveCancel = createAction('[Points of Interest] Save Cancel');
