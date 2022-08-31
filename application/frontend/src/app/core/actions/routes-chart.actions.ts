/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { ActiveFilter } from 'src/app/shared/models';

export const initialize = createAction('[Routes Chart] Initialize');

export const selectRoute = createAction('[RoutesChart] Select Route', props<{ routeId: number }>());

export const selectRoutes = createAction(
  '[RoutesChart] Select Routes',
  props<{ routeIds: number[] }>()
);

export const deselectRoute = createAction(
  '[RoutesChart] Deselect Route',
  props<{ routeId: number }>()
);

export const deselectRoutes = createAction(
  '[RoutesChart] Deselect Routes',
  props<{ routeIds: number[] }>()
);

export const updateRoutesSelection = createAction(
  '[RoutesChart] Update Routes Selection',
  props<{ addedRouteIds: number[]; removedRouteIds: number[] }>()
);

export const addFilter = createAction(
  '[RoutesChart] Add Filter',
  props<{ filter: ActiveFilter }>()
);

export const editFilter = createAction(
  '[RoutesChart] Edit Filter',
  props<{ currentFilter: ActiveFilter; previousFilter: ActiveFilter }>()
);

export const removeFilter = createAction(
  '[RoutesChart] Remove Filter',
  props<{ filter: ActiveFilter }>()
);

export const selectRange = createAction(
  '[RoutesChart] Select Range',
  props<{ rangeIndex: number }>()
);

export const changePage = createAction(
  '[RoutesChart] Change Page',
  props<{ pageIndex: number; pageSize: number }>()
);

export const previousRangeOffset = createAction(
  '[RoutesChart] Previous Range Offset',
  props<{ rangeOffset: number }>()
);

export const nextRangeOffset = createAction(
  '[RoutesChart] Next Range Offset',
  props<{ rangeOffset: number }>()
);

export const anchorRangeOffset = createAction(
  '[RoutesChart] Anchor Range Offset',
  props<{ rangeOffset: number }>()
);

export const editVisit = createAction('[RoutesChart] Show Visit', props<{ visitId: number }>());

export const mouseEnterVisitRequest = createAction(
  '[RoutesChart] Mouse Enter Visit Request',
  props<{ id: number }>()
);

export const mouseExitVisitRequest = createAction('[RoutesChart] Mouse Exit Visit Request');
