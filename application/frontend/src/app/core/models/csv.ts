/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export enum ShipmentFields {
  Label,
  PenaltyCost,
  PickupArrivalWaypoint,
  PickupDuration,
  PickupCost,
  PickupStartTime,
  PickupSoftStartTime,
  PickupEndTime,
  PickupSoftEndTime,
  PickupCostPerHourBeforeSoftStartTime,
  PickupCostPerHourAfterSoftEndTime,
  DeliveryArrivalWaypoint,
  DeliveryDuration,
  DeliveryCost,
  DeliveryStartTime,
  DeliverySoftStartTime,
  DeliveryEndTime,
  DeliverySoftEndTime,
  DeliveryCostPerHourBeforeSoftStartTime,
  DeliveryCostPerHourAfterSoftEndTime,
  LoadDemand1Type,
  LoadDemand1Value,
  LoadDemand2Type,
  LoadDemand2Value,
  LoadDemand3Type,
  LoadDemand3Value,
  LoadDemand4Type,
  LoadDemand4Value,
  AllowedVehicleIndices,
}

export enum VehicleFields {
  Label,
  TravelMode,
  StartWaypoint,
  EndWaypoint,
  UnloadingPolicy,
  CostPerHour,
  CostPerTraveledHour,
  FixedCost,
  UsedIfRouteIsEmpty,
  TravelDurationMultiple,
  StartTimeWindowStartTime,
  StartTimeWindowSoftStartTime,
  StartTimeWindowEndTime,
  StartTimeWindowSoftEndTime,
  StartTimeWindowCostPerHourBeforeSoftStartTime,
  StartTimeWindowCostPerHourAfterSoftEndTime,
  EndTimeWindowStartTime,
  EndTimeWindowSoftStartTime,
  EndTimeWindowEndTime,
  EndTimeWindowSoftEndTime,
  EndTimeWindowCostPerHourBeforeSoftStartTime,
  EndTimeWindowCostPerHourAfterSoftEndTime,
  LoadLimit1Type,
  LoadLimit1Value,
  LoadLimit2Type,
  LoadLimit2Value,
  LoadLimit3Type,
  LoadLimit3Value,
  LoadLimit4Type,
  LoadLimit4Value,
  RequiredOperatorType1,
  RequiredOperatorType2,
  RequiredOperatorType3,
}

export enum VehicleOperatorFields {
  Label,
  Type,
  StartTimeWindowStartTime,
  StartTimeWindowEndTime,
  EndTimeWindowStartTime,
  EndTimeWindowEndTime,
}

export interface CsvData {
  vehicleIndex: number;
  vehicleLabel: string;
  vehicleOperatorIndices: string;
  vehicleOperatorLabels: string;
  visitType: string;
  visitLabel: string;
  visitStart: string;
  visitEnd: string;
  shipmentIndex: number;
  shipmentLabel: string;
  timeToNextStop: string;
  location: string;
}

export const CSV_COLUMN_ORDER = [
  'vehicleIndex',
  'vehicleLabel',
  'vehicleOperatorIndices',
  'vehicleOperatorLabels',
  'visitType',
  'visitLabel',
  'visitStart',
  'visitEnd',
  'timeToNextStop',
  'shipmentIndex',
  'shipmentLabel',
  'location',
];

export const CSV_DATA_LABELS = {
  vehicleIndex: 'Vehicle index',
  vehicleLabel: 'Vehicle label',
  vehicleOperatorIndices: 'Vehicle operator indices',
  vehicleOperatorLabels: 'Vehicle Operator Labels',
  visitType: 'Visit type',
  visitLabel: 'Visit label',
  visitStart: 'Visit start',
  visitEnd: 'Visit end',
  shipmentIndex: 'Shipment index',
  shipmentLabel: 'Shipment label',
  timeToNextStop: 'Time to next stop (HH:MM:SS)',
  location: 'Visit location (lat, lng)',
};

export const CSV_DATA_LABELS_ABBREVIATED = {
  shipmentIndex: 'Ship idx',
  shipmentLabel: 'Ship label',
  timeToNextStop: 'Time to next stop',
};

export interface GeocodeErrorResponse {
  location: string;
  error: true;
  message?: string;
  source?: any;
  field?: string;
  shipment?: any;
  vehicle?: any;
  index?: number;
}

export const EXPERIMENTAL_API_FIELDS_VEHICLES = [
  'requiredOperatorType1',
  'requiredOperatorType2',
  'requiredOperatorType3',
];
