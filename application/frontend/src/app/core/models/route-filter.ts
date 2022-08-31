/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
