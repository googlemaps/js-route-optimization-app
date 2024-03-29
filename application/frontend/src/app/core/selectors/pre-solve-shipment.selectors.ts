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

import { Dictionary } from '@ngrx/entity';
import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as Long from 'long';
import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { NumberFilterParams } from 'src/app/shared/models/filter';
import { ShipmentColumn, shipmentColumns, ShipmentItem } from 'src/app/shipments/models';
import { applyLongValueFilter, durationSeconds } from 'src/app/util';
import {
  selectedShipmentFilterOption,
  Shipment,
  ShipmentFilterOption,
  shipmentFilterOptions,
  VisitRequest,
} from '../models';
import * as fromPreSolveShipment from '../reducers/pre-solve-shipment.reducer';
import * as fromMapTheme from '../services/map-theme.service';
import * as fromShipment from './shipment.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectPreSolveShipmentState = createFeatureSelector<fromPreSolveShipment.State>(
  fromPreSolveShipment.preSolveShipmentFeatureKey
);

const selectFilters = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectFilters
);

const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedShipmentFilterOption.id)
);

const selectPageIndex = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectPageIndex
);

const selectPageSize = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectPageSize
);

const selectSort = createSelector(selectPreSolveShipmentState, fromPreSolveShipment.selectSort);

const selectSelected = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectSelected
);

const selectSelectedColorIndexes = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectSelectedColors
);

const selectSelectedColors = createSelector(selectSelectedColorIndexes, (selectedColors) => {
  const colors = {};
  selectedColors.forEach(([shipmentId, colorIdx]) => {
    colors[shipmentId] = fromMapTheme.MATERIAL_COLORS_SELECTED[colorIdx];
  });
  return colors;
});

const selectRequested = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectRequested
);

const selectEditShipmentId = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectEditShipmentId
);

const selectEditShipment = createSelector(
  selectEditShipmentId,
  fromShipment.selectEntities,
  (shipmentId, shipments) => shipments[shipmentId]
);

const selectEditShipmentVisitRequests = createSelector(
  selectEditShipment,
  fromVisitRequest.selectEntities,
  (shipment, visitRequests) => {
    const editShipmentVisitRequests: VisitRequest[] = [];
    if (shipment) {
      shipment.pickups.forEach((id) => editShipmentVisitRequests.push(visitRequests[id]));
      shipment.deliveries.forEach((id) => editShipmentVisitRequests.push(visitRequests[id]));
    }
    return editShipmentVisitRequests;
  }
);

const selectSelectedLookup = createSelector(selectSelected, (selected) => {
  const lookup: { [id: number]: true } = {};
  selected.forEach((id) => (lookup[id] = true));
  return lookup;
});

const selectSelectedShipments = createSelector(
  fromShipment.selectAll,
  selectSelectedLookup,
  (shipments, selected) => shipments.filter((shipment) => selected[shipment.id])
);

const selectRequestedLookup = createSelector(selectRequested, (requested) => new Set(requested));

const selectRequestedShipments = createSelector(
  fromShipment.selectAll,
  selectRequestedLookup,
  (shipments, requested) => shipments.filter((shipment) => requested.has(shipment.id))
);

const selectShipmentPickupsFn = createSelector(
  fromShipment.selectEntities,
  fromVisitRequest.selectEntities,
  (shipment: Dictionary<Shipment>, visitRequests: Dictionary<VisitRequest>) =>
    (shipmentId: number) =>
      shipment[shipmentId]?.pickups.map((id) => visitRequests[id]).filter(Boolean) || []
);

const selectShipmentDeliveriesFn = createSelector(
  fromShipment.selectEntities,
  fromVisitRequest.selectEntities,
  (shipment: Dictionary<Shipment>, visitRequests: Dictionary<VisitRequest>) =>
    (shipmentId: number) =>
      shipment[shipmentId]?.deliveries.map((id) => visitRequests[id]).filter(Boolean) || []
);

