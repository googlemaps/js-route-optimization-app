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

import { RouteMetadata } from 'src/app/routes-metadata/models';
import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { FilterStringFormComponent } from 'src/app/shared/components/filter-string-form/filter-string-form.component';
import {
  FilterOption,
  FilterParams,
  NumberFilterParams,
  StringFilterParams,
} from 'src/app/shared/models/filter';
import { applyNumberFilter, applyStringFilter } from 'src/app/util';

export type RouteMetadataFilterContext = RouteMetadata;

export type RouteMetadataFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: RouteMetadataFilterContext,
  params?: TParams
) => boolean;

export type RouteMetadataFilterOption<TParams extends FilterParams = FilterParams> = FilterOption<
  RouteMetadataFilterContext,
  RouteMetadataFilterPredicate<TParams>
>;

export const selectedRouteMetadataFilterOption: RouteMetadataFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const routeIdMetadataFilterOption = {
  id: 'id',
  label: 'Route ID',
  form: () => FilterNumberFormComponent,
  predicate: ({ route }, params) => applyNumberFilter(route.id, params),
} as RouteMetadataFilterOption<NumberFilterParams>;

export const routeMetadataFilterOptions: RouteMetadataFilterOption[] = [
  selectedRouteMetadataFilterOption,
  routeIdMetadataFilterOption,
  {
    id: 'vehicle.label',
    label: 'Vehicle Label',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) => applyStringFilter(route.vehicleLabel, params),
  } as RouteMetadataFilterOption<StringFilterParams>,
  {
    id: 'traveledTime',
    label: 'Traveled time (min)',
    form: () => FilterNumberFormComponent,
    predicate: ({ traveledTime }, params) => {
      return applyNumberFilter(traveledTime / 60, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
  {
    id: 'traveledDistance',
    label: 'Traveled distance (km)',
    form: () => FilterNumberFormComponent,
    predicate: ({ traveledDistance }, params) => {
      return applyNumberFilter(traveledDistance, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
  {
    id: 'totalShipments',
    label: 'Number of shipments',
    form: () => FilterNumberFormComponent,
    predicate: ({ totalShipments }, params) => {
      return applyNumberFilter(totalShipments, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
  {
    id: 'totalPickups',
    label: 'Total number of pickups',
    form: () => FilterNumberFormComponent,
    predicate: ({ totalPickups }, params) => {
      return applyNumberFilter(totalPickups, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
  {
    id: 'totalDropoffs',
    label: 'Total number of dropoffs',
    form: () => FilterNumberFormComponent,
    predicate: ({ totalDropoffs }, params) => {
      return applyNumberFilter(totalDropoffs, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
  {
    id: 'cost',
    label: 'Cost per route',
    form: () => FilterNumberFormComponent,
    predicate: ({ cost }, params) => {
      return applyNumberFilter(cost, params);
    },
  } as RouteMetadataFilterOption<NumberFilterParams>,
];
