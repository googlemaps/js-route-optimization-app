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

export const initialize = createAction('[RoutesMetadata] Initialize');

export const selectRoute = createAction(
  '[RoutesMetadata] Select Route',
  props<{ routeId: number }>()
);

export const selectRoutes = createAction(
  '[RoutesMetadata] Select Routes',
  props<{ routeIds: number[] }>()
);

export const deselectRoute = createAction(
  '[RoutesMetadata] Deselect Route',
  props<{ routeId: number }>()
);

export const deselectRoutes = createAction(
  '[RoutesMetadata] Deselect Routes',
  props<{ routeIds: number[] }>()
);

export const changePage = createAction(
  '[RoutesMetadata] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const changeSort = createAction(
  '[RoutesMetadata] Change Sort',
  props<{ active: string; direction: string }>()
);