const selectDemandTypes = createSelector(fromShipment.selectEntities, (shipments) => {
  const demandTypes = new Set<string>(
    Object.values(shipments).flatMap((s) => Object.keys(s.loadDemands || {}))
  );

  return Array.from(demandTypes);
});

const selectDemandColumns = createSelector(selectDemandTypes, (demandTypes) => {
  const columns: ShipmentColumn[] = [];
  for (let i = 0; i < demandTypes.length; i++) {
    const demandType = demandTypes[i];
    columns.push({
      id: 'shipment.demands.' + i,
      label: 'Demand (' + demandType + ')',
      active: i < 4,
      toggleable: true,
      selector: (shipment) => {
        const demand = shipment.loadDemands[demandType];
        return Long.fromValue(demand?.amount || 0).toNumber();
      },
    });
  }
  return columns;
});

const selectColumns = createSelector(selectDemandColumns, (demandColumns) =>
  shipmentColumns
    .slice(0, shipmentColumns.length - 1)
    .concat(demandColumns)
    .concat(shipmentColumns.slice(shipmentColumns.length - 1))
);

const selectActiveSortColumn = createSelector(selectSort, selectColumns, (sort, columns) =>
  columns.find((column) => column.id === sort.active)
);

const selectShipmentFilterOptions = createSelector(selectDemandTypes, (demandTypes) => {
  const filterOptions = shipmentFilterOptions.slice();
  for (let i = 0; i < demandTypes.length; i++) {
    const demandType = demandTypes[i];
    filterOptions.push({
      id: 'shipment.demands.' + i,
      label: 'Demand (' + demandType + ')',
      form: () => FilterNumberFormComponent,
      predicate: ({ shipment }, params) => {
        const demand = shipment.loadDemands[demandType];
        return applyLongValueFilter(demand?.amount, params);
      },
    } as ShipmentFilterOption<NumberFilterParams>);
  }
  return filterOptions;
});

const selectActiveFilterFilterOptions = createSelector(
  selectFilters,
  selectShipmentFilterOptions,
  (filters, filterOptions) =>
    filters.map((f) => ({
      activeFilter: f,
      filterOption: filterOptions.find((fo) => fo.id === f.id),
    }))
);

const selectAvailableFiltersOptions = createSelector(
  selectFilters,
  selectShipmentFilterOptions,
  (filters, filterOptions) =>
    filterOptions
      .filter((fo) => !filters.some((f) => fo.id === f.id))
      .sort((a, b) => a.label.localeCompare(b.label))
);

const selectFiltersOptionById = (id: string) =>
  createSelector(selectShipmentFilterOptions, (filterOptions: ShipmentFilterOption[]) => {
    return filterOptions.find((fo) => fo.id === id);
  });

const selectFilteredVisitRequests = createSelector(
  fromVisitRequest.selectAll,
  fromShipment.selectEntities,
  selectActiveFilterFilterOptions,
  selectSelectedLookup,
  ShipmentModelSelectors.selectGlobalDuration,
  selectShipmentPickupsFn,
  selectShipmentDeliveriesFn,
  (visitRequests, shipments, filters, selected, globalDuration, pickupsFn, deliveriesFn) => {
    return filters.length
      ? visitRequests.filter((vr) => {
          return filters.every(({ activeFilter, filterOption }) => {
            const { shipmentId } = vr;
            const context = {
              globalDuration,
              shipment: shipments[shipmentId],
              visitRequest: vr,
              pickups: pickupsFn(shipmentId),
              deliveries: deliveriesFn(shipmentId),
              selected: selected[shipmentId],
            };
            return filterOption.predicate(context, activeFilter.params);
          });
        })
      : visitRequests;
  }
);

const selectFilteredShipments = createSelector(
  selectFilteredVisitRequests,
  fromShipment.selectEntities,
  (visitRequests, shipments) => {
    const shipmentIds = new Set(visitRequests.map((vr) => vr.shipmentId));
    return Array.from(shipmentIds.values())
      .sort()
      .map((id) => shipments[id]);
  }
);

