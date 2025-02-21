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

import { Column, Vehicle } from 'src/app/core/models';
import { durationSeconds } from 'src/app/util';
import Long from 'long';

export interface VehicleColumn<TValue = any> extends Column {
  selector?: (vehicle: Vehicle, selected: boolean) => TValue;
}

export const vehicleColumns: VehicleColumn[] = [
  {
    id: 'select',
    label: 'Select',
    active: true,
    toggleableHidden: true,
    selector: (_, selected) => selected,
  },
  {
    id: 'id',
    label: 'ID',
    active: true,
    toggleableHidden: true,
    selector: (vehicle) => vehicle.id,
  },
  {
    id: 'menu',
    label: 'Menu',
    active: true,
    toggleableHidden: true,
  },
  {
    id: 'label',
    label: 'Label',
    active: true,
    toggleable: true,
    selector: (vehicle) => vehicle.label,
  },
  {
    id: 'fixedCost',
    label: 'Fixed Cost',
    active: true,
    toggleable: true,
    selector: (vehicle) => vehicle.fixedCost,
  },
  {
    id: 'costPerHour',
    label: 'Cost Per Hour',
    active: true,
    toggleable: true,
    selector: (vehicle) => vehicle.costPerHour,
  },
  {
    id: 'costPerKilometer',
    label: 'Cost Per Kilometer',
    active: true,
    toggleable: true,
    selector: (vehicle) => vehicle.costPerKilometer,
  },
  {
    id: 'routeDistanceLimit',
    label: 'Route Distance Limit',
    active: true,
    toggleable: true,
    selector: (vehicle) => Long.fromValue(vehicle.routeDistanceLimit?.maxMeters || 0).toNumber(),
  },
  {
    id: 'routeDurationLimit',
    label: 'Route Duration Limit',
    active: true,
    toggleable: true,
    selector: (vehicle) => durationSeconds(vehicle.routeDurationLimit?.maxDuration).toNumber(),
  },
  {
    id: 'travelDurationLimit',
    label: 'Travel Duration Limit',
    active: true,
    toggleable: true,
    selector: (vehicle) => durationSeconds(vehicle.travelDurationLimit?.maxDuration).toNumber(),
  },
];
