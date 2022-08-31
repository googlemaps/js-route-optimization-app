/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { NumberFilterOperation } from 'src/app/shared/models';
import {
  DispatcherActions,
  MetadataControlBarActions,
  PostSolveMetricsActions,
  RoutesMetadataActions,
} from '../actions';
import { Page } from '../models';
import {
  reducer,
  initialState,
  selectDisplayColumns,
  selectFilters,
  selectPageIndex,
  selectPageSize,
  selectSelected,
  selectSort,
} from './routes-metadata.reducer';

describe('RoutesMetadata Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;

      const result = reducer(initialState, action);

      expect(result).toBe(initialState);
    });
  });

  it('on RoutesMetadataActions changePage', () => {
    const newState = reducer(
      initialState,
      RoutesMetadataActions.changePage({ pageIndex: 5, pageSize: 2 })
    );
    expect(newState.pageIndex).not.toEqual(initialState.pageIndex);
    expect(newState.pageSize).not.toEqual(initialState.pageSize);
    expect(newState.pageIndex).toBe(5);
    expect(newState.pageSize).toBe(2);
  });

  it('on RoutesMetadataActions changePage', () => {
    const newState = reducer(initialState, RoutesMetadataActions.selectRoute({ routeId: 111 }));
    expect(newState.selected).not.toEqual(initialState.selected);
    expect(newState.selected[0]).toBe(111);
  });

  it('on RoutesMetadataActions selectRoutes', () => {
    const newState = reducer(
      initialState,
      RoutesMetadataActions.selectRoutes({ routeIds: [111, 222] })
    );
    expect(newState.selected).not.toEqual(initialState.selected);
    expect(newState.selected[0]).toBe(111);
    expect(newState.selected[1]).toBe(222);
  });

  it('on RoutesMetadataActions deselectRoute', () => {
    const selectedState = reducer(
      initialState,
      RoutesMetadataActions.selectRoute({ routeId: 111 })
    );
    expect(selectedState.selected).not.toEqual(initialState.selected);
    expect(selectedState.selected.length).toBeGreaterThan(0);
    const newState = reducer(selectedState, RoutesMetadataActions.deselectRoute({ routeId: 111 }));
    expect(newState.selected).not.toEqual(selectedState.selected);
    expect(newState.selected).not.toEqual(selectedState.selected);
    expect(newState.selected.length).toBe(0);
  });

  it('on RoutesMetadataActions deselectRoutes', () => {
    const selectedState = reducer(
      initialState,
      RoutesMetadataActions.selectRoutes({ routeIds: [111, 222] })
    );
    expect(selectedState.selected).not.toEqual(initialState.selected);
    expect(selectedState.selected.length).toBeGreaterThan(1);
    const newState = reducer(
      selectedState,
      RoutesMetadataActions.deselectRoutes({ routeIds: [111] })
    );
    expect(selectedState.selected).not.toEqual(newState.selected);
    expect(newState.selected.length).toBe(1);
  });

  it('on RoutesMetadataActions addFilter', () => {
    const newState = reducer(
      initialState,
      MetadataControlBarActions.addFilter({
        filter: { id: '12', label: 'test' },
        page: Page.RoutesMetadata,
      })
    );
    expect(initialState.filters).not.toEqual(newState.filters);
    expect(newState.filters[0]).toEqual({ id: '12', label: 'test' });
  });

  it('on RoutesMetadataActions editFilter', () => {
    const state = reducer(
      initialState,
      MetadataControlBarActions.addFilter({
        filter: { id: '12', label: 'test' },
        page: Page.RoutesMetadata,
      })
    );
    expect(initialState.filters).not.toEqual(state.filters);
    const newState = reducer(
      state,
      MetadataControlBarActions.editFilter({
        currentFilter: { id: '122', label: 'test1' },
        previousFilter: { id: '12', label: 'test' },
        page: Page.RoutesMetadata,
      })
    );
    expect(newState.filters).not.toEqual(state.filters);
    expect(newState.filters[0]).toEqual({ id: '122', label: 'test1' });
  });

  it('on RoutesMetadataActions removeFilter', () => {
    const state = reducer(
      initialState,
      MetadataControlBarActions.addFilter({
        filter: { id: '12', label: 'test' },
        page: Page.RoutesMetadata,
      })
    );
    expect(state.filters).not.toEqual(initialState.filters);
    expect(state.filters.length).toBeGreaterThan(0);
    const newState = reducer(
      state,
      MetadataControlBarActions.removeFilter({
        filter: { id: '12', label: 'test' },
        page: Page.RoutesMetadata,
      })
    );
    expect(state.filters).not.toEqual(newState.filters);
    expect(newState.filters.length).toBe(0);
  });

  it('on RoutesMetadataActions changeSort', () => {
    const newState = reducer(
      initialState,
      RoutesMetadataActions.changeSort({ active: 'true', direction: 'down' })
    );
    expect(newState.sort).not.toEqual(initialState.sort);
    expect(newState.sort).toEqual({ active: 'true', direction: 'down' });
  });

  it('on RoutesMetadataActions changeSort', () => {
    const newState = reducer(
      initialState,
      MetadataControlBarActions.changeDisplayColumns({
        displayColumns: { name: true, id: true },
        page: Page.RoutesMetadata,
      })
    );
    expect(newState.displayColumns).not.toEqual(initialState.displayColumns);
    expect(newState.displayColumns).toEqual({ name: true, id: true });
  });

  it('on RoutesMetadataActions uploadScenarioSuccess', () => {
    const newState = reducer(
      initialState,
      DispatcherActions.uploadScenarioSuccess({ scenario: {} })
    );
    expect(newState).toEqual(initialState);
  });

  it('on RoutesMetadataActions clearSolution', () => {
    const newState = reducer(initialState, DispatcherActions.clearSolution());
    expect(newState).toEqual(initialState);
  });

  it('on RoutesMetadataActions showMetadataForRoute', () => {
    const newState = reducer(
      initialState,
      PostSolveMetricsActions.showMetadataForRoute({ id: 123 })
    );
    expect(newState.filters).not.toEqual(initialState.filters);
    expect(newState.filters.length).toBeGreaterThan(0);
    expect(newState.filters[0].id).toEqual('id');
    expect(newState.filters[0].label).toEqual('Route ID = 123');
    expect(newState.filters[0].params).toEqual({
      operation: NumberFilterOperation.Equal,
      value: 123,
    });
  });

  it('validate route-chart selectors', () => {
    expect(selectSelected(initialState)).toEqual(initialState.selected);
    expect(selectPageIndex(initialState)).toEqual(initialState.pageIndex);
    expect(selectPageSize(initialState)).toEqual(initialState.pageSize);
    expect(selectFilters(initialState)).toEqual(initialState.filters);
    expect(selectSort(initialState)).toEqual(initialState.sort);
    expect(selectDisplayColumns(initialState)).toEqual(initialState.displayColumns);
  });
});
