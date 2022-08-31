/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FilterOption } from 'src/app/shared/models';
import {
  ShipmentMetadata,
  ShipmentMetadataColumn,
  shipmentMetadataColumns,
} from 'src/app/shipments-metadata/models';
import { getChosenTimeWindow } from 'src/app/util';
import { ShipmentRoute } from '../models';
import {
  selectedShipmentMetadataFilterOption,
  shipmentMetadataFilterOptions,
} from '../models/shipment-metadata-filter';
import * as fromShipmentsMetadata from '../reducers/shipments-metadata.reducer';
import * as fromConfig from './config.selectors';
import PreSolveShipmentSelectors from './pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from './pre-solve-vehicle.selectors';
import * as fromShipmentRoute from './shipment-route.selectors';
import ShipmentSelectors, * as fromShipment from './shipment.selectors';
import * as fromVehicle from './vehicle.selectors';
import * as fromVisitRequest from './visit-request.selectors';
import * as fromVisit from './visit.selectors';
import ShipmentModelSelectors from './shipment-model.selectors';

export const selectShipmentsMetadataState = createFeatureSelector<fromShipmentsMetadata.State>(
  fromShipmentsMetadata.shipmentsMetadataFeatureKey
);

export const selectFilters = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectFilters
);

export const selectSelectionFilterActive = createSelector(selectFilters, (filters) =>
  filters.map((f) => f.id).includes(selectedShipmentMetadataFilterOption.id)
);

export const selectPageIndex = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectPageIndex
);

export const selectPageSize = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectPageSize
);

export const selectSort = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectSort
);

export const selectSelected = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectSelected
);

export const selectSelectedLookup = createSelector(selectSelected, (selected) => {
  const lookup: { [id: number]: true } = {};
  selected.forEach((id) => (lookup[id] = true));
  return lookup;
});

export const selectSelectedShipments = createSelector(
  fromShipment.selectAll,
  selectSelectedLookup,
  (shipments, selected) => shipments.filter((shipment) => selected[shipment.id])
);

export const selectColumns = createSelector(
  selectShipmentsMetadataState,
  (_state) => shipmentMetadataColumns
);

export const selectActiveSortColumn = createSelector(selectSort, selectColumns, (sort, columns) =>
  columns.find((column) => column.id === sort.active)
);

export const selectFilterOptions = createSelector(
  selectShipmentsMetadataState,
  (_state) => shipmentMetadataFilterOptions
);

export const selectActiveFilterFilterOptions = createSelector(
  selectFilters,
  selectFilterOptions,
  (filters, filterOptions) =>
    filters.map((f) => ({
      activeFilter: f,
      filterOption: filterOptions.find((fo) => fo.id === f.id),
    }))
);

export const selectAvailableFiltersOptions = createSelector(
  selectFilters,
  selectFilterOptions,
  (filters, filterOptions) =>
    filterOptions
      .filter((fo) => !filters.some((f) => fo.id === f.id))
      .sort((a, b) => a.label.localeCompare(b.label))
);

export const selectFiltersOptionById = (id: string) =>
  createSelector(selectFilterOptions, (filterOptions: FilterOption[]) => {
    return filterOptions.find((fo) => fo.id === id);
  });

export const selectSkippedVisitRequests = createSelector(
  fromVisitRequest.selectAll,
  fromShipment.selectEntities,
  PreSolveShipmentSelectors.selectRequestedLookup,
  ShipmentSelectors.selectSkippedLookup,
  (visitRequests, shipments, requestedLookup, skippedLookup) => {
    // Filter visit requests to those part of requested, skipped shipment that is the first alternative of
    // its type (pickup/delivery)
    return visitRequests.filter((vr) => {
      if (requestedLookup.has(vr.shipmentId) && skippedLookup.has(vr.shipmentId)) {
        const shipment = shipments[vr.shipmentId];
        // Alternatives for this visit request type (pickup/delivery)
        const alternatives = vr.pickup ? shipment.pickups : shipment.deliveries;
        // Is this visit request the first alternative?
        return alternatives[0] === vr.id;
      }
    });
  }
);

export const selectSkippedVisitRequestsLookup = createSelector(
  selectSkippedVisitRequests,
  (skippedVisitRequests) => new Set(skippedVisitRequests.map((vr) => vr.id))
);

export const selectVisitRequests = createSelector(
  fromVisitRequest.selectAll,
  fromVisit.selectEntities,
  selectSkippedVisitRequestsLookup,
  (visitRequests, visits, skippedLookup) =>
    visitRequests.filter((vr) => visits[vr.id] || skippedLookup.has(vr.id))
);

const getTraveledDistanceMeters = (visitId: number, shipmentRoute: ShipmentRoute): number => {
  let traveledDistanceMeters: number;
  if (shipmentRoute) {
    traveledDistanceMeters = 0;
    const visits = shipmentRoute.visits || [];
    const travelSteps = shipmentRoute.travelSteps || [];
    for (let i = 0, l = travelSteps.length; i < l; i++) {
      traveledDistanceMeters += travelSteps[i]?.distanceMeters || 0;
      if (visits[i] === visitId) {
        break;
      }
    }
  }
  return traveledDistanceMeters;
};

const selectPartialShipmentMetadata = createSelector(
  selectVisitRequests,
  fromShipment.selectEntities,
  fromVisit.selectEntities,
  ShipmentModelSelectors.selectGlobalDuration,
  selectSelectedLookup,
  ShipmentSelectors.selectSkippedReasons,
  fromConfig.selectSkippedShipmentReasonDescriptions,
  (
    visitRequests,
    shipments,
    visits,
    globalDuration,
    selectedLookup,
    skippedReasons,
    reasonDescriptions
  ) => {
    return visitRequests.map((vr) => {
      const visit = visits[vr.id];
      return {
        globalDuration,
        shipment: shipments[vr.shipmentId],
        visit,
        visitRequest: vr,
        selected: selectedLookup[vr.shipmentId],
        skipped: !visit,
        skippedReasons: skippedReasons[vr.shipmentId]?.map(({ code }) => reasonDescriptions[code]),
      };
    });
  }
);

