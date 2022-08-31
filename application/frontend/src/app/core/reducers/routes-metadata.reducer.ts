/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { ActiveFilter, NumberFilterOperation } from 'src/app/shared/models/filter';
import {
  DispatcherActions,
  MetadataControlBarActions,
  RoutesMetadataActions,
  PostSolveMetricsActions,
} from '../actions';
import { Page, routeIdMetadataFilterOption } from '../models';

export const routesMetadataFeatureKey = 'routesMetadata';

export interface State {
  pageIndex: number;
  pageSize: number;
  sort: { active: string; direction: string };
  filters: ActiveFilter[];
  selected: number[];
  displayColumns?: { [id: string]: boolean };
}

export const initialState: State = {
  pageIndex: 0,
  pageSize: 25,
  sort: { active: null, direction: null },
  filters: [],
  selected: [],
  displayColumns: null,
};

export const reducer = createReducer(
  initialState,
  on(RoutesMetadataActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(RoutesMetadataActions.selectRoute, (state, { routeId }) => ({
    ...state,
    selected: state.selected.concat(routeId),
  })),
  on(RoutesMetadataActions.selectRoutes, (state, { routeIds }) => {
    const added = routeIds.filter((id) => !state.selected.includes(id));
    const selected = state.selected.concat(added);
    return { ...state, selected };
  }),
  on(RoutesMetadataActions.deselectRoute, (state, { routeId }) => ({
    ...state,
    selected: state.selected.filter((id) => id !== routeId),
  })),
  on(RoutesMetadataActions.deselectRoutes, (state, { routeIds }) => {
    const selected = state.selected.filter((id) => !routeIds.includes(id));
    return { ...state, selected };
  }),
  on(MetadataControlBarActions.addFilter, (state, { filter, page }) =>
    page === Page.RoutesMetadata
      ? { ...state, filters: state.filters.concat(filter), pageIndex: 0 }
      : state
  ),
  on(MetadataControlBarActions.editFilter, (state, { currentFilter, previousFilter, page }) =>
    page === Page.RoutesMetadata
      ? {
          ...state,
          filters: state.filters.map((f) =>
            f.id === previousFilter.id && f.params === previousFilter.params ? currentFilter : f
          ),
          pageIndex: 0,
        }
      : state
  ),
  on(MetadataControlBarActions.removeFilter, (state, { filter, page }) =>
    page === Page.RoutesMetadata
      ? {
          ...state,
          filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
          pageIndex: 0,
        }
      : state
  ),
  on(RoutesMetadataActions.changeSort, (state, { active, direction }) => ({
    ...state,
    sort: { active, direction },
  })),
  on(MetadataControlBarActions.changeDisplayColumns, (state, { displayColumns, page }) =>
    page === Page.RoutesMetadata ? { ...state, displayColumns } : state
  ),
  on(DispatcherActions.uploadScenarioSuccess, DispatcherActions.clearSolution, (_) => initialState),
  on(PostSolveMetricsActions.showMetadataForRoute, (state, { id }) => {
    const filters = [
      {
        id: routeIdMetadataFilterOption.id,
        label: `${routeIdMetadataFilterOption.label} = ${id}`,
        params: {
          operation: NumberFilterOperation.Equal,
          value: id,
        },
      },
    ];
    return { ...state, filters };
  })
);

export const selectSelected = (state: State): number[] => state.selected;

export const selectPageIndex = (state: State): number => state.pageIndex;

export const selectPageSize = (state: State): number => state.pageSize;

export const selectFilters = (state: State): ActiveFilter[] => state.filters;

export const selectSort = (state: State): { active: string; direction: string } => state.sort;

export const selectDisplayColumns = (state: State): { [id: string]: boolean } =>
  state.displayColumns;
