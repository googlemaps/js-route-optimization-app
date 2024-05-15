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

import { createAction, props } from '@ngrx/store';
import {
  ElapsedSolution,
  ISkippedShipmentReason,
  Scenario,
  Shipment,
  ShipmentRoute,
  Vehicle,
  Visit,
  VisitRequest,
} from '../models';

export const uploadScenarioSuccess = createAction(
  '[Dispatcher] Upload Scenario Success',
  props<{ scenario: Scenario; scenarioName?: string }>()
);

export const loadScenario = createAction(
  '[Dispatcher] Load Scenario',
  props<{
    shipments: Shipment[];
    vehicles: Vehicle[];
    visitRequests: VisitRequest[];
    selectedShipments: number[];
    selectedVehicles: number[];
    changeTime: number;
  }>()
);

export const loadSolution = createAction(
  '[Dispatcher] Load Solution',
  props<{
    elapsedSolution: ElapsedSolution;
    requestedShipmentIds: number[];
    requestedVehicleIds: number[];
    shipmentRoutes: ShipmentRoute[];
    visits: Visit[];
    skippedShipments: number[];
    skippedShipmentReasons: { [id: number]: ISkippedShipmentReason[] };
  }>()
);

export const initializeRangeOffset = createAction(
  '[Dispatcher] Initialize Range Offset',
  props<{ rangeOffset: number }>()
);

export const clearSolution = createAction('[Dispatcher] Clear Solution');

export const saveScenarioName = createAction(
  '[Dispatcher] Save Scenario Name',
  props<{ scenarioName: string }>()
);