const selectFilteredShipmentsSelected = createSelector(
  selectFilteredShipments,
  selectSelectedLookup,
  (shipments, selected) => shipments.filter((shipment) => selected[shipment.id])
);

const selectFilteredShipmentsSelectedIds = createSelector(
  selectFilteredShipmentsSelected,
  (shipments) => shipments.map((shipment) => shipment.id)
);

const selectFilteredShipmentsSelectedLookup = createSelector(
  selectFilteredShipmentsSelected,
  (shipments) => {
    const selected = {} as { [id: number]: boolean };
    shipments.forEach((shipment) => {
      selected[shipment.id] = true;
    });
    return selected;
  }
);

const selectFilteredShipmentItems = createSelector(
  selectFilteredVisitRequests,
  fromShipment.selectEntities,
  (visitRequests, shipments) =>
    visitRequests.map<ShipmentItem>((vr) => ({
      shipment: shipments[vr.shipmentId],
      visitRequest: vr,
    }))
);

const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

const selectFilteredVisitRequestsSelected = createSelector(
  selectFilteredVisitRequests,
  selectSelectedLookup,
  (visitRequests, selected) => visitRequests.filter((vr) => selected[vr.shipmentId])
);

const selectFilteredVisitRequestIds = createSelector(
  selectFilteredVisitRequests,
  selectHasActiveFilters,
  (visitRequests, filtersActive) => {
    return filtersActive ? new Set<number>(visitRequests.map((vr) => vr.id)) : null;
  }
);

const selectShipmentItemGroups = createSelector(
  selectFilteredShipmentItems,
  selectSelectedLookup,
  selectActiveSortColumn,
  selectSort,
  (shipmentItems, selected, activeSortColumn, sort) => {
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
      shipmentItems = shipmentItems
        .map(({ shipment, visitRequest }, index) => {
          const value = selector(shipment, visitRequest, selected[shipment.id]);
          const thenByValue = thenBySelector
            ? thenBySelector?.apply(null, [shipment, visitRequest, selected[shipment.id]])
            : null;
          return { id: visitRequest.id, index, value, thenByValue };
        })
        .sort(itemComparer)
        .map((lookup) => shipmentItems[lookup.index]);
    } else {
      shipmentItems = shipmentItems.slice();
    }
    const shipmentItemGroups = new Map<number, ShipmentItem[]>();
    shipmentItems.forEach((sorted) => {
      const shipmentItemGroup = shipmentItemGroups.get(sorted.shipment.id);
      if (shipmentItemGroup) {
        shipmentItemGroup.push(sorted);
        return;
      }
      shipmentItemGroups.set(sorted.shipment.id, [{ ...sorted, first: true }]);
    });
    return shipmentItemGroups;
  }
);

const selectPagedShipmentItems = createSelector(
  selectShipmentItemGroups,
  selectPageIndex,
  selectPageSize,
  (shipmentItemGroups, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    const groups = Array.from(shipmentItemGroups.values());
    return groups.slice(start, start + pageSize).flat();
  }
);

const selectTotalFiltered = createSelector(
  selectFilteredShipments,
  (shipments) => shipments.length
);

const selectTotalSelected = createSelector(selectSelected, (selected) => selected.length);

const selectTotalRequested = createSelector(selectRequested, (requested) => requested.length);

const selectDisplayColumnsState = createSelector(
  selectPreSolveShipmentState,
  fromPreSolveShipment.selectDisplayColumns
);

