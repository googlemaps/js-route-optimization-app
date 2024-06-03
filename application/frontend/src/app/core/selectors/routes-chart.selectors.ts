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
import { ChartConfig, Range } from 'src/app/shared/models';
import * as chartConfig from 'src/app/shared/models/chart-config';
import { routesFilterOptions, selectedRouteFilterOption } from '../models';
import * as fromRoutesChart from '../reducers/routes-chart.reducer';
import * as fromMapTheme from '../services/map-theme.service';
import * as fromConfig from './config.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import ShipmentRouteSelectors, * as fromShipmentRoute from './shipment-route.selectors';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectRoutesChartState = createFeatureSelector<fromRoutesChart.State>(
  fromRoutesChart.routesChartFeatureKey
);

const selectView = createSelector(selectRoutesChartState, fromRoutesChart.selectView);

const selectRangeIndex = createSelector(selectRoutesChartState, fromRoutesChart.selectRangeIndex);

const selectFilters = createSelector(selectRoutesChartState, fromRoutesChart.selectFilters);

const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedRouteFilterOption.id)
);

const selectAvailableFiltersOptions = createSelector(selectFilters, (filters) =>
  routesFilterOptions
    .filter((fo) => !filters.some((f) => fo.id === f.id))
    .sort((a, b) => a.label.localeCompare(b.label))
);

const selectFiltersOptionById = (id: string) =>
  createSelector(selectFilters, (_) => {
    return routesFilterOptions.find((fo) => fo.id === id);
  });

const selectActiveFilterFilterOptions = createSelector(selectFilters, (filters) =>
  filters.map((f) => ({
    activeFilter: f,
    filterOption: routesFilterOptions.find((fo) => fo.id === f.id),
  }))
);

const selectChartConfig = createSelector(
  selectView,
  (view) => (chartConfig[view] as ChartConfig) || chartConfig.day
);

const selectPageIndex = createSelector(selectRoutesChartState, fromRoutesChart.selectPageIndex);

const selectPageSize = createSelector(selectRoutesChartState, fromRoutesChart.selectPageSize);

const selectAddedRange = createSelector(selectRoutesChartState, fromRoutesChart.selectAddedRange);

const selectRoutes = createSelector(
  fromShipmentRoute.selectAll,
  PreSolveVehicleSelectors.selectRequestedLookup,
  (routes, requested) => routes.filter((route) => requested.has(route.id))
);

const selectSelectedRoutes = createSelector(
  selectRoutesChartState,
  fromRoutesChart.selectSelectedRoutes
);

const selectSelectedRoutesLookup = createSelector(selectSelectedRoutes, (selected) => {
  const lookup: { [id: number]: true } = {};
  selected.forEach((id) => (lookup[id] = true));
  return lookup;
});

const selectSelectedRoutesColorIndexes = createSelector(
  selectRoutesChartState,
  fromRoutesChart.selectSelectedRoutesColors
);

const selectSelectedRoutesColors = createSelector(
  selectSelectedRoutesColorIndexes,
  (selectedRoutesColors) => {
    const colors = {};
    selectedRoutesColors.forEach(([id, colorIdx]) => {
      colors[id] = fromMapTheme.MATERIAL_COLORS_SELECTED[colorIdx];
    });
    return colors;
  }
);

const selectSelectedRoutesVisitIds = createSelector(
  selectSelectedRoutes,
  ShipmentRouteSelectors.selectRoutesVisitIdsFn,
  (selected: number[], routesVisitIdsFn) => {
    return routesVisitIdsFn(selected);
  }
);

const selectSelectedRoute = (id: number) =>
  createSelector(selectSelectedRoutesLookup, (selectedRoutes: { [id: number]: true }) => {
    return selectedRoutes[id];
  });

const selectFilteredRoutes = createSelector(
  selectRoutes,
  selectActiveFilterFilterOptions,
  selectSelectedRoutesLookup,
  (routes, filters, selectedRoutes) => {
    if (filters.length) {
      return routes.filter((route) => {
        const context = { route, selected: selectedRoutes[route.id] };
        return filters.every(({ activeFilter, filterOption }) =>
          filterOption.predicate(context, activeFilter.params)
        );
      });
    }
    return routes;
  }
);

