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

import { Column } from 'src/app/core/models';
import { RouteMetadata } from './route-metadata.model';

export type RouteMetadataContext = RouteMetadata;

export interface RouteMetadataColumn<TValue = any> extends Column {
  selector?: (context: RouteMetadataContext) => TValue;
  thenBySelector?: (context: RouteMetadataContext) => TValue;
  valueComparer?: (a: any, b: any) => number;
}

export const routeMetadataColumns: RouteMetadataColumn[] = [
  {
    id: 'select',
    label: 'Select',
    active: true,
    toggleableHidden: true,
    selector: ({ selected }) => selected,
  },
  {
    id: 'id',
    label: 'ID',
    active: true,
    toggleableHidden: true,
    selector: ({ route }) => route.id,
  },
  {
    id: 'vehicle.label',
    label: 'Vehicle Label',
    active: true,
    toggleable: true,
    selector: ({ route }) => route.vehicleLabel,
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'capacityUtilizationMax',
    label: 'Max concurrent load / Load limit',
    active: true,
    toggleable: true,
    selector: ({ capacityUtilization }) => capacityUtilization,
  },
  {
    id: 'capacityUtilizationTotal',
    label: 'Total load / Load limit',
    active: true,
    toggleable: true,
    selector: ({ capacityUtilization }) => capacityUtilization,
  },
  {
    id: 'totalShipments',
    label: 'Number of shipments',
    active: true,
    toggleable: true,
    selector: ({ totalShipments }) => totalShipments,
  },
  {
    id: 'totalPickups',
    label: 'Total number of pickups',
    active: true,
    toggleable: true,
    selector: ({ totalPickups }) => totalPickups,
  },
  {
    id: 'totalDropoffs',
    label: 'Total number of deliveries',
    active: true,
    toggleable: true,
    selector: ({ totalDropoffs }) => totalDropoffs,
  },
  {
    id: 'traveledTime',
    label: 'Route duration',
    active: true,
    toggleable: true,
    selector: ({ traveledTime }) => traveledTime,
  },
  {
    id: 'traveledDistance',
    label: 'Traveled distance',
    active: true,
    toggleable: true,
    selector: ({ traveledDistance }) => traveledDistance,
  },
  {
    id: 'cost',
    label: 'Cost per route',
    active: true,
    toggleable: true,
    selector: ({ cost }) => cost,
  },
];
