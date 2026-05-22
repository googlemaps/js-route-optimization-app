/*
Copyright 2026 Google LLC

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

import { google } from '@googlemaps/routeoptimization/build/protos/protos';
import v1 = google.maps.routeoptimization.v1;

import OptimizeToursRequest = v1.OptimizeToursRequest;
import OptimizeToursResponse = v1.OptimizeToursResponse;
import IOptimizeToursResponse = v1.IOptimizeToursResponse;
import IMetrics = v1.OptimizeToursResponse.IMetrics;
import IShipment = v1.IShipment;
import IVehicle = v1.IVehicle;
import IShipmentRoute = v1.IShipmentRoute;
import IShipmentModel = v1.IShipmentModel;
import IVisit = v1.ShipmentRoute.IVisit;

export { OptimizeToursRequest, OptimizeToursResponse };
export type {
  IMetrics,
  IShipmentRoute,
  IShipment,
  IVehicle,
  IShipmentModel,
  IOptimizeToursResponse,
  IVisit,
};
