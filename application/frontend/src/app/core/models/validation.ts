/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
