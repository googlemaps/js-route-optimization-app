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

import { Dictionary } from '@ngrx/entity';
import { IShipmentTypeIncompatibility, IShipmentTypeRequirement } from './dispatcher.model';
import { ShipmentRoute } from './shipment-route.model';
import { Shipment } from './shipment.model';
import { Vehicle } from './vehicle.model';
import { VisitRequest } from './visit-request.model';
import { Visit } from './visit.model';

export interface ShipmentValidationResult {
  allowedVehicleIndices?: boolean;
  timeWindowOutOfRange?: boolean;
}

export interface VehicleValidationResult {
  timeWindowOutOfRange?: boolean;
}

export interface VisitValidationResult {
  deliveryOutOfRange?: boolean;
  globalOutOfRange?: boolean;
  visitRequestOutOfRange?: boolean;
  vehicleOutOfRange?: boolean;
  shipmentTypeCannotBePerformedBySameVehicle?: {
    shipmentType: string;
    otherShipmentTypes: string[];
  };
  shipmentTypeCannotBeInSameVehicleSimultaneously?: {
    shipmentType: string;
    otherShipmentTypes: string[];
  };
  shipmentTypeMustBePerformedBySameVehicle?: {
    shipmentType: string;
    otherShipmentTypes: string[];
  };
  shipmentTypeMustBePerformedBySameVehicleAtPickupTime?: {
    shipmentType: string;
    otherShipmentTypes: string[];
  };
  shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime?: {
    shipmentType: string;
    otherShipmentTypes: string[];
  };
  shipmentExcessDemand?: {
    [type: string]: number;
  };
}

export interface ValidationResult {
  shipments: { [id: number]: ShipmentValidationResult | undefined };
  vehicles: { [id: number]: VehicleValidationResult | undefined };
}

export interface ValidationRequest {
  shipments: Shipment[];
  vehicles: Vehicle[];
  ignoreShipmentIds: Set<number>;
  ignoreVehicleIds: Set<number>;
}

export interface ValidationContext {
  globalDuration: [Long, Long];
  shipmentTypeIncompatibilities: IShipmentTypeIncompatibility[];
  shipmentTypeRequirements: IShipmentTypeRequirement[];
  shipmentRoutes: Dictionary<ShipmentRoute>;
  shipments: Dictionary<Shipment>;
  vehicles: Dictionary<Vehicle>;
  visitRequests: Dictionary<VisitRequest>;
  visits: Dictionary<Visit>;
  vehicleIndexById: Map<number, number>;
}

export interface ChangedVisits {
  [id: string]: boolean;
}
