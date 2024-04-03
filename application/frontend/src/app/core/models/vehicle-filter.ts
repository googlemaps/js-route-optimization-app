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
  FilterOption,
  FilterParams,
  NumberFilterParams,
  StringFilterParams,
} from 'src/app/shared/models/filter';
import {
  applyDurationFilter,
  applyLongValueFilter,
  applyNumberFilter,
  applyStringFilter,
} from 'src/app/util';
import { Vehicle } from '.';

export type VehicleFilterContext = {
  vehicle: Vehicle;
  selected: boolean;
};

export type VehicleFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: VehicleFilterContext,
  params?: TParams
) => boolean;

export type VehicleFilterOption<TParams extends FilterParams = FilterParams> = FilterOption<
  VehicleFilterContext,
  VehicleFilterPredicate<TParams>
>;

export const selectedVehicleFilterOption: VehicleFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const vehicleFilterOptions: VehicleFilterOption[] = [
  selectedVehicleFilterOption,
  {
    id: 'id',
    label: 'ID',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) => applyNumberFilter(vehicle.id, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'label',
    label: 'Label',
    form: () => FilterStringFormComponent,
    predicate: ({ vehicle }, params) => applyStringFilter(vehicle.label, params),
  } as VehicleFilterOption<StringFilterParams>,
  {
    id: 'fixedCost',
    label: 'Fixed Cost',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) => applyNumberFilter(vehicle.fixedCost, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'costPerHour',
    label: 'Cost Per Hour',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) => applyNumberFilter(vehicle.costPerHour, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'costPerKilometer',
    label: 'Cost Per Kilometer',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) => applyNumberFilter(vehicle.costPerKilometer, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'routeDistanceLimit',
    label: 'Route Distance Limit',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) =>
      applyLongValueFilter(vehicle.routeDistanceLimit?.maxMeters, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'routeDurationLimit',
    label: 'Route Duration Limit',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) =>
      applyDurationFilter(vehicle.routeDurationLimit?.maxDuration, params),
  } as VehicleFilterOption<NumberFilterParams>,
  {
    id: 'travelDurationLimit',
    label: 'Travel Duration Limit',
    form: () => FilterNumberFormComponent,
    predicate: ({ vehicle }, params) =>
      applyDurationFilter(vehicle.travelDurationLimit?.maxDuration, params),
  } as VehicleFilterOption<NumberFilterParams>,
];
