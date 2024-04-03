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

import { Column, VehicleOperator } from 'src/app/core/models';
import { durationSeconds } from 'src/app/util';

export interface VehicleOperatorColumn<TValue = any> extends Column {
  selector?: (vehicleOperator: VehicleOperator, selected: boolean) => TValue;
}

export const vehicleOperatorColumns: VehicleOperatorColumn[] = [
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
    selector: (vehicleOperator) => vehicleOperator.id,
  },
  {
    id: 'label',
    label: 'Label',
    active: true,
    toggleable: true,
    selector: (vehicleOperator) => vehicleOperator.label,
  },
  {
    id: 'type',
    label: 'Type',
    active: true,
    toggleable: true,
    selector: (vehicleOperator) => vehicleOperator.type,
  },
  {
    id: 'startTimeWindow',
    label: 'Start Time Window',
    active: true,
    toggleable: true,
    selector: (vehicleOperator) => (
      durationSeconds(vehicleOperator.startTimeWindows?.[0]?.startTime)?.toNumber() ||
        Number.MIN_SAFE_INTEGER,
      durationSeconds(vehicleOperator.startTimeWindows?.[0]?.endTime)?.toNumber() ||
        Number.MAX_SAFE_INTEGER
    ),
  },
  {
    id: 'endTimeWindow',
    label: 'End Time Window',
    active: true,
    toggleable: true,
    selector: (vehicleOperator) => (
      durationSeconds(vehicleOperator.endTimeWindows?.[0]?.startTime)?.toNumber() ||
        Number.MIN_SAFE_INTEGER,
      durationSeconds(vehicleOperator.endTimeWindows?.[0]?.endTime)?.toNumber() ||
        Number.MAX_SAFE_INTEGER
    ),
  },
  {
    id: 'menu',
    label: 'Menu',
    active: true,
    toggleableHidden: true,
  },
];
