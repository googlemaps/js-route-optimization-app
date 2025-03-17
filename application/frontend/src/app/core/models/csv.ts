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
  CostPerKilometer,
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
}

export interface CsvData {
  vehicleIndex: number;
  vehicleLabel: string;
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
  visitType: 'Visit type',
  visitLabel: 'Visit label',
  visitStart: 'Visit start',
  visitEnd: 'Visit end',
  shipmentIndex: 'Shipment index',
  shipmentLabel: 'Shipment label',
  timeToNextStop: 'Time to next stop',
  location: 'Visit location (lat, lng)',
};

export const CSV_DATA_LABELS_ABBREVIATED = {
  shipmentIndex: 'Ship idx',
  shipmentLabel: 'Ship label',
  timeToNextStop: 'Time to next stop',
};

export interface ValidationErrorResponse {
  error: true;
  message?: string;
  source?: any;
  field?: string;
  shipment?: any;
  vehicle?: any;
  index?: number;
}

export interface GeocodeErrorResponse extends ValidationErrorResponse {
  location: string;
}

export const EXPERIMENTAL_API_FIELDS_VEHICLES = [];
