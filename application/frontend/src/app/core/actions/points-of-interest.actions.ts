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
