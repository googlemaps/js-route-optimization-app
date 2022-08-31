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
  MapActions,
  PreSolveShipmentActions,
  ShipmentActions,
  ShipmentsMetadataActions,
  ValidationResultActions,
} from '../actions';
import * as fromMapTheme from '../services/map-theme.service';

export const preSolveShipmentFeatureKey = 'preSolveShipment';

export interface State {
  pageIndex: number;
  pageSize: number;
  sort: { active: string; direction: string };
  filters: ActiveFilter[];
  selected: number[];
  selectedColors: [id: number, color: number][];
  requested: number[];
  displayColumns?: { [id: string]: boolean };
  editShipmentId?: number;
}

export const initialState: State = {
  pageIndex: 0,
  pageSize: 25,
  sort: { active: null, direction: null },
  filters: [],
  selected: [],
  selectedColors: [],
  requested: [],
  displayColumns: null,
  editShipmentId: null,
};

export const reducer = createReducer(
  initialState,

  on(PreSolveShipmentActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(PreSolveShipmentActions.selectShipment, (state, { shipmentId }) => {
    const selected = state.selected.concat(shipmentId);
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(PreSolveShipmentActions.selectShipments, (state, { shipmentIds }) => {
    const addedShipments = shipmentIds.filter((id) => !state.selected.includes(id));
    const selected = state.selected.concat(addedShipments);
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(PreSolveShipmentActions.deselectShipment, (state, { shipmentId }) => {
    const selected = state.selected.filter((id) => id !== shipmentId);
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(ShipmentActions.deleteShipment, (state, { id }) => {
    const selected = state.selected.filter((selectedId) => selectedId !== id);
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(PreSolveShipmentActions.deselectShipments, (state, { shipmentIds }) => {
    const selected = state.selected.filter((id) => !shipmentIds.includes(id));
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(ShipmentActions.deleteShipments, (state, { ids }) => {
    const selected = state.selected.filter((id) => !ids.includes(id));
    return {
      ...state,
      selected,
      selectedColors: fromMapTheme.getSelectedColors(selected, state.selectedColors),
    };
  }),
  on(
    PreSolveShipmentActions.updateShipmentsSelection,
    (state, { addedShipmentIds, removedShipmentIds }) => {
      const addedShipments = addedShipmentIds.filter((id) => !state.selected.includes(id));
      const retainedShipments = state.selected.filter((id) => !removedShipmentIds.includes(id));
      const selected = retainedShipments.concat(addedShipments);

      const selectedShipmentsColorMap = new Map(state.selectedColors);
      removedShipmentIds.forEach((key) => selectedShipmentsColorMap.delete(key));
      const selectedColors = fromMapTheme.getSelectedColors(
        selected,
        Array.from(selectedShipmentsColorMap.entries())
      );

      return { ...state, selected, selectedColors };
    }
  ),
  on(DispatcherActions.loadScenario, (state, { selectedShipments }) => {
    const selectedColors = fromMapTheme.getSelectedColors(selectedShipments, []);
    return { ...state, selected: selectedShipments, selectedColors };
  }),
  on(PreSolveShipmentActions.addFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.concat(filter),
    pageIndex: 0,
  })),
  on(PreSolveShipmentActions.editFilter, (state, { currentFilter, previousFilter }) => ({
    ...state,
    filters: state.filters.map((f) =>
      f.id === previousFilter.id && f.params === previousFilter.params ? currentFilter : f
    ),
    pageIndex: 0,
  })),
  on(PreSolveShipmentActions.removeFilter, (state, { filter }) => ({
    ...state,
    filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
    pageIndex: 0,
  })),
  on(PreSolveShipmentActions.changeSort, (state, { active, direction }) => ({
    ...state,
    sort: { active, direction },
  })),
  on(PreSolveShipmentActions.changeDisplayColumns, (state, { displayColumns }) => ({
    ...state,
    displayColumns,
  })),
  on(DispatcherActions.uploadScenarioSuccess, (_) => initialState),
  on(DispatcherActions.loadSolution, (state, { requestedShipmentIds }) => ({
    ...state,
    requested: requestedShipmentIds,
  })),
  on(
    MapActions.editPreSolveShipment,
    PreSolveShipmentActions.editShipment,
    ShipmentsMetadataActions.editShipment,
    ValidationResultActions.editPreSolveShipment,
    (state, { shipmentId }) => ({ ...state, editShipmentId: shipmentId })
  ),
  on(PreSolveShipmentActions.cancelEditShipment, PreSolveShipmentActions.saveShipment, (state) => ({
    ...state,
    editShipmentId: null,
  })),
  on(DispatcherActions.clearSolution, (state) => ({ ...state, requested: [] }))
);

export const selectSelected = (state: State): number[] => state.selected;

export const selectSelectedColors = (state: State): [id: number, color: number][] =>
  state.selectedColors;

export const selectRequested = (state: State): number[] => state.requested;

export const selectPageIndex = (state: State): number => state.pageIndex;

export const selectPageSize = (state: State): number => state.pageSize;

export const selectFilters = (state: State): ActiveFilter[] => state.filters;

export const selectSort = (state: State): { active: string; direction: string } => state.sort;

export const selectDisplayColumns = (state: State): { [id: string]: boolean } =>
  state.displayColumns;

export const selectEditShipmentId = (state: State): number => state.editShipmentId;
