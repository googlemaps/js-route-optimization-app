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
import { FilterOption } from 'src/app/shared/models/filter';
import {
  Column,
  routeMetadataFilterOptions,
  selectedRouteMetadataFilterOption,
  Shipment,
  ShipmentRoute,
  Vehicle,
  Visit,
} from '../models';
import * as fromShipmentRoute from './shipment-route.selectors';
import * as fromRoutesMetadata from '../reducers/routes-metadata.reducer';
import * as fromShipment from './shipment.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import * as fromVisit from 'src/app/core/selectors/visit.selectors';
import {
  RouteMetadata,
  RouteMetadataColumn,
  routeMetadataColumns,
} from 'src/app/routes-metadata/models';
import { durationSeconds, toArray } from 'src/app/util';
import { Dictionary } from '@ngrx/entity';
import Long from 'long';

export const selectRoutesMetadataState = createFeatureSelector<fromRoutesMetadata.State>(
  fromRoutesMetadata.routesMetadataFeatureKey
);

const selectPageIndex = createSelector(
  selectRoutesMetadataState,
  fromRoutesMetadata.selectPageIndex
);

const selectPageSize = createSelector(selectRoutesMetadataState, fromRoutesMetadata.selectPageSize);

const selectSort = createSelector(selectRoutesMetadataState, fromRoutesMetadata.selectSort);

const selectSelected = createSelector(selectRoutesMetadataState, fromRoutesMetadata.selectSelected);

const selectSelectedLookup = createSelector(selectSelected, (selected) => {
  const lookup: { [id: number]: true } = {};
  selected.forEach((id) => (lookup[id] = true));
  return lookup;
});

const selectSelectedRoutes = createSelector(
  fromShipmentRoute.selectAll,
  selectSelectedLookup,
  (routes, selected) => routes.filter((route) => selected[route.id])
);

const selectedSelectedRoutesIds = createSelector(selectSelectedRoutes, (routes) =>
  routes.map((route) => route.id)
);

const selectColumns = createSelector(selectRoutesMetadataState, (_state) => routeMetadataColumns);

const selectActiveSortColumn = createSelector(selectSort, selectColumns, (sort, columns) =>
  columns.find((column) => column.id === sort.active)
);

const selectFilters = createSelector(selectRoutesMetadataState, fromRoutesMetadata.selectFilters);

const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedRouteMetadataFilterOption.id)
);

const selectFilterOptions = createSelector(
  selectRoutesMetadataState,
  (_state) => routeMetadataFilterOptions
);

const selectActiveFilterFilterOptions = createSelector(
  selectFilters,
  selectFilterOptions,
  (filters, filterOptions) =>
    filters.map((f) => ({
      activeFilter: f,
      filterOption: filterOptions.find((fo) => fo.id === f.id),
    }))
);

const selectAvailableFiltersOptions = createSelector(
  selectFilters,
  selectFilterOptions,
  (filters, filterOptions): FilterOption[] =>
    filterOptions
      .filter((fo) => !filters.some((f) => fo.id === f.id))
      .sort((a, b) => a.label.localeCompare(b.label))
);

const selectFiltersOptionById = (id: string) =>
  createSelector(selectFilterOptions, (filterOptions: FilterOption[]) => {
    return filterOptions.find((fo) => fo.id === id);
  });

const selectRouteMetadata = createSelector(
  fromShipmentRoute.selectEntities,
  fromVehicle.selectEntities,
  fromVisit.selectEntities,
  fromShipment.selectEntities,
  selectSelectedLookup,
  (routes, vehicles, visits, shipments, selectedLookup) =>
    toArray(routes).map<RouteMetadata>((route) => {
      const routeVisits = getVisitsForRoute(route.visits, visits);
      const routeShipments = getShipmentsForRoute(toArray(shipments), routeVisits);
      let totalDropoffs = 0;
      let totalPickups = 0;
      routeVisits.forEach((visit) => (visit.isPickup ? (totalPickups += 1) : (totalDropoffs += 1)));
      const totalKm = calculateRouteKm(route);
      const traveledTime = durationSeconds(route.vehicleEndTime)
        .subtract(durationSeconds(route.vehicleStartTime))
        .toNumber();
      return {
        capacityUtilization: calculateCapacityUtilizations(vehicles[route.id], routeShipments),
        cost: calculateTotalCost(vehicles[route.id], totalKm, traveledTime / 3600),
        endLocation: vehicles[route.id].startWaypoint?.location?.latLng,
        route,
        selected: selectedLookup[route.id],
        startLocation: vehicles[route.id].endWaypoint?.location?.latLng,
        totalDropoffs,
        totalPickups,
        totalShipments: new Set(routeVisits.map((visit) => visit.shipmentIndex)).size,
        traveledTime,
      };
    })
);

const getShipmentsForRoute = (shipments: Shipment[], visits: Visit[]): Shipment[] => {
  const routeShipments = {};
  visits.forEach((visit) => {
    const index = visit.shipmentIndex || 0;
    routeShipments[index] = shipments[index];
  });
  return toArray(routeShipments);
};

const calculateCapacityUtilizations = (vehicle: Vehicle, shipments: Shipment[]): any => {
  const utilizations = {};

  // add shipment load demands
  shipments.forEach((shipment) => {
    for (const [loadType, load] of Object.entries(shipment.loadDemands || {})) {
      if (!utilizations[loadType]) {
        utilizations[loadType] = {
          used: 0,
          capacity: 0,
        };
      }
      utilizations[loadType].used += Long.fromValue(load.amount).toNumber();
    }
  });

  // add vehicle capacity
  Object.keys(utilizations).forEach((key) => {
    if (vehicle.loadLimits && vehicle.loadLimits[key]) {
      utilizations[key].capacity = Long.fromValue(vehicle.loadLimits[key].maxLoad).toNumber();
    }
  });

  // add zero used for any load types not missing from utilization
  Object.keys(vehicle.loadLimits || {}).forEach((loadType) => {
    if (!utilizations[loadType]) {
      utilizations[loadType] = {
        used: 0,
        capacity: Long.fromValue(vehicle.loadLimits[loadType].maxLoad).toNumber(),
      };
    }
  });
  return utilizations;
};

