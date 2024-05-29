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

import { FilterDateFormComponent } from 'src/app/shared/components/filter-date-form/filter-date-form.component';
import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { FilterSelectFormComponent } from 'src/app/shared/components/filter-select-form/filter-select-form.component';
import { FilterStringFormComponent } from 'src/app/shared/components/filter-string-form/filter-string-form.component';
import {
  DateFilterParams,
  FilterOption,
  FilterParams,
  NumberFilterParams,
  SelectFilterParams,
  StringFilterOperation,
  StringFilterParams,
} from 'src/app/shared/models/filter';
import { ShipmentMetadata } from 'src/app/shipments-metadata/models';
import {
  applyDateFilter,
  applyNumberFilter,
  applyNumberValueFilter,
  applyStringFilter,
  durationSeconds,
  getAvailableTimeRange,
  getSoftPenalty,
} from 'src/app/util';

export type ShipmentsMetadataFilterContext = ShipmentMetadata;

export type ShipmentMetadataFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: ShipmentsMetadataFilterContext,
  params?: TParams
) => boolean;

export type ShipmentMetadataFilterOption<TParams extends FilterParams = FilterParams> =
  FilterOption<ShipmentsMetadataFilterContext, ShipmentMetadataFilterPredicate<TParams>>;

export const selectedShipmentMetadataFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const statusShipmentMetadataFilterOption = {
  id: 'status',
  label: 'Status',
  options: [
    { label: 'Assigned', value: false },
    { label: 'Skipped', value: true },
  ],
  form: () => FilterSelectFormComponent,
  formInit: (form: FilterSelectFormComponent<boolean>) => {
    form.options = form.filterOption.options;
    form.setValue(true);
  },
  predicate: ({ skipped }, params) => skipped === params.value,
};

export const shipmentMetadataFilterOptions: ShipmentMetadataFilterOption[] = [
  selectedShipmentMetadataFilterOption,
  {
    id: 'id',
    label: 'ID',
    form: () => FilterNumberFormComponent,
    predicate: ({ shipment }, params) => applyNumberFilter(shipment.id, params),
  } as ShipmentMetadataFilterOption<NumberFilterParams>,
  {
    id: 'label',
    label: 'Label',
    form: () => FilterStringFormComponent,
    predicate: ({ shipment }, params) => applyStringFilter(shipment.label, params),
  } as ShipmentMetadataFilterOption<StringFilterParams>,
  statusShipmentMetadataFilterOption,
  {
    id: 'reason',
    label: 'Reason',
    form: () => FilterStringFormComponent,
    predicate: ({ skippedReasons }, params) => {
      if (params.operation === StringFilterOperation.Empty) {
        return !skippedReasons?.length;
      }
      return !!skippedReasons?.some((r) => applyStringFilter(r, params));
    },
  } as ShipmentMetadataFilterOption<StringFilterParams>,
  {
    id: 'visit.label',
    label: 'Visit Label',
    form: () => FilterStringFormComponent,
    predicate: ({ visitRequest }, params) => applyStringFilter(visitRequest.label, params),
  } as ShipmentMetadataFilterOption<StringFilterParams>,
  {
    id: 'shipmentType',
    label: 'Shipment Type',
    form: () => FilterStringFormComponent,
    predicate: ({ shipment }, params) => applyStringFilter(shipment.shipmentType, params),
  } as ShipmentMetadataFilterOption<StringFilterParams>,
  statusShipmentMetadataFilterOption,
  {
    id: 'visitRequest.pickup',
    label: 'Visit Type',
    form: () => FilterSelectFormComponent,
    formInit: (form: FilterSelectFormComponent<boolean>) => {
      form.options = [
        { label: 'Pickup', value: true },
        { label: 'Delivery', value: false },
      ];
      form.setValue(true);
    },
    predicate: ({ visitRequest }, params) => visitRequest.pickup === params.value,
  } as ShipmentMetadataFilterOption<SelectFilterParams<boolean>>,
  {
    id: 'visit.startTime',
    label: 'Start Time',
    form: () => FilterDateFormComponent,
    predicate: ({ visitRequest, globalDuration }, params) => {
      const timeWindows = visitRequest.timeWindows;
      const { start, end } = getAvailableTimeRange(globalDuration, timeWindows, timeWindows);
      return applyDateFilter(start.toNumber(), end.toNumber(), params);
    },
  } as ShipmentMetadataFilterOption<DateFilterParams>,
  {
    id: 'visitRequest.duration',
    label: 'Duration',
    form: () => FilterNumberFormComponent,
    predicate: ({ visitRequest }, params) => {
      const duration = durationSeconds(visitRequest.duration, null)?.toNumber();
      const viewDuration = duration != null ? { value: +(duration / 60).toFixed(2) } : null;
      return applyNumberValueFilter(viewDuration.value, params);
    },
  } as ShipmentMetadataFilterOption<NumberFilterParams>,
  {
    id: 'traveledDistance',
    label: 'Traveled Distance',
    form: () => FilterNumberFormComponent,
    predicate: ({ traveledDistanceMeters }, params) => {
      const travelDistance = traveledDistanceMeters != null ? traveledDistanceMeters / 1000 : null;
      return applyNumberFilter(travelDistance, params);
    },
  } as ShipmentMetadataFilterOption<NumberFilterParams>,
  {
    id: 'earlyPenalty',
    label: 'Early Penalty',
    form: () => FilterNumberFormComponent,
    predicate: ({ timeWindow, visit }, params) => {
      const penalty = getSoftPenalty(timeWindow, visit);
      const value = penalty?.early ? penalty.seconds : null;
      return applyNumberFilter(value, params);
    },
  } as ShipmentMetadataFilterOption<NumberFilterParams>,
  {
    id: 'latePenalty',
    label: 'Late Penalty',
    form: () => FilterNumberFormComponent,
    predicate: ({ timeWindow, visit }, params) => {
      const penalty = getSoftPenalty(timeWindow, visit);
      const value = penalty?.early ? null : penalty.seconds;
      return applyNumberFilter(value, params);
    },
  } as ShipmentMetadataFilterOption<NumberFilterParams>,
  {
    id: 'vehicle.label',
    label: 'Vehicle Label',
    form: () => FilterStringFormComponent,
    predicate: ({ vehicle }, params) => applyStringFilter(vehicle?.label, params),
  } as ShipmentMetadataFilterOption<StringFilterParams>,
];
