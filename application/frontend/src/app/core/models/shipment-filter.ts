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

import * as Long from 'long';
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
  StringFilterParams,
} from 'src/app/shared/models/filter';
import {
  applyDateFilter,
  applyNumberFilter,
  applyNumberValueFilter,
  applyStringFilter,
  durationSeconds,
  getAvailableTimeRange,
} from 'src/app/util';
import { Shipment } from './shipment.model';
import { VisitRequest } from './visit-request.model';

export type ShipmentFilterContext = {
  globalDuration: [Long, Long];
  shipment: Shipment;
  visitRequest: VisitRequest;
  pickups: VisitRequest[];
  deliveries: VisitRequest[];
  selected: boolean;
};

export type ShipmentFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: ShipmentFilterContext,
  params?: TParams
) => boolean;

export type ShipmentFilterOption<TParams extends FilterParams = FilterParams> = FilterOption<
  ShipmentFilterContext,
  ShipmentFilterPredicate<TParams>
>;

export const selectedShipmentFilterOption: ShipmentFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const shipmentFilterOptions: ShipmentFilterOption[] = [
  selectedShipmentFilterOption,
  {
    id: 'id',
    label: 'ID',
    form: () => FilterNumberFormComponent,
    predicate: ({ shipment }, params) => applyNumberFilter(shipment.id, params),
  } as ShipmentFilterOption<NumberFilterParams>,
  {
    id: 'label',
    label: 'Label',
    form: () => FilterStringFormComponent,
    predicate: ({ shipment }, params) => applyStringFilter(shipment.label, params),
  } as ShipmentFilterOption<StringFilterParams>,
  {
    id: 'shipmentType',
    label: 'Shipment Type',
    form: () => FilterStringFormComponent,
    predicate: ({ shipment }, params) => applyStringFilter(shipment.shipmentType, params),
  } as ShipmentFilterOption<StringFilterParams>,
  {
    id: 'visitRequest.label',
    label: 'Visit Label',
    form: () => FilterStringFormComponent,
    predicate: ({ visitRequest }, params) => applyStringFilter(visitRequest.label, params),
  } as ShipmentFilterOption<StringFilterParams>,
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
  } as ShipmentFilterOption<SelectFilterParams<boolean>>,
  {
    id: 'visitRequest.timeWindow',
    label: 'Time Window',
    form: () => FilterDateFormComponent,
    predicate: ({ visitRequest, globalDuration }, params) => {
      const timeWindows = visitRequest.timeWindows;
      const { start, end } = getAvailableTimeRange(globalDuration, timeWindows, timeWindows);
      return applyDateFilter(start.toNumber(), end.toNumber(), params);
    },
  } as ShipmentFilterOption<DateFilterParams>,
  {
    id: 'visitRequest.duration',
    label: 'Duration',
    form: () => FilterNumberFormComponent,
    predicate: ({ visitRequest }, params) => {
      const duration = durationSeconds(visitRequest.duration, null)?.toNumber();
      const viewDuration = duration != null ? { value: +(duration / 60).toFixed(2) } : null;
      return applyNumberValueFilter(viewDuration.value, params);
    },
  } as ShipmentFilterOption<NumberFilterParams>,
  {
    id: 'visitRequest.cost',
    label: 'Cost',
    form: () => FilterNumberFormComponent,
    predicate: ({ visitRequest }, params) => applyNumberValueFilter(visitRequest.cost, params),
  } as ShipmentFilterOption<NumberFilterParams>,
];