const calculateRouteKm = (route: ShipmentRoute): number => {
  let distance = 0;
  route.transitions?.forEach((transition) => (distance += transition.travelDistanceMeters));
  return distance / 1000;
};

const calculateTotalCost = (vehicle: Vehicle, distance: number, durationHours: number): number => {
  let cost = vehicle.fixedCost || 0;
  cost += durationHours * (vehicle.costPerHour || 0 + vehicle.costPerTraveledHour || 0);
  cost += distance * vehicle.costPerKilometer;
  return cost;
};

const getVisitsForRoute = (visitIds: number[], visits: Dictionary<Visit>): Visit[] => {
  return visitIds.map((id) => visits[id]);
};

const selectFilteredRouteMetadata = createSelector(
  selectRouteMetadata,
  selectActiveFilterFilterOptions,
  (routeMetadata, filters) => {
    return routeMetadata.filter((r) => {
      return filters.every(({ activeFilter, filterOption }) => {
        return filterOption.predicate(r, activeFilter.params);
      });
    });
  }
);

const selectFilteredRouteLookup = createSelector(
  selectFilteredRouteMetadata,
  (routeMetadata) => new Set(routeMetadata.map((r) => r.route.id))
);

const selectFilteredRouteIds = createSelector(selectFilteredRouteLookup, (routeLookup) =>
  Array.from(routeLookup.keys())
);

const selectFilteredRoutesSelectedLookup = createSelector(
  selectSelected,
  selectFilteredRouteLookup,
  (selected, routeLookup) => {
    const filteredSelected = {} as { [id: number]: boolean };
    selected.forEach((id) => {
      if (routeLookup.has(id)) {
        filteredSelected[id] = true;
      }
    });
    return filteredSelected;
  }
);

const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

const selectRouteMetadataGroups = createSelector(
  selectFilteredRouteMetadata,
  selectActiveSortColumn,
  selectSort,
  (routeMetadata, activeSortColumn, sort) => {
    if (activeSortColumn?.selector) {
      const { selector, thenBySelector } = activeSortColumn;
      const valueComparer: (a: any, b: any) => number =
        sort.direction === 'desc'
          ? activeSortColumn.valueComparer
            ? (a, b) => activeSortColumn.valueComparer(b, a)
            : (a, b) => b - a
          : activeSortColumn.valueComparer
          ? (a, b) => activeSortColumn.valueComparer(a, b)
          : (a, b) => a - b;
      const itemComparer = (
        a: { id: number; value: any; thenByValue: any },
        b: { id: number; value: any; thenByValue: any }
      ) =>
        valueComparer(a.value, b.value) ||
        (thenBySelector && valueComparer(a.thenByValue, b.thenByValue)) ||
        a.id - b.id;
      routeMetadata = routeMetadata
        .map((context, index) => {
          const value = selector(context);
          const thenByValue = thenBySelector ? thenBySelector?.apply(null, [context]) : null;
          return { id: context.route.id, index, value, thenByValue };
        })
        .sort(itemComparer)
        .map((lookup) => routeMetadata[lookup.index]);
    }
    return routeMetadata;
  }
);

const selectPagedRouteMetadata = createSelector(
  selectRouteMetadataGroups,
  selectPageIndex,
  selectPageSize,
  (routeMetadata, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    return routeMetadata.slice(start, start + pageSize);
  }
);

const selectTotalFiltered = createSelector(selectFilteredRouteIds, (routeIds) => routeIds.length);

const selectTotalSelected = createSelector(selectSelected, (selected) => selected.length);

const selectDisplayColumnsState = createSelector(
  selectRoutesMetadataState,
  fromRoutesMetadata.selectDisplayColumns
);

const selectAllDisplayColumnsOptions = createSelector(
  selectColumns,
  selectDisplayColumnsState,
  (columns, displayColumns) =>
    columns.map<Omit<RouteMetadataColumn, 'selector'>>((column) => {
      const { selector: _selector, active, ...option } = column;
      return {
        ...option,
        active: displayColumns?.[column.id] != null ? displayColumns[column.id] : active,
      };
    })
);

const selectAvailableDisplayColumnsOptions = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) =>
    displayColumnOptions.filter((column) => !column.toggleableHidden) as Column[]
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

export const RoutesMetadataSelectors = {
  selectDisplayColumns,
  selectColumnsToDisplay,
  selectAvailableDisplayColumnsOptions,
  selectTotalSelected,
  selectTotalFiltered,
  selectPagedRouteMetadata,
  selectRouteMetadataGroups,
  selectHasActiveFilters,
  selectFilteredRoutesSelectedLookup,
  selectFilteredRouteIds,
  selectFilteredRouteLookup,
  selectFilteredRouteMetadata,
  selectRouteMetadata,
  selectFiltersOptionById,
  selectAvailableFiltersOptions,
  selectActiveFilterFilterOptions,
  selectFilterOptions,
  selectSelectionFilterActive,
  selectFilters,
  selectActiveSortColumn,
  selectColumns,
  selectSelectedRoutes,
  selectedSelectedRoutesIds,
  selectSelectedLookup,
  selectSelected,
  selectSort,
  selectPageSize,
  selectPageIndex,
};

export default RoutesMetadataSelectors;
