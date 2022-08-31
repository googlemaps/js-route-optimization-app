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
import {
  DispatcherActions,
  PreSolveVehicleOperatorActions,
  VehicleOperatorActions,
} from '../actions';

export const preSolveVehicleOperatorFeatureKey = 'preSolveVehicleOperator';

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

  on(PreSolveVehicleOperatorActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(PreSolveVehicleOperatorActions.selectVehicleOperator, (state, { vehicleOperatorId }) => ({
    ...state,
    selected: state.selected.concat(vehicleOperatorId),
  })),
  on(PreSolveVehicleOperatorActions.selectVehicleOperators, (state, { vehicleOperatorIds }) => {
    const added = vehicleOperatorIds.filter((id) => !state.selected.includes(id));
    const selected = state.selected.concat(added);
    return { ...state, selected };
  }),
  on(PreSolveVehicleOperatorActions.deselectVehicleOperator, (state, { vehicleOperatorId }) => ({
    ...state,
    selected: state.selected.filter((id) => id !== vehicleOperatorId),
  })),
  on(VehicleOperatorActions.deleteVehicleOperator, (state, { id }) => ({
    ...state,
    selected: state.selected.filter((selectedId) => selectedId !== id),
  })),
  on(PreSolveVehicleOperatorActions.deselectVehicleOperators, (state, { vehicleOperatorIds }) => {
    const selected = state.selected.filter((id) => !vehicleOperatorIds.includes(id));
    return { ...state, selected };
  }),
  on(VehicleOperatorActions.deleteVehicleOperators, (state, { ids }) => {
    const selected = state.selected.filter((id) => !ids.includes(id));
    return { ...state, selected };
  }),
  on(
    PreSolveVehicleOperatorActions.updateVehicleOperatorsSelection,
    (state, { addedVehicleOperatorIds, removedVehicleOperatorIds }) => {
      const addedVehicleOperators = addedVehicleOperatorIds.filter(
        (id) => !state.selected.includes(id)
      );
      const retainedVehicleOperators = state.selected.filter(
        (id) => !removedVehicleOperatorIds.includes(id)
      );
      return { ...state, selected: retainedVehicleOperators.concat(addedVehicleOperators) };
    }
  ),
  on(DispatcherActions.loadScenario, (state, { selectedVehicleOperators }) => ({
    ...state,
    selected: selectedVehicleOperators,
  })),
  on(PreSolveVehicleOperatorActions.addFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.concat(filter),
    pageIndex: 0,
  })),
  on(PreSolveVehicleOperatorActions.editFilter, (state, { currentFilter, previousFilter }) => ({
    ...state,
    filters: state.filters.map((f) =>
      f.id === previousFilter.id && f.params === previousFilter.params ? currentFilter : f
    ),
    pageIndex: 0,
  })),
  on(PreSolveVehicleOperatorActions.removeFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
    pageIndex: 0,
  })),
  on(PreSolveVehicleOperatorActions.changeSort, (state, { active, direction }) => ({
    ...state,
    sort: { active, direction },
  })),
  on(PreSolveVehicleOperatorActions.changeDisplayColumns, (state, { displayColumns }) => ({
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
