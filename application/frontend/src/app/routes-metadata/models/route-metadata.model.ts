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

import { ShipmentRoute } from 'src/app/core/models';
import { google } from '@google-cloud/optimization/build/protos/protos';

export interface RouteMetadata {
  capacityUtilization: {
    name: string;
    used: number;
    total: number;
  }[];
  cost: number;
  endLocation: google.type.ILatLng;
  route: ShipmentRoute;
  selected: boolean;
  startLocation: google.type.ILatLng;
  totalDropoffs: number;
  totalPickups: number;
  totalShipments: number;
  traveledTime: number;
}
