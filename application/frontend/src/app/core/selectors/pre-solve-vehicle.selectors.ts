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
import * as Long from 'long';
import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { NumberFilterParams } from 'src/app/shared/models/filter';
import {
  applyLongValueFilter,
  getCapacityQuantityRoot,
  getCapacityQuantityUnit,
  getUnitAbbreviation,
} from 'src/app/util';
import { VehicleColumn, vehicleColumns } from 'src/app/vehicles/models';
import { selectedVehicleFilterOption, VehicleFilterOption, vehicleFilterOptions } from '../models';
import * as fromPreSolveVehicle from '../reducers/pre-solve-vehicle.reducer';
import * as fromConfig from './config.selectors';
import * as fromVehicle from './vehicle.selectors';

export const selectPreSolveVehicleState = createFeatureSelector<fromPreSolveVehicle.State>(
  fromPreSolveVehicle.preSolveVehicleFeatureKey
);

const selectFilters = createSelector(selectPreSolveVehicleState, fromPreSolveVehicle.selectFilters);

const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedVehicleFilterOption.id)
);

const selectPageIndex = createSelector(
  selectPreSolveVehicleState,
  fromPreSolveVehicle.selectPageIndex
);

const selectPageSize = createSelector(
  selectPreSolveVehicleState,
  fromPreSolveVehicle.selectPageSize
);

const selectSort = createSelector(selectPreSolveVehicleState, fromPreSolveVehicle.selectSort);

const selectSelected = createSelector(
  selectPreSolveVehicleState,
  fromPreSolveVehicle.selectSelected
);

