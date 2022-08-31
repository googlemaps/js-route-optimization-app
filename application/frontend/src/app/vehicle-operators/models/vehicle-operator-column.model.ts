/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
