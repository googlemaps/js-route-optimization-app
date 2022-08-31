/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Column, Vehicle } from 'src/app/core/models';
import { durationSeconds } from 'src/app/util';
import * as Long from 'long';

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
  {
    id: 'menu',
    label: 'Menu',
    active: true,
    toggleableHidden: true,
  },
];
