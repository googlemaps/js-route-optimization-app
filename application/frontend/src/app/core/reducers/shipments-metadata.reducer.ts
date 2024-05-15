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
import {
  DispatcherActions,
  MetadataControlBarActions,
  PostSolveMetricsActions,
  ShipmentsMetadataActions,
} from '../actions';
import { Page, statusShipmentMetadataFilterOption } from '../models';

export const shipmentsMetadataFeatureKey = 'shipmentsMetadata';

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

  on(ShipmentsMetadataActions.changePage, (state, { pageIndex, pageSize }) => ({
    ...state,
    pageIndex,
    pageSize,
  })),
  on(ShipmentsMetadataActions.selectShipment, (state, { shipmentId }) => {
    const selected = state.selected.concat(shipmentId);
    return { ...state, selected };
  }),
  on(ShipmentsMetadataActions.selectShipments, (state, { shipmentIds }) => {
    const addedShipments = shipmentIds.filter((id) => !state.selected.includes(id));
    const selected = state.selected.concat(addedShipments);
    return { ...state, selected };
  }),
  on(ShipmentsMetadataActions.deselectShipment, (state, { shipmentId }) => {
    const selected = state.selected.filter((id) => id !== shipmentId);
    return { ...state, selected };
  }),
  on(ShipmentsMetadataActions.deselectShipments, (state, { shipmentIds }) => {
    const selected = state.selected.filter((id) => !shipmentIds.includes(id));
    return { ...state, selected };
  }),
  on(MetadataControlBarActions.addFilter, (state, { filter, page }) =>
    page === Page.ShipmentsMetadata
      ? {
          ...state,
          filters: state.filters.concat(filter),
          pageIndex: 0,
        }
      : state
  ),
  on(MetadataControlBarActions.editFilter, (state, { currentFilter, previousFilter, page }) =>
    page === Page.ShipmentsMetadata
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
    page === Page.ShipmentsMetadata
      ? {
          ...state,
          filters: state.filters.filter((f) => !(f.id === filter.id && f.params === filter.params)),
          pageIndex: 0,
        }
      : state
  ),
  on(ShipmentsMetadataActions.changeSort, (state, { active, direction }) => ({
    ...state,
    sort: { active, direction },
  })),
  on(MetadataControlBarActions.changeDisplayColumns, (state, { displayColumns, page }) =>
    page === Page.ShipmentsMetadata ? { ...state, displayColumns } : state
  ),
  on(PostSolveMetricsActions.showSkippedShipments, (state) => {
    const filters = state.filters.filter((f) => f.id !== statusShipmentMetadataFilterOption.id);
    const option = statusShipmentMetadataFilterOption.options.find((o) => o.value);
    filters.push({
      id: statusShipmentMetadataFilterOption.id,
      label: `${statusShipmentMetadataFilterOption.label} is ${option.label}`,
      params: { value: true },
    });
    return { ...state, filters };
  }),
  on(DispatcherActions.uploadScenarioSuccess, DispatcherActions.clearSolution, (_) => initialState)
);

export const selectSelected = (state: State): number[] => state.selected;

export const selectPageIndex = (state: State): number => state.pageIndex;

export const selectPageSize = (state: State): number => state.pageSize;

export const selectFilters = (state: State): ActiveFilter[] => state.filters;

export const selectSort = (state: State): { active: string; direction: string } => state.sort;

export const selectDisplayColumns = (state: State): { [id: string]: boolean } =>
  state.displayColumns;
