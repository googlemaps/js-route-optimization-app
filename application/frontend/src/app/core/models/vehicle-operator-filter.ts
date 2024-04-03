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

import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { FilterStringFormComponent } from 'src/app/shared/components/filter-string-form/filter-string-form.component';
import {
  DateFilterParams,
  FilterOption,
  FilterParams,
  NumberFilterParams,
  StringFilterParams,
} from 'src/app/shared/models/filter';
import {
  applyDateFilter,
  applyNumberFilter,
  applyStringFilter,
  getAvailableTimeRange,
} from 'src/app/util';
import { VehicleOperator } from '.';
import { FilterDateFormComponent } from '../../shared/components';
import * as Long from 'long';

export type VehicleOperatorFilterContext = {
  globalDuration?: [Long, Long];
  vehicleOperator: VehicleOperator;
  selected: boolean;
};

export type VehicleOperatorFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: VehicleOperatorFilterContext,
  params?: TParams
) => boolean;

export type VehicleOperatorFilterOption<TParams extends FilterParams = FilterParams> = FilterOption<
  VehicleOperatorFilterContext,
  VehicleOperatorFilterPredicate<TParams>
>;

export const selectedVehicleOperatorFilterOption: VehicleOperatorFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const vehicleOperatorFilterOptions: VehicleOperatorFilterOption[] = [
  selectedVehicleOperatorFilterOption,
  {
    id: 'id',
    label: 'ID',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicleOperator }, params) => applyNumberFilter(vehicleOperator.id, params),
  } as VehicleOperatorFilterOption<NumberFilterParams>,
  {
    id: 'label',
    label: 'Label',
    form: () => FilterStringFormComponent,
    predicate: ({ vehicleOperator }, params) => applyStringFilter(vehicleOperator.label, params),
  } as VehicleOperatorFilterOption<StringFilterParams>,
  {
    id: 'type',
    label: 'Type',
    form: () => FilterStringFormComponent,
    predicate: ({ vehicleOperator }, params) => applyStringFilter(vehicleOperator.type, params),
  } as VehicleOperatorFilterOption<StringFilterParams>,
  {
    id: 'startTimeWindow',
    label: 'Start Time Window',
    form: () => FilterDateFormComponent,
    predicate: ({ vehicleOperator, globalDuration }, params) => {
      const timeWindows = vehicleOperator.startTimeWindows;
      const { start, end } = getAvailableTimeRange(globalDuration, timeWindows, timeWindows);
      return applyDateFilter(start.toNumber(), end.toNumber(), params);
    },
  } as VehicleOperatorFilterOption<DateFilterParams>,
  {
    id: 'endTimeWindow',
    label: 'End Time Window',
    form: () => FilterDateFormComponent,
    predicate: ({ vehicleOperator, globalDuration }, params) => {
      const timeWindows = vehicleOperator.endTimeWindows;
      const { start, end } = getAvailableTimeRange(globalDuration, timeWindows, timeWindows);
      return applyDateFilter(start.toNumber(), end.toNumber(), params);
    },
  } as VehicleOperatorFilterOption<DateFilterParams>,
];