const selectAllDisplayColumnsOptions = createSelector(
  selectColumns,
  selectDisplayColumnsState,
  (columns, displayColumns) =>
    columns.map<Omit<ShipmentColumn, 'selector'>>((column) => {
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

const selectShipmentsKpis = createSelector(
  selectFilteredShipments,
  selectSelectedLookup,
  selectFilteredShipmentsSelected,
  fromVisitRequest.selectEntities,
  (filteredShipments, selectedLookup, filteredSelected, visitRequests) => {
    const kpis = {
      total: filteredShipments.length,
      selected: filteredSelected.length,
      demands: [],
      pickups: 0,
      deliveries: 0,
      dwellTime: 0,
    };

    filteredSelected.forEach((shipment) => {
      kpis.pickups += shipment.pickups.length > 0 ? 1 : 0;
      kpis.deliveries += shipment.deliveries.length > 0 ? 1 : 0;

      kpis.dwellTime += shipment.pickups.reduce(
        (total, pickup) =>
          total +
          durationSeconds(visitRequests[pickup].duration).toNumber() / shipment.pickups.length,
        0
      );
      kpis.dwellTime += shipment.deliveries.reduce(
        (total, delivery) =>
          total +
          durationSeconds(visitRequests[delivery].duration).toNumber() / shipment.deliveries.length,
        0
      );
    });

    filteredShipments.forEach((shipment) => {
      if (!shipment.loadDemands) {
        return;
      }

      for (const [loadType, load] of Object.entries(shipment.loadDemands)) {
        const demandValue = load?.amount ? Long.fromValue(load?.amount).toNumber() : 0;
        const filteredDemands = kpis.demands.filter((kpiDemand) => kpiDemand.type === loadType);
        if (filteredDemands.length) {
          const matchingDemand = filteredDemands[0];
          matchingDemand.total += demandValue;
          if (selectedLookup[shipment.id]) {
            matchingDemand.selected += demandValue;
          }
        } else {
          kpis.demands.push({
            selected: selectedLookup[shipment.id] ? demandValue : 0,
            total: demandValue,
            type: loadType,
          });
        }
      }
    });
    return kpis;
  }
);

const selectDeselectedIds = createSelector(
  selectSelectedLookup,
  fromShipment.selectIds,
  (selected, ids: number[] | string[]) => new Set((ids as number[]).filter((id) => !selected[id]))
);

const selectUnrequestedIds = createSelector(
  selectRequestedLookup,
  fromShipment.selectIds,
  (requested, ids: number[] | string[]) =>
    new Set((ids as number[]).filter((id) => !requested.has(id)))
);

const selectShowBulkEdit = createSelector(
  selectFilteredShipmentsSelected,
  (shipments) => shipments.length > 1
);

const selectShowBulkDelete = createSelector(
  selectFilteredShipmentsSelected,
  (shipments) => shipments.length > 1
);

export const PreSolveShipmentSelectors = {
  selectFilters,
  selectSelectionFilterActive,
  selectPageIndex,
  selectPageSize,
  selectSort,
  selectSelected,
  selectSelectedColorIndexes,
  selectSelectedColors,
  selectRequested,
  selectEditShipmentId,
  selectEditShipment,
  selectEditShipmentVisitRequests,
  selectSelectedLookup,
  selectSelectedShipments,
  selectRequestedLookup,
  selectRequestedShipments,
  selectShipmentPickupsFn,
  selectShipmentDeliveriesFn,
  selectDemandTypes,
  selectDemandColumns,
  selectColumns,
  selectActiveSortColumn,
  selectShipmentFilterOptions,
  selectActiveFilterFilterOptions,
  selectAvailableFiltersOptions,
  selectFiltersOptionById,
  selectFilteredVisitRequests,
  selectFilteredShipments,
  selectFilteredShipmentsSelected,
  selectFilteredShipmentsSelectedIds,
  selectFilteredShipmentsSelectedLookup,
  selectFilteredShipmentItems,
  selectHasActiveFilters,
  selectFilteredVisitRequestsSelected,
  selectFilteredVisitRequestIds,
  selectShipmentItemGroups,
  selectPagedShipmentItems,
  selectTotalFiltered,
  selectTotalSelected,
  selectTotalRequested,
  selectDisplayColumnsState,
  selectAllDisplayColumnsOptions,
  selectAvailableDisplayColumnsOptions,
  selectColumnsToDisplay,
  selectDisplayColumns,
  selectShipmentsKpis,
  selectDeselectedIds,
  selectUnrequestedIds,
  selectShowBulkEdit,
  selectShowBulkDelete,
};

export default PreSolveShipmentSelectors;
