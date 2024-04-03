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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  selectedVehicleOperatorFilterOption,
  VehicleOperatorFilterOption,
  vehicleOperatorFilterOptions,
} from '../models';
import * as fromPreSolveVehicleOperator from '../reducers/pre-solve-vehicle-operator.reducer';
import * as fromVehicleOperator from './vehicle-operator.selectors';
import { VehicleOperatorColumn, vehicleOperatorColumns } from '../../vehicle-operators/models';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectPreSolveVehicleOperatorState =
  createFeatureSelector<fromPreSolveVehicleOperator.State>(
    fromPreSolveVehicleOperator.preSolveVehicleOperatorFeatureKey
  );

const selectFilters = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectFilters
);

const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedVehicleOperatorFilterOption.id)
);

const selectPageIndex = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectPageIndex
);

const selectPageSize = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectPageSize
);

const selectSort = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectSort
);

const selectSelected = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectSelected
);

const selectRequested = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectRequested
);

const selectRequestedIndexById = createSelector(
  selectRequested,
  (requested) => new Map(requested.map((id, index) => [id, index]))
);

const selectSelectedLookup = createSelector(selectSelected, (selected) => {
  const lookup: { [id: number]: true } = {};
  selected.forEach((id) => (lookup[id] = true));
  return lookup;
});

/** Gets vehicle Operators selected ordered by vehicle Operator id */
const selectSelectedVehicleOperators = createSelector(
  fromVehicleOperator.selectAll,
  selectSelectedLookup,
  (vehicleOperators, selected) =>
    vehicleOperators.filter((vehicleOperator) => selected[vehicleOperator.id])
);

const selectRequestedLookup = createSelector(selectRequested, (requested) => new Set(requested));

const selectRequestedVehicleOperators = createSelector(
  fromVehicleOperator.selectAll,
  selectRequestedLookup,
  (vehicleOperators, requested) =>
    vehicleOperators.filter((vehicleOperator) => requested.has(vehicleOperator.id))
);

const selectColumns = createSelector(
  selectPreSolveVehicleOperatorState,
  (_state) => vehicleOperatorColumns
);

const selectActiveSortColumn = createSelector(selectSort, selectColumns, (sort, columns) =>
  columns.find((column) => column.id === sort.active)
);

const selectVehicleOperatorFilterOptions = createSelector(
  selectPreSolveVehicleOperatorState,
  (_state) => {
    return vehicleOperatorFilterOptions;
  }
);

const selectActiveFilterFilterOptions = createSelector(
  selectFilters,
  selectVehicleOperatorFilterOptions,
  (filters, filterOptions) =>
    filters.map((f) => ({
      activeFilter: f,
      filterOption: filterOptions.find((fo) => fo.id === f.id),
    }))
);

const selectAvailableFiltersOptions = createSelector(
  selectFilters,
  selectVehicleOperatorFilterOptions,
  (filters, filterOptions) =>
    filterOptions
      .filter((fo) => !filters.some((f) => fo.id === f.id))
      .sort((a, b) => a.label.localeCompare(b.label))
);

const selectFiltersOptionById = (id: string) =>
  createSelector(
    selectVehicleOperatorFilterOptions,
    (filterOptions: VehicleOperatorFilterOption[]) => {
      return filterOptions.find((fo) => fo.id === id);
    }
  );

const selectFilteredVehicleOperators = createSelector(
  fromVehicleOperator.selectAll,
  selectActiveFilterFilterOptions,
  ShipmentModelSelectors.selectGlobalDuration,
  selectSelectedLookup,
  (vehicleOperators, filters, globalDuration, selected) => {
    return filters.length
      ? vehicleOperators.filter((vehicleOperator) => {
          return filters.every(({ activeFilter, filterOption }) => {
            const context = {
              vehicleOperator,
              globalDuration,
              selected: selected[vehicleOperator.id],
            };
            return filterOption.predicate(context, activeFilter.params);
          });
        })
      : vehicleOperators;
  }
);

const selectFilteredOperatorsSelected = createSelector(
  selectFilteredVehicleOperators,
  selectSelectedLookup,
  (vehicleOperators, selected) =>
    vehicleOperators.filter((vehicleOperator) => selected[vehicleOperator.id])
);

const selectFilteredVehicleOperatorsSelectedIds = createSelector(
  selectFilteredOperatorsSelected,
  (vehicleOperators) => vehicleOperators.map((vehicleOperator) => vehicleOperator.id)
);

const selectFilteredVehicleOperatorsSelectedLookup = createSelector(
  selectFilteredOperatorsSelected,
  (vehicleOperators) => {
    const selected = {} as { [id: number]: boolean };
    vehicleOperators.forEach((vehicleOperator) => {
      selected[vehicleOperator.id] = true;
    });
    return selected;
  }
);

const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

const selectFilteredVehicleIds = createSelector(
  selectFilteredVehicleOperators,
  selectHasActiveFilters,
  (vehicleOperators, filtersActive) =>
    filtersActive ? new Set<number>(vehicleOperators.map((v) => v.id)) : null
);

