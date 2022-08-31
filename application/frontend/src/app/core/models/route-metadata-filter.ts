/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
    id: 'vehicleOperator.Ids',
    label: 'Vehicle Operator IDs',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) =>
      applyStringFilter(
        route.vehicleOperatorIndices.map((element) => element + 1).toString(),
        params
      ),
  } as RouteMetadataFilterOption<StringFilterParams>,
  {
    id: 'vehicleOperator.label',
    label: 'Vehicle Operator Labels',
    form: () => FilterStringFormComponent,
    predicate: ({ route }, params) =>
      applyStringFilter(route.vehicleOperatorLabels?.toString(), params),
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
