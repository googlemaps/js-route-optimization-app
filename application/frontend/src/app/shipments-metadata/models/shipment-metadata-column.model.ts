/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Column } from 'src/app/core/models';
import { durationSeconds, getSoftPenalty } from 'src/app/util';
import { ShipmentMetadata } from './shipment-metadata.model';

export type ShipmentMetadataContext = ShipmentMetadata;

export interface ShipmentMetadataColumn<TValue = any> extends Column {
  selector?: (context: ShipmentMetadataContext) => TValue;
  thenBySelector?: (context: ShipmentMetadataContext) => TValue;
  valueComparer?: (a: any, b: any) => number;
}

export const shipmentMetadataColumns: ShipmentMetadataColumn[] = [
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
    selector: ({ shipment }) => shipment.id,
  },
  {
    id: 'label',
    label: 'Label',
    active: true,
    toggleable: true,
    selector: ({ shipment }) => shipment.label || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'status',
    label: 'Status',
    active: true,
    toggleable: true,
    selector: ({ skipped }) => skipped,
  },
  {
    id: 'reason',
    label: 'Reason',
    active: true,
    toggleable: true,
    selector: ({ skippedReasons }) => skippedReasons?.[0] || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'visit.label',
    label: 'Visit Label',
    active: true,
    toggleable: true,
    selector: ({ visit }) => visit?.visitLabel || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'shipmentType',
    label: 'Shipment Type',
    active: true,
    toggleable: true,
    selector: ({ shipment }) => shipment.shipmentType || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'visitRequest.pickup',
    label: 'Visit Type',
    active: true,
    toggleable: true,
    selector: ({ visitRequest }) => visitRequest.pickup,
  },
  {
    id: 'visit.startTime',
    label: 'Time',
    active: true,
    toggleable: true,
    selector: ({ visit }) =>
      durationSeconds(visit?.startTime)?.toNumber() || Number.MIN_SAFE_INTEGER,
  },
  {
    id: 'visitRequest.duration',
    label: 'Duration',
    active: true,
    toggleable: true,
    selector: ({ visitRequest }) => durationSeconds(visitRequest.duration)?.toNumber() || 0,
  },
  {
    id: 'traveledDistance',
    label: 'Traveled Distance',
    active: true,
    toggleable: true,
    selector: ({ traveledDistanceMeters }) => traveledDistanceMeters || 0,
  },
  {
    id: 'penalty',
    label: 'Penalty',
    active: true,
    toggleable: true,
    selector: ({ timeWindow, visit }) => getSoftPenalty(timeWindow, visit)?.seconds || 0,
  },
  {
    id: 'vehicle.id',
    label: 'Vehicle ID',
    active: true,
    toggleable: true,
    selector: ({ vehicle }) => vehicle.id,
  },
  {
    id: 'vehicle.label',
    label: 'Vehicle Label',
    active: true,
    toggleable: true,
    selector: ({ vehicle }) => vehicle.label || '',
    valueComparer: (a: string, b: string): number => a.localeCompare(b),
  },
  {
    id: 'menu',
    label: 'Menu',
    active: true,
    toggleableHidden: true,
  },
];