export const selectShipmentMetadata = createSelector(
  selectPartialShipmentMetadata,
  fromShipmentRoute.selectEntities,
  fromVehicle.selectEntities,
  PreSolveVehicleSelectors.selectRequestedIndexById,
  (partialShipmentMetadata, shipmentRoutes, vehicles, vehicleIndexById) => {
    return partialShipmentMetadata.map<ShipmentMetadata>((shipmentMetadata) => {
      if (shipmentMetadata.skipped) {
        return shipmentMetadata;
      }

      // Add properties specific to visits
      const { visit, visitRequest } = shipmentMetadata;
      const shipmentRouteId = visit?.shipmentRouteId;
      const shipmentRoute = shipmentRoutes[shipmentRouteId];
      const vehicle = vehicles[shipmentRouteId];
      const vehicleIndex = vehicleIndexById.get(vehicle.id);
      const timeWindow = getChosenTimeWindow(visitRequest.timeWindows, visit.startTime);
      return {
        ...shipmentMetadata,
        shipmentRoute,
        vehicle,
        vehicleIndex,
        timeWindow,
        traveledDistanceMeters: getTraveledDistanceMeters(visit.id, shipmentRoute),
      };
    });
  }
);

export const selectFilteredShipmentMetadata = createSelector(
  selectShipmentMetadata,
  selectActiveFilterFilterOptions,
  (shipmentMetadata, filters) => {
    return shipmentMetadata.filter((s) => {
      return filters.every(({ activeFilter, filterOption }) => {
        return filterOption.predicate(s, activeFilter.params);
      });
    });
  }
);

export const selectFilteredShipmentLookup = createSelector(
  selectFilteredShipmentMetadata,
  (shipmentMetadata) => new Set(shipmentMetadata.map((s) => s.shipment.id))
);

export const selectFilteredShipmentIds = createSelector(
  selectFilteredShipmentLookup,
  (shipmentLookup) => Array.from(shipmentLookup.keys())
);

export const selectFilteredShipmentsSelectedLookup = createSelector(
  selectSelected,
  selectFilteredShipmentLookup,
  (selected, shipmentLookup) => {
    const filteredSelected = {} as { [id: number]: boolean };
    selected.forEach((id) => {
      if (shipmentLookup.has(id)) {
        filteredSelected[id] = true;
      }
    });
    return filteredSelected;
  }
);

export const selectHasActiveFilters = createSelector(
  selectActiveFilterFilterOptions,
  (filters) => filters.length > 0
);

export const selectShipmentMetadataGroups = createSelector(
  selectFilteredShipmentMetadata,
  selectActiveSortColumn,
  selectSort,
  (shipmentMetadata, activeSortColumn, sort) => {
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
      shipmentMetadata = shipmentMetadata
        .map((context, index) => {
          const value = selector(context);
          const thenByValue = thenBySelector ? thenBySelector?.apply(null, [context]) : null;
          return { id: context.visitRequest.id, index, value, thenByValue };
        })
        .sort(itemComparer)
        .map((lookup) => shipmentMetadata[lookup.index]);
    } else {
      shipmentMetadata = shipmentMetadata.slice();
    }
    const shipmentMetadataGroups = new Map<number, ShipmentMetadata[]>();
    shipmentMetadata.forEach((sorted) => {
      const shipmentMetadataGroup = shipmentMetadataGroups.get(sorted.shipment.id);
      if (shipmentMetadataGroup) {
        shipmentMetadataGroup.push(sorted);
        return;
      }
      shipmentMetadataGroups.set(sorted.shipment.id, [{ ...sorted, first: true }]);
    });
    return shipmentMetadataGroups;
  }
);

export const selectPagedShipmentMetadata = createSelector(
  selectShipmentMetadataGroups,
  selectPageIndex,
  selectPageSize,
  (shipmentMetadataGroups, pageIndex, pageSize) => {
    const start = pageIndex * pageSize;
    const groups = Array.from(shipmentMetadataGroups.values());
    return groups.slice(start, start + pageSize).flat();
  }
);

export const selectTotalFiltered = createSelector(
  selectFilteredShipmentIds,
  (shipmentIds) => shipmentIds.length
);

export const selectTotalSelected = createSelector(selectSelected, (selected) => selected.length);

const selectDisplayColumnsState = createSelector(
  selectShipmentsMetadataState,
  fromShipmentsMetadata.selectDisplayColumns
);

const selectAllDisplayColumnsOptions = createSelector(
  selectColumns,
  selectDisplayColumnsState,
  (columns, displayColumns) =>
    columns.map<Omit<ShipmentMetadataColumn, 'selector'>>((column) => {
      const { selector: _selector, active, ...option } = column;
      return {
        ...option,
        active: displayColumns?.[column.id] != null ? displayColumns[column.id] : active,
      };
    })
);

export const selectAvailableDisplayColumnsOptions = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) => displayColumnOptions.filter((column) => !column.toggleableHidden)
);

export const selectColumnsToDisplay = createSelector(
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

export const selectDisplayColumns = createSelector(
  selectAllDisplayColumnsOptions,
  (displayColumnOptions) => {
    const displayColumns: { [columnId: string]: boolean } = {};
    displayColumnOptions.forEach((dco) => (displayColumns[dco.id] = dco.active));
    return displayColumns;
  }
);
