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

import {
  ITimeWindow,
  Shipment,
  ShipmentRoute,
  Vehicle,
  Visit,
  VisitRequest,
} from 'src/app/core/models';

export interface ShipmentMetadata {
  globalDuration?: [Long, Long];
  shipment: Shipment;
  shipmentRoute?: ShipmentRoute;
  vehicle?: Vehicle;
  visit?: Visit;
  visitRequest: VisitRequest;
  selected: boolean;
  skipped: boolean;
  skippedReasons?: string[];
  timeWindow?: ITimeWindow;
  traveledDistanceMeters?: number;
  vehicleIndex?: number;

  /** Whether this is the first item in a potential group of multiple visits */
  first?: boolean;
}
