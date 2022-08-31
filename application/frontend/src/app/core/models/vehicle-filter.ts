/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
