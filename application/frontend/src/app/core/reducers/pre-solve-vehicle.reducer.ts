/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { ActiveFilter } from 'src/app/shared/models';
import { DispatcherActions, VehicleActions } from '../actions';
import * as PreSolveVehicleActions from '../actions/pre-solve-vehicle.actions';

export const preSolveVehicleFeatureKey = 'preSolveVehicle';

export interface State {
  pageIndex: number;
  pageSize: number;
  sort: { active: string; direction: string };
  filters: ActiveFilter[];
  selected: number[];
  requested: number[];
  displayColumns?: { [id: string]: boolean };
}

export const initialState: State = {
  pageIndex: 0,
  pageSize: 25,
  sort: { active: null, direction: null },
  filters: [],
  selected: [],
  requested: [],
  displayColumns: null,
};

export const reducer = createReducer(
  initialState,

  on(PreSolveVehicleActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(PreSolveVehicleActions.selectVehicle, (state, { vehicleId }) => ({
    ...state,
    selected: state.selected.includes(vehicleId)
      ? state.selected
      : state.selected.concat(vehicleId),
  })),
  on(PreSolveVehicleActions.selectVehicles, (state, { vehicleIds }) => {
    const added = vehicleIds.filter((id) => !state.selected.includes(id));
    const selected = state.selected.concat(added);
    return { ...state, selected };
  }),
  on(PreSolveVehicleActions.deselectVehicle, (state, { vehicleId }) => ({
    ...state,
    selected: state.selected.filter((id) => id !== vehicleId),
  })),
  on(VehicleActions.deleteVehicle, (state, { id }) => ({
    ...state,
    selected: state.selected.filter((selectedId) => selectedId !== id),
  })),
  on(PreSolveVehicleActions.deselectVehicles, (state, { vehicleIds }) => {
    const selected = state.selected.filter((id) => !vehicleIds.includes(id));
    return { ...state, selected };
  }),
  on(VehicleActions.deleteVehicles, (state, { ids }) => {
    const selected = state.selected.filter((id) => !ids.includes(id));
    return { ...state, selected };
  }),
  on(
    PreSolveVehicleActions.updateVehiclesSelection,
    (state, { addedVehicleIds, removedVehicleIds }) => {
      const addedVehicles = addedVehicleIds.filter((id) => !state.selected.includes(id));
      const retainedVehicles = state.selected.filter((id) => !removedVehicleIds.includes(id));
      return { ...state, selected: retainedVehicles.concat(addedVehicles) };
    }
  ),
  on(DispatcherActions.loadScenario, (state, { selectedVehicles }) => ({
    ...state,
    selected: selectedVehicles,
  })),
  on(PreSolveVehicleActions.addFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.concat(filter),
    pageIndex: 0,
  })),
  on(PreSolveVehicleActions.editFilter, (state, { currentFilter, previousFilter }) => ({
    ...state,
    filters: state.filters.map((f) =>
      f.id === previousFilter.id && f.params === previousFilter.params ? currentFilter : f
    ),
    pageIndex: 0,
  })),
  on(PreSolveVehicleActions.removeFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
    pageIndex: 0,
  })),
  on(PreSolveVehicleActions.changeSort, (state, { active, direction }) => ({
    ...state,
    sort: { active, direction },
  })),
  on(PreSolveVehicleActions.changeDisplayColumns, (state, { displayColumns }) => ({
    ...state,
    displayColumns,
  })),
  on(DispatcherActions.uploadScenarioSuccess, (_) => initialState),
  on(DispatcherActions.loadSolution, (state, { requestedVehicleIds }) => ({
    ...state,
    requested: requestedVehicleIds,
  })),
  on(DispatcherActions.clearSolution, (state) => ({ ...state, requested: [] }))
);

export const selectSelected = (state: State): number[] => state.selected;

export const selectRequested = (state: State): number[] => state.requested;

export const selectPageIndex = (state: State): number => state.pageIndex;

export const selectPageSize = (state: State): number => state.pageSize;

export const selectFilters = (state: State): ActiveFilter[] => state.filters;

export const selectSort = (state: State): { active: string; direction: string } => state.sort;

export const selectDisplayColumns = (state: State): { [id: string]: boolean } =>
  state.displayColumns;
