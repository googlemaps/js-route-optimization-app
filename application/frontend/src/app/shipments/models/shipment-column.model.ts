/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Column, Shipment, VisitRequest } from 'src/app/core/models';
import { durationSeconds } from 'src/app/util';

export interface ShipmentColumn<TValue = any> extends Column {
  selector?: (shipment: Shipment, visitRequest: VisitRequest, selected: boolean) => TValue;
  thenBySelector?: (shipment: Shipment, visitRequest: VisitRequest, selected: boolean) => TValue;
  valueComparer?: (a: any, b: any) => number;
}

export const shipmentColumns: ShipmentColumn[] = [
  {
    id: 'select',
    label: 'Select',
    active: true,
    toggleableHidden: true,
    selector: (shipment, visitRequest, selected) => selected,
  },
  {
    id: 'id',
    label: 'ID',
    active: true,
    toggleableHidden: true,
    selector: (shipment) => shipment.id,
  },
  {
    id: 'label',
    label: 'Label',
    active: true,
    toggleable: true,
    selector: (shipment) => shipment.label || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'type',
    label: 'Type',
    active: true,
    toggleable: true,
    selector: (shipment) => shipment.shipmentType || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'visitRequest.label',
    label: 'Visit Label',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) => visitRequest.label || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'visitRequest.pickup',
    label: 'Visit Type',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) => visitRequest.pickup,
  },
  {
    id: 'visitRequest.timeWindow',
    label: 'Time Window',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) =>
      durationSeconds(visitRequest.timeWindows?.[0]?.startTime)?.toNumber() ||
      Number.MIN_SAFE_INTEGER,
    thenBySelector: (shipment, visitRequest) =>
      durationSeconds(visitRequest.timeWindows?.[0]?.endTime)?.toNumber() ||
      Number.MAX_SAFE_INTEGER,
  },
  {
    id: 'visitRequest.softTimeWindow',
    label: 'Soft Time Window',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) =>
      durationSeconds(visitRequest.timeWindows?.[0]?.softStartTime)?.toNumber() ||
      Number.MIN_SAFE_INTEGER,
    thenBySelector: (shipment, visitRequest) =>
      durationSeconds(visitRequest.timeWindows?.[0]?.softEndTime)?.toNumber() ||
      Number.MAX_SAFE_INTEGER,
  },
  {
    id: 'visitRequest.duration',
    label: 'Duration',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) => durationSeconds(visitRequest.duration)?.toNumber() || 0,
  },
  {
    id: 'visitRequest.cost',
    label: 'Cost',
    active: true,
    toggleable: true,
    selector: (shipment, visitRequest) => visitRequest.cost || 0,
  },
  {
    id: 'menu',
    label: 'Menu',
    active: true,
    toggleableHidden: true,
  },
];