const selectRequested = createSelector(
  selectPreSolveVehicleState,
  fromPreSolveVehicle.selectRequested
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

/** Gets vehicles selected ordered by vehicle id */
const selectSelectedVehicles = createSelector(
  fromVehicle.selectAll,
  selectSelectedLookup,
  (vehicles, selected) => vehicles.filter((vehicle) => selected[vehicle.id])
);

const selectRequestedLookup = createSelector(selectRequested, (requested) => new Set(requested));

const selectRequestedVehicles = createSelector(
  fromVehicle.selectAll,
  selectRequestedLookup,
  (vehicles, requested) => vehicles.filter((vehicle) => requested.has(vehicle.id))
);

const selectCapacityTypes = createSelector(fromVehicle.selectAll, (vehicles) => {
  const capacityTypes = new Set<string>(vehicles.flatMap((v) => Object.keys(v.loadLimits || {})));
  return Array.from(capacityTypes);
});

const selectCapacityColumns = createSelector(selectCapacityTypes, (capacityTypes) => {
  const columns: VehicleColumn[] = [];
  for (let i = 0; i < capacityTypes.length; i++) {
    const capacityType = capacityTypes[i];
    columns.push({
      id: 'capacities.' + i,
      label: `Load Limit (${capacityType})`,
      active: i < 4,
      toggleable: true,
      selector: (vehicle) => {
        return Long.fromValue(vehicle.loadLimits?.[capacityType].maxLoad || 0).toNumber();
      },
    });
  }
  return columns;
});

const selectColumns = createSelector(selectCapacityColumns, (capacityColumns) =>
  vehicleColumns
    .slice(0, 3)
    .concat(capacityColumns)
    .concat(vehicleColumns.slice(3, vehicleColumns.length))
);

const selectActiveSortColumn = createSelector(selectSort, selectColumns, (sort, columns) =>
  columns.find((column) => column.id === sort.active)
);

const selectVehicleFilterOptions = createSelector(
  selectCapacityTypes,
  fromConfig.selectUnitAbbreviations,
  (capacityTypes, unitAbbreviations) => {
    const filterOptions = vehicleFilterOptions.slice(0, 1);
    for (let i = 0; i < capacityTypes.length; i++) {
      const capacityType = capacityTypes[i];
      const label = getCapacityQuantityRoot(capacityType);
      const unit = getUnitAbbreviation(getCapacityQuantityUnit(capacityType), unitAbbreviations);
      filterOptions.push({
        id: 'visitRequest.demands.' + i,
        label: 'Demand (' + label + (unit ? ', ' + unit : '') + ')',
        form: () => FilterNumberFormComponent,
        predicate: ({ vehicle }, params) => {
          const capacity = vehicle.loadLimits[capacityType];
          return applyLongValueFilter(capacity.maxLoad, params);
        },
      } as VehicleFilterOption<NumberFilterParams>);
    }
    return filterOptions.concat(vehicleFilterOptions.slice(1));
  }
);

const selectActiveFilterFilterOptions = createSelector(
  selectFilters,
  selectVehicleFilterOptions,
  (filters, filterOptions) =>
    filters.map((f) => ({
      activeFilter: f,
      filterOption: filterOptions.find((fo) => fo.id === f.id),
    }))
);

const selectAvailableFiltersOptions = createSelector(
  selectFilters,
  selectVehicleFilterOptions,
  (filters, filterOptions) =>
    filterOptions
      .filter((fo) => !filters.some((f) => fo.id === f.id))
      .sort((a, b) => a.label.localeCompare(b.label))
);

const selectFiltersOptionById = (id: string) =>
  createSelector(selectVehicleFilterOptions, (filterOptions: VehicleFilterOption[]) => {
    return filterOptions.find((fo) => fo.id === id);
  });

const selectFilteredVehicles = createSelector(
  fromVehicle.selectAll,
  selectActiveFilterFilterOptions,
  selectSelectedLookup,
  (vehicles, filters, selected) => {
    return filters.length
      ? vehicles.filter((vehicle) => {
          return filters.every(({ activeFilter, filterOption }) => {
            const context = { vehicle, selected: selected[vehicle.id] };
            return filterOption.predicate(context, activeFilter.params);
          });
        })
      : vehicles;
  }
);

const selectFilteredVehiclesSelected = createSelector(
  selectFilteredVehicles,
  selectSelectedLookup,
  (vehicles, selected) => vehicles.filter((vehicle) => selected[vehicle.id])
);

const selectFilteredVehiclesSelectedIds = createSelector(
  selectFilteredVehiclesSelected,
  (vehicles) => vehicles.map((vehicle) => vehicle.id)
);

const selectFilteredVehiclesSelectedLookup = createSelector(
  selectFilteredVehiclesSelected,
  (vehicles) => {
    const selected = {} as { [id: number]: boolean };
    vehicles.forEach((shipment) => {
      selected[shipment.id] = true;
    });
    return selected;
  }
);

const selectFilteredVehiclesDisabledLookup = createSelector(
  selectFilteredVehiclesSelected,
  (vehicles) => {
    const disabled = {} as { [id: number]: boolean };
    vehicles.forEach((vehicle) => {
      disabled[vehicle.id] = vehicle.usedIfRouteIsEmpty;
    });
    return disabled;
  }
);

const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

const selectFilteredVehicleIds = createSelector(
  selectFilteredVehicles,
  selectHasActiveFilters,
  (vehicles, filtersActive) => (filtersActive ? new Set<number>(vehicles.map((v) => v.id)) : null)
);

const selectVehicles = createSelector(
  selectFilteredVehicles,
  selectSelectedLookup,
  selectActiveSortColumn,
  selectSort,
  (vehicles, selected, activeSortColumn, sort) => {
    if (activeSortColumn?.selector) {
      const defaultComparer = (a: { id: number; value: any }, b: { id: number; value: any }) =>
        a.id - b.id;
      let comparer = defaultComparer;
      if (sort.direction === 'asc') {
        comparer = (a, b) => a.value - b.value || defaultComparer(a, b);
      } else if (sort.direction === 'desc') {
        comparer = (a, b) => b.value - a.value || defaultComparer(a, b);
      }
      vehicles = vehicles
        .map((s, index) => {
          const value = activeSortColumn.selector(s, selected[s.id]);
          return { id: s.id, index, value };
        })
        .sort(comparer)
        .map((lookup) => vehicles[lookup.index]);
    }
    return vehicles;
  }
);

const selectPagedVehicles = createSelector(
  selectVehicles,
  selectPageIndex,
  selectPageSize,
  (vehicles, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    return vehicles.slice(start, start + pageSize);
  }
);

const selectTotalFiltered = createSelector(selectFilteredVehicles, (vehicles) => vehicles.length);

const selectTotalSelected = createSelector(selectSelected, (selected) => selected.length);

const selectTotalRequested = createSelector(selectRequested, (requested) => requested.length);

const selectDisplayColumnsState = createSelector(
  selectPreSolveVehicleState,
  fromPreSolveVehicle.selectDisplayColumns
);

const selectAllDisplayColumnsOptions = createSelector(
  selectColumns,
  selectDisplayColumnsState,
  (columns, displayColumns) =>
    columns.map<Omit<VehicleColumn, 'selector'>>((column) => {
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
    return displayColumns.slice(0, 3).concat('_filler').concat(displayColumns.slice(3));
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

const selectVehiclesKpis = createSelector(
  selectFilteredVehicles,
  selectSelectedLookup,
  selectFilteredVehiclesSelected,
  (vehicles, selectedLookup, filteredSelected) => {
    const kpis = {
      total: vehicles.length,
      selected: filteredSelected.length,
      capacities: [],
    };

    vehicles.forEach((vehicle) => {
      if (!vehicle.loadLimits) {
        return;
      }

      Object.keys(vehicle.loadLimits).forEach((loadLimitKey) => {
        const loadLimit = vehicle.loadLimits[loadLimitKey];
        const capacityValue = loadLimit.maxLoad ? Long.fromValue(loadLimit.maxLoad).toNumber() : 0;
        const filteredCapacities = kpis.capacities.filter(
          (kpiCapacity) => kpiCapacity.type === loadLimitKey
        );
        if (filteredCapacities.length) {
          const matchingCapacity = filteredCapacities[0];
          matchingCapacity.total += capacityValue;
          if (selectedLookup[vehicle.id]) {
            matchingCapacity.selected += capacityValue;
          }
        } else {
          kpis.capacities.push({
            selected: capacityValue,
            total: capacityValue,
            type: loadLimitKey,
          });
        }
      });
    });

    return kpis;
  }
);

const selectDeselectedIds = createSelector(
  selectSelectedLookup,
  fromVehicle.selectIds,
  (selected, ids: number[] | string[]) => new Set((ids as number[]).filter((id) => !selected[id]))
);

const selectUnrequestedIds = createSelector(
  selectRequestedLookup,
  fromVehicle.selectIds,
  (requested, ids: number[] | string[]) =>
    new Set((ids as number[]).filter((id) => !requested.has(id)))
);

const selectShowBulkEdit = createSelector(
  selectFilteredVehiclesSelected,
  (vehicles) => vehicles.length > 1
);

const selectShowBulkDelete = createSelector(
  selectFilteredVehiclesSelected,
  (vehicles) => vehicles.length > 1
);

export const PreSolveVehicleSelectors = {
  selectFilters,
  selectSelectionFilterActive,
  selectPageIndex,
  selectPageSize,
  selectSort,
  selectSelected,
  selectRequested,
  selectRequestedIndexById,
  selectSelectedLookup,
  selectSelectedVehicles,
  selectRequestedLookup,
  selectRequestedVehicles,
  selectCapacityTypes,
  selectCapacityColumns,
  selectColumns,
  selectActiveSortColumn,
  selectVehicleFilterOptions,
  selectActiveFilterFilterOptions,
  selectAvailableFiltersOptions,
  selectFiltersOptionById,
  selectFilteredVehicles,
  selectFilteredVehiclesSelected,
  selectFilteredVehiclesSelectedIds,
  selectFilteredVehiclesSelectedLookup,
  selectFilteredVehiclesDisabledLookup,
  selectHasActiveFilters,
  selectFilteredVehicleIds,
  selectVehicles,
  selectPagedVehicles,
  selectTotalFiltered,
  selectTotalSelected,
  selectTotalRequested,
  selectAvailableDisplayColumnsOptions,
  selectColumnsToDisplay,
  selectDisplayColumns,
  selectVehiclesKpis,
  selectDeselectedIds,
  selectUnrequestedIds,
  selectShowBulkEdit,
  selectShowBulkDelete,
};

export default PreSolveVehicleSelectors;
