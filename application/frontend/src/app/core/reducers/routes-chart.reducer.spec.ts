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

import {
  DispatcherActions,
  MainNavActions,
  PostSolveControlBarActions,
  RoutesChartActions,
  ValidationResultActions,
} from '../actions';
import {
  reducer,
  initialState,
  selectSelectedRoutes,
  selectSelectedRoutesColors,
  selectAddedRange,
  selectFilters,
  selectPageIndex,
  selectPageSize,
  selectRangeIndex,
  selectRangeOffset,
  selectView,
} from './routes-chart.reducer';

describe('RoutesChart Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('should change rangeIndex', () => {
    const newState = reducer(initialState, RoutesChartActions.selectRange({ rangeIndex: 5 }));
    expect(newState.rangeIndex).not.toEqual(initialState.rangeIndex);
    expect(newState.rangeIndex).toBe(5);
  });

  it('should change Page', () => {
    const newState = reducer(
      initialState,
      RoutesChartActions.changePage({ pageIndex: 5, pageSize: 2 })
    );
    expect(newState.pageIndex).not.toEqual(initialState.pageIndex);
    expect(newState.pageSize).not.toEqual(initialState.pageSize);
    expect(newState.pageIndex).toBe(5);
    expect(newState.pageSize).toBe(2);
  });

  it('on selectRoute', () => {
    const newState = reducer(initialState, RoutesChartActions.selectRoute({ routeId: 111 }));
    expect(newState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(newState.selectedRoutes[0]).toBe(111);
  });

  it('on selectRoutes', () => {
    const newState = reducer(
      initialState,
      RoutesChartActions.selectRoutes({ routeIds: [111, 222] })
    );
    expect(newState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(newState.selectedRoutes[0]).toBe(111);
    expect(newState.selectedRoutes[1]).toBe(222);
  });

  it('on deselectRoute', () => {
    const selectedState = reducer(initialState, RoutesChartActions.selectRoute({ routeId: 111 }));
    expect(selectedState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(selectedState.selectedRoutes.length).toBeGreaterThan(0);
    const newState = reducer(selectedState, RoutesChartActions.deselectRoute({ routeId: 111 }));
    expect(newState.selectedRoutes).not.toEqual(selectedState.selectedRoutes);
    expect(newState.selectedRoutes.length).toBe(0);
    expect(newState.selectedRoutesColors[0]).toEqual(selectedState.selectedRoutesColors[0]);
  });

  it('on deselectRoutes', () => {
    const selectedState = reducer(
      initialState,
      RoutesChartActions.selectRoutes({ routeIds: [111, 222] })
    );
    expect(selectedState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(selectedState.selectedRoutes.length).toBeGreaterThan(0);
    const newState = reducer(selectedState, RoutesChartActions.deselectRoutes({ routeIds: [111] }));
    expect(newState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(newState.selectedRoutes.length).toBe(1);
    expect(newState.selectedRoutesColors).toEqual(initialState.selectedRoutesColors);
  });

  it('on updateRoutesSelection', () => {
    let newState = reducer(
      initialState,
      RoutesChartActions.updateRoutesSelection({ addedRouteIds: [111, 222], removedRouteIds: [] })
    );
    expect(newState.selectedRoutes).not.toEqual(initialState.selectedRoutes);
    expect(newState.selectedRoutes[0]).toBe(111);
    expect(newState.selectedRoutes[1]).toBe(222);
    newState = reducer(
      newState,
      RoutesChartActions.updateRoutesSelection({ addedRouteIds: [], removedRouteIds: [222] })
    );
    expect(newState.selectedRoutes.length).toBe(1);
  });

  it('on addFilter', () => {
    const newState = reducer(
      initialState,
      RoutesChartActions.addFilter({ filter: { id: '12', label: 'test' } })
    );
    expect(newState.filters).not.toEqual(initialState.filters);
    expect(newState.filters[0]).toEqual({ id: '12', label: 'test' });
  });

  it('on editFilter', () => {
    const state = reducer(
      initialState,
      RoutesChartActions.addFilter({ filter: { id: '12', label: 'test' } })
    );
    expect(state.filters).not.toEqual(initialState.filters);
    const newState = reducer(
      state,
      RoutesChartActions.editFilter({
        currentFilter: { id: '122', label: 'test1' },
        previousFilter: { id: '12', label: 'test' },
      })
    );
    expect(state.filters).not.toEqual(initialState.filters);
    expect(newState.filters[0]).toEqual({ id: '122', label: 'test1' });
  });

  it('on removeFilter', () => {
    const state = reducer(
      initialState,
      RoutesChartActions.addFilter({ filter: { id: '12', label: 'test' } })
    );
    expect(state.filters).not.toEqual(initialState.filters);
    expect(state.filters.length).toBeGreaterThan(0);
    const newState = reducer(
      state,
      RoutesChartActions.removeFilter({ filter: { id: '12', label: 'test' } })
    );
    expect(newState.filters).not.toEqual(state.filters);
    expect(newState.filters.length).toBe(0);
  });

  it('on anchorRangeOffset', () => {
    const newState = reducer(
      initialState,
      RoutesChartActions.anchorRangeOffset({ rangeOffset: 2 })
    );
    expect(newState.rangeOffset).not.toEqual(initialState.rangeOffset);
    expect(newState.rangeOffset).toEqual(2);
  });

  it('on nextRangeOffset', () => {
    const newState = reducer(initialState, RoutesChartActions.nextRangeOffset({ rangeOffset: 2 }));
    expect(newState.rangeOffset).not.toEqual(initialState.rangeOffset);
    expect(newState.rangeOffset).toEqual(2);
  });

  it('on previousRangeOffset', () => {
    const newState = reducer(
      initialState,
      RoutesChartActions.previousRangeOffset({ rangeOffset: 2 })
    );
    expect(newState.rangeOffset).not.toEqual(initialState.rangeOffset);
    expect(newState.rangeOffset).toEqual(2);
  });

  it('on initializeRangeOffset', () => {
    const newState = reducer(
      initialState,
      DispatcherActions.initializeRangeOffset({ rangeOffset: 2 })
    );
    expect(newState.rangeOffset).not.toEqual(initialState.rangeOffset);
    expect(newState.rangeOffset).toEqual(2);
  });

  it('on changeRangeOffset', () => {
    const newState = reducer(
      initialState,
      PostSolveControlBarActions.changeRangeOffset({ rangeOffset: 2 })
    );
    expect(newState.rangeOffset).not.toEqual(initialState.rangeOffset);
    expect(newState.rangeOffset).toEqual(2);
  });

  it('on uploadScenarioSuccess', () => {
    const newState = reducer(
      initialState,
      DispatcherActions.uploadScenarioSuccess({ scenario: {} })
    );
    expect(newState).toEqual(initialState);
  });

  it('on MainNavActions solve', () => {
    const newState = reducer(initialState, MainNavActions.solve());
    expect(newState).toEqual(initialState);
  });

  it('on ValidationResultActions solve', () => {
    const newState = reducer(initialState, ValidationResultActions.solve());
    expect(newState).toEqual(initialState);
  });

  it('validate route-chart selectors', () => {
    expect(selectSelectedRoutes(initialState)).toEqual(initialState.selectedRoutes);
    expect(selectSelectedRoutesColors(initialState)).toEqual(initialState.selectedRoutesColors);
    expect(selectPageIndex(initialState)).toEqual(initialState.pageIndex);
    expect(selectPageSize(initialState)).toEqual(initialState.pageSize);
    expect(selectView(initialState)).toEqual(initialState.view);
    expect(selectRangeIndex(initialState)).toEqual(initialState.rangeIndex);
    expect(selectRangeOffset(initialState)).toEqual(initialState.rangeOffset);
    expect(selectFilters(initialState)).toEqual(initialState.filters);
    expect(selectAddedRange(initialState)).toEqual(initialState.addedRange);
  });
});
