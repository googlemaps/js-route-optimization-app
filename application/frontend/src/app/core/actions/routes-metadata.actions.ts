/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