const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

const selectFilteredRouteIds = createSelector(
  selectFilteredRoutes,
  selectHasActiveFilters,
  (routes, filtersActive) => (filtersActive ? new Set<number>(routes.map((r) => r.id)) : null)
);

const selectFilteredRoutesWithTransitionsLookup = createSelector(
  selectFilteredRoutes,
  (routes) => new Set(routes.filter((r) => r.transitions?.length > 0).map((r) => r.id))
);

const selectFilteredRoutesSelectedWithTransitionsLookup = createSelector(
  selectFilteredRoutesWithTransitionsLookup,
  selectSelectedRoutesLookup,
  (lookup, selected) => new Set(Array.from(lookup.values()).filter((id) => selected[id]))
);

const selectFilteredRoutesVisitRequestIds = createSelector(
  selectFilteredRoutes,
  selectHasActiveFilters,
  (routes, filtersActive) => {
    if (filtersActive) {
      const visitRequestIds = new Set<number>();
      routes.forEach((route) => {
        route.visits.forEach((id) => visitRequestIds.add(id));
      });
      return visitRequestIds;
    }
    return null;
  }
);

const selectPagedRoutes = createSelector(
  selectFilteredRoutes,
  selectPageIndex,
  selectPageSize,
  (routes, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    return routes.slice(start, start + pageSize);
  }
);

const selectFilteredRoutesSelected = createSelector(
  selectFilteredRoutes,
  selectSelectedRoutesLookup,
  (routes, selected) => routes.filter((route) => selected[route.id])
);

const selectFilteredRoutesSelectedLookup = createSelector(
  selectFilteredRoutesSelected,
  (selected) => {
    const filteredSelected = {} as { [id: number]: boolean };
    selected.forEach((route) => (filteredSelected[route.id] = true));
    return filteredSelected;
  }
);

const selectTotalFilteredRoutes = createSelector(selectFilteredRoutes, (routes) => routes.length);

const selectTotalFilteredRoutesSelected = createSelector(
  selectFilteredRoutesSelected,
  (filteredSelectedRoutes) => filteredSelectedRoutes.length
);

const selectRanges = createSelector(selectChartConfig, (config) => config.ranges);

const selectSelectedRange = createSelector(
  selectRanges,
  selectRangeIndex,
  (ranges, index) => ranges[index]
);

const selectUnitStep = createSelector(selectSelectedRange, (range) => range.unitStep);

const selectRange = createSelector(
  selectSelectedRange,
  selectUnitStep,
  selectAddedRange,
  (range, unitStep, addedRange) => {
    return range.value + Math.floor(addedRange / unitStep.value) * unitStep.value;
  }
);

const selectRangeOffset = createSelector(selectRoutesChartState, fromRoutesChart.selectRangeOffset);

const selectColumnLabelFormatter = createSelector(
  selectChartConfig,
  selectRangeOffset,
  (config, rangeOffset) => {
    return (index: number, columnRange: [number, number]) =>
      config.columnLabelFormatter(
        index,
        columnRange.map((u) => u + rangeOffset) as [number, number]
      );
  }
);

const getRangeOffsetInDuration = (
  duration: [Long, Long],
  range: Range,
  rangeOffset: number,
  currentOffset?: number
) => {
  if (!duration) {
    return null;
  }
  const rangeStart = rangeOffset;
  const rangeEnd = rangeStart + range.value;
  const durationStart = duration[0].toNumber();
  const durationEnd = duration[1].toNumber();
  if (currentOffset < durationStart && rangeStart > currentOffset) {
    return rangeStart;
  }
  if (currentOffset > durationEnd && rangeStart < currentOffset) {
    return rangeStart;
  }
  return rangeEnd > durationStart && rangeStart <= durationEnd ? rangeStart : null;
};

const selectNowRangeOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectSelectedRange,
  fromConfig.selectTimezoneOffset,
  (globalDuration, range, timezoneOffset) => {
    const now = new Date();
    if (range.value >= 24 * 60 * 60) {
      now.setUTCHours(0, 0, 0, 0);
    }
    let rangeOffset = Math.floor(now.getTime() / 1000);

    // Adjust to unit steps anchored on midnight
    const date = new Date(rangeOffset * 1000);
    date.setUTCHours(0, 0, 0, 0);
    const midnightSeconds = date.getTime() / 1000;

    rangeOffset =
      midnightSeconds +
      Math.floor((rangeOffset - midnightSeconds) / range.unitStep.value) * range.unitStep.value;
    // Adjust for timezone
    rangeOffset -= timezoneOffset;
    return getRangeOffsetInDuration(globalDuration, range, rangeOffset);
  }
);

const selectDefaultRangeOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectNowRangeOffset,
  fromConfig.selectTimezoneOffset,
  (duration, nowRangeOffset, timezoneOffset) => {
    if (!duration) {
      return 0;
    }
    if (nowRangeOffset != null) {
      return nowRangeOffset;
    }
    const start = new Date(duration[0].toNumber() * 1000);
    start.setUTCHours(0, 0, 0, 0);
    return Math.floor(start.getTime() / 1000) - timezoneOffset;
  }
);

const selectPreviousColumnOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectRangeOffset,
  selectSelectedRange,
  (globalDuration, rangeOffset, range) =>
    getRangeOffsetInDuration(globalDuration, range, rangeOffset - range.unitStep.value, rangeOffset)
);

const selectPreviousRangeOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectRangeOffset,
  selectSelectedRange,
  (globalDuration, rangeOffset, range) =>
    getRangeOffsetInDuration(globalDuration, range, rangeOffset - range.value, rangeOffset)
);

const selectNextColumnOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectRangeOffset,
  selectSelectedRange,
  (globalDuration, rangeOffset, range) =>
    getRangeOffsetInDuration(globalDuration, range, rangeOffset + range.unitStep.value, rangeOffset)
);

const selectNextRangeOffset = createSelector(
  ShipmentModelSelectors.selectGlobalDuration,
  selectRangeOffset,
  selectSelectedRange,
  (globalDuration, rangeOffset, range) =>
    getRangeOffsetInDuration(globalDuration, range, rangeOffset + range.value, rangeOffset)
);

const selectDuration = createSelector(selectRange, selectRangeOffset, (range, offset) => {
  const start = Long.fromNumber(offset);
  return [start, start.add(range)] as [Long, Long];
});

export const RoutesChartSelectors = {
  selectView,
  selectRangeIndex,
  selectFilters,
  selectSelectionFilterActive,
  selectAvailableFiltersOptions,
  selectFiltersOptionById,
  selectActiveFilterFilterOptions,
  selectChartConfig,
  selectPageIndex,
  selectPageSize,
  selectAddedRange,
  selectRoutes,
  selectSelectedRoutes,
  selectSelectedRoutesLookup,
  selectSelectedRoutesColorIndexes,
  selectSelectedRoutesColors,
  selectSelectedRoutesVisitIds,
  selectSelectedRoute,
  selectFilteredRoutes,
  selectHasActiveFilters,
  selectFilteredRouteIds,
  selectFilteredRoutesWithTransitionsLookup,
  selectFilteredRoutesSelectedWithTransitionsLookup,
  selectFilteredRoutesVisitRequestIds,
  selectPagedRoutes,
  selectFilteredRoutesSelected,
  selectFilteredRoutesSelectedLookup,
  selectTotalFilteredRoutes,
  selectTotalFilteredRoutesSelected,
  selectRanges,
  selectSelectedRange,
  selectUnitStep,
  selectRange,
  selectRangeOffset,
  selectColumnLabelFormatter,
  selectNowRangeOffset,
  selectDefaultRangeOffset,
  selectPreviousColumnOffset,
  selectPreviousRangeOffset,
  selectNextColumnOffset,
  selectNextRangeOffset,
  selectDuration,
};

export default RoutesChartSelectors;
