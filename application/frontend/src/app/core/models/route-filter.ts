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

import { FilterBooleanFormComponent } from 'src/app/shared/components/filter-boolean-form/filter-boolean-form.component';
import { FilterNumberFormComponent } from 'src/app/shared/components/filter-number-form/filter-number-form.component';
import { FilterStringFormComponent } from 'src/app/shared/components/filter-string-form/filter-string-form.component';
import {
  BooleanFilterParams,
  FilterOption,
  FilterParams,
  NumberFilterParams,
  StringFilterParams,
} from 'src/app/shared/models/filter';
import { applyBooleanFilter, applyNumberFilter, applyStringFilter } from 'src/app/util';
import { ShipmentRoute } from '.';

export type RouteFilterContext = {
  route: ShipmentRoute;
  selected: boolean;
};

export type RouteFilterPredicate<TParams extends FilterParams = FilterParams> = (
  context: RouteFilterContext,
  params?: TParams
) => boolean;

export type RouteFilterOption<TParams extends FilterParams = FilterParams> = FilterOption<
  RouteFilterContext,
  RouteFilterPredicate<TParams>
>;

export const selectedRouteFilterOption: RouteFilterOption = {
  id: 'selected',
  label: 'Selected',
  predicate: ({ selected }) => selected,
};

export const routesFilterOptions: RouteFilterOption[] = [
  selectedRouteFilterOption,
  {
    id: 'routeId',
    label: 'Route ID',
    form: () => FilterNumberFormComponent,
    predicate: ({ route }, params) => applyNumberFilter(route.id, params),
  } as RouteFilterOption<NumberFilterParams>,
  {
    id: 'label',
    label: 'Label',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) => applyStringFilter(route.vehicleLabel, params),
  } as RouteFilterOption<StringFilterParams>,
  {
    id: 'operatorIDs',
    label: 'Vehicle Operator IDs',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) =>
      applyStringFilter(
        route.vehicleOperatorIndices.map((element) => element + 1).toString(),
        params
      ),
  } as RouteFilterOption<StringFilterParams>,
  {
    id: 'operatorLabels',
    label: 'Vehicle Operator Labels',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) =>
      applyStringFilter(route.vehicleOperatorLabels?.toString(), params),
  } as RouteFilterOption<StringFilterParams>,
  {
    id: 'utilized',
    label: 'Utilized',
    form: () => FilterBooleanFormComponent,
    predicate: ({ route }, params) => applyBooleanFilter(route.visits.length > 0, params),
  } as RouteFilterOption<BooleanFilterParams>,
  {
    id: 'visits',
    label: 'Visits',
    form: () => FilterNumberFormComponent,
    predicate: ({ route }, params) => applyNumberFilter(route.visits.length, params),
  } as RouteFilterOption<NumberFilterParams>,
];
