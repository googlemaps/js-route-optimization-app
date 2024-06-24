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

import { createReducer, on } from '@ngrx/store';
import { ActiveFilter } from 'src/app/shared/models';
import * as chartConfig from 'src/app/shared/models/chart-config';
import {
  DispatcherActions,
  MainNavActions,
  PostSolveControlBarActions,
  RoutesChartActions,
  ValidationResultActions,
} from '../actions';
import * as fromMapTheme from '../services/map-theme.service';

export const routesChartFeatureKey = 'routesChart';

export interface State {
  view: string;
  rangeIndex: number;
  rangeOffset: number;
  addedRange: number;
  pageIndex: number;
  pageSize: number;
  filters: ActiveFilter[];
  selectedRoutes: number[];
  selectedRoutesColors: [id: number, colorIdx: number][];
}

export const initialState: State = {
  view: 'day',
  rangeIndex: chartConfig.day.defaultRangeIndex,
  rangeOffset: 0,
  addedRange: 0,
  pageIndex: 0,
  pageSize: 50,
  filters: [],
  selectedRoutes: [],
  selectedRoutesColors: [],
};

export const reducer = createReducer(
  initialState,
  on(RoutesChartActions.selectRange, (state, { rangeIndex }) => ({ ...state, rangeIndex })),
  on(RoutesChartActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(RoutesChartActions.selectRoute, (state, { routeId }) => {
    const selectedRoutes = state.selectedRoutes.concat(routeId);
    return {
      ...state,
      selectedRoutes,
    };
  }),
  on(RoutesChartActions.selectRoutes, (state, { routeIds }) => {
    const addedRoutes = routeIds.filter((id) => !state.selectedRoutes.includes(id));
    const selectedRoutes = state.selectedRoutes.concat(addedRoutes);
    return {
      ...state,
      selectedRoutes,
    };
  }),
  on(RoutesChartActions.deselectRoute, (state, { routeId }) => {
    const selectedRoutes = state.selectedRoutes.filter((id) => id !== routeId);
    return {
      ...state,
      selectedRoutes,
    };
  }),
  on(RoutesChartActions.deselectRoutes, (state, { routeIds }) => {
    const selectedRoutes = state.selectedRoutes.filter((id) => !routeIds.includes(id));
    return {
      ...state,
      selectedRoutes,
    };
  }),
  on(RoutesChartActions.updateRoutesSelection, (state, { addedRouteIds, removedRouteIds }) => {
    const addedRoutes = addedRouteIds.filter((id) => !state.selectedRoutes.includes(id));
    const retainedRoutes = state.selectedRoutes.filter((id) => !removedRouteIds.includes(id));
    const selectedRoutes = retainedRoutes.concat(addedRoutes);

    return { ...state, selectedRoutes };
  }),
  on(RoutesChartActions.addFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.concat(filter),
    pageIndex: 0,
  })),
  on(RoutesChartActions.editFilter, (state, { currentFilter, previousFilter }) => ({
    ...state,
    filters: state.filters.map((f) =>
      f.id === previousFilter.id && f.params === previousFilter.params ? currentFilter : f
    ),
    pageIndex: 0,
  })),
  on(RoutesChartActions.removeFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
    pageIndex: 0,
  })),
  on(
    RoutesChartActions.anchorRangeOffset,
    RoutesChartActions.nextRangeOffset,
    RoutesChartActions.previousRangeOffset,
    (state, { rangeOffset }) => ({ ...state, rangeOffset })
  ),
  on(
    DispatcherActions.initializeRangeOffset,
    PostSolveControlBarActions.changeRangeOffset,
    (state, { rangeOffset }) => ({ ...state, rangeOffset, addedRange: 0 })
  ),
  on(DispatcherActions.uploadScenarioSuccess, (_) => initialState),
  on(MainNavActions.solve, ValidationResultActions.solve, (state) => ({
    ...state,
    selectedRoutes: initialState.selectedRoutes,
  })),
  on(DispatcherActions.loadSolution, (state, solution) => {
    return {
      ...state,
      selectedRoutesColors: fromMapTheme.getSelectedColors(
        solution.shipmentRoutes.map((route) => route.id),
        []
      ),
    };
  }),
  on(RoutesChartActions.setView, (state, props) => ({
    ...state,
    selectedRoutes: props.selectedRouteIds,
    filters: [],
    pageIndex: 0,
    pageSize: 50,
    addedRange: 0,
    rangeIndex: chartConfig.day.defaultRangeIndex,
    rangeOffset: props.rangeOffset,
  }))
);

export const selectSelectedRoutes = (state: State): number[] => state.selectedRoutes;

export const selectSelectedRoutesColors = (state: State): [id: number, colorIdx: number][] =>
  state.selectedRoutesColors;

export const selectPageIndex = (state: State): number => state.pageIndex;

export const selectPageSize = (state: State): number => state.pageSize;

export const selectView = (state: State): string => state.view;

export const selectRangeIndex = (state: State): number => state.rangeIndex;

export const selectRangeOffset = (state: State): number => state.rangeOffset;

export const selectFilters = (state: State): ActiveFilter[] => state.filters;

export const selectAddedRange = (state: State): number => state.addedRange;