const selectVehicleOperators = createSelector(
  selectFilteredVehicleOperators,
  selectSelectedLookup,
  selectActiveSortColumn,
  selectSort,
  (vehicleOperators, selected, activeSortColumn, sort) => {
    if (activeSortColumn?.selector) {
      const defaultComparer = (a: { id: number; value: any }, b: { id: number; value: any }) =>
        a.id - b.id;
      let comparer = defaultComparer;
      if (sort.direction === 'asc') {
        comparer = (a, b) => a.value - b.value || defaultComparer(a, b);
      } else if (sort.direction === 'desc') {
        comparer = (a, b) => b.value - a.value || defaultComparer(a, b);
      }
      vehicleOperators = vehicleOperators
        .map((s, index) => {
          const value = activeSortColumn.selector(s, selected[s.id]);
          return { id: s.id, index, value };
        })
        .sort(comparer)
        .map((lookup) => vehicleOperators[lookup.index]);
    }
    return vehicleOperators;
  }
);

const selectPagedVehicleOperators = createSelector(
  selectVehicleOperators,
  selectPageIndex,
  selectPageSize,
  (vehicleOperators, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    return vehicleOperators.slice(start, start + pageSize);
  }
);

const selectTotalFiltered = createSelector(
  selectFilteredVehicleOperators,
  (vehicleOperators) => vehicleOperators.length
);

const selectTotalSelected = createSelector(selectSelected, (selected) => selected.length);

const selectTotalRequested = createSelector(selectRequested, (requested) => requested.length);

const selectDisplayColumnsState = createSelector(
  selectPreSolveVehicleOperatorState,
  fromPreSolveVehicleOperator.selectDisplayColumns
);

const selectAllDisplayColumnsOptions = createSelector(
  selectColumns,
  selectDisplayColumnsState,
  (columns, displayColumns) =>
    columns.map<Omit<VehicleOperatorColumn, 'selector'>>((column) => {
      const { selector: _selector, active, ...option } = column;
      return {
        ...option,
        active: displayColumns?.[column.id] != null ? displayColumns[column.id] : active,
      };
    })
);

const selectAvailableDisplayColumnsOptions = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) => displayColumnOptions.filter((column) => !column.toggleableHidden)
);

const selectColumnsToDisplay = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) => {
    const displayColumns = displayColumnOptions
      .filter((column) => column.active)
      .map((column) => column.id);
    return displayColumns
      .slice(0, displayColumns.length - 1)
      .concat('_filler')
      .concat(displayColumns[displayColumns.length - 1]);
  }
);

const selectDisplayColumns = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) => {
    const displayColumns: { [columnId: string]: boolean } = {};
    displayColumnOptions.forEach((dco) => (displayColumns[dco.id] = dco.active));
    return displayColumns;
  }
);

const selectVehicleOperatorsKpis = createSelector(
  selectFilteredVehicleOperators,
  selectSelectedLookup,
  selectFilteredOperatorsSelected,
  (vehicleOperators, selectedLookup, filteredSelected) => {
    const kpis = {
      total: vehicleOperators.length,
      selected: filteredSelected.length,
    };
    return kpis;
  }
);

const selectDeselectedIds = createSelector(
  selectSelectedLookup,
  fromVehicleOperator.selectIds,
  (selected, ids: number[] | string[]) => new Set((ids as number[]).filter((id) => !selected[id]))
);

const selectUnrequestedIds = createSelector(
  selectRequestedLookup,
  fromVehicleOperator.selectIds,
  (requested, ids: number[] | string[]) =>
    new Set((ids as number[]).filter((id) => !requested.has(id)))
);

const selectShowBulkEdit = createSelector(
  selectFilteredOperatorsSelected,
  (vehicleOperators) => vehicleOperators.length > 1
);

const selectShowBulkDelete = createSelector(
  selectFilteredOperatorsSelected,
  (vehicleOperators) => vehicleOperators.length > 1
);

export const selectVehicleOperatorTypes = createSelector(
  fromVehicleOperator.selectAll,
  (operators): Set<string> => {
    const types = new Set<string>();
    operators?.forEach((operator) => types.add(operator.type));
    return types;
  }
);

export const PreSolveVehicleOperatorSelectors = {
  selectFilters,
  selectSelectionFilterActive,
  selectPageIndex,
  selectPageSize,
  selectSort,
  selectSelected,
  selectRequested,
  selectRequestedIndexById,
  selectSelectedLookup,
  selectSelectedVehicleOperators,
  selectRequestedLookup,
  selectRequestedVehicleOperators,
  selectColumns,
  selectActiveSortColumn,
  selectVehicleOperatorFilterOptions,
  selectActiveFilterFilterOptions,
  selectAvailableFiltersOptions,
  selectFiltersOptionById,
  selectFilteredVehicleOperators,
  selectFilteredOperatorsSelected,
  selectFilteredVehicleOperatorsSelectedIds,
  selectFilteredVehicleOperatorsSelectedLookup,
  selectHasActiveFilters,
  selectFilteredVehicleIds,
  selectVehicleOperators,
  selectPagedVehicleOperators,
  selectTotalFiltered,
  selectTotalSelected,
  selectTotalRequested,
  selectAvailableDisplayColumnsOptions,
  selectColumnsToDisplay,
  selectDisplayColumns,
  selectVehicleOperatorsKpis,
  selectDeselectedIds,
  selectUnrequestedIds,
  selectShowBulkEdit,
  selectShowBulkDelete,
  selectVehicleOperatorTypes,
};

export default PreSolveVehicleOperatorSelectors;
