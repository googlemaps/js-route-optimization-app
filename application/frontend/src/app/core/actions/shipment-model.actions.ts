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
  IPrecedenceRule,
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  ITransitionAttributes,
  NormalizedShipmentModel,
} from '../models';

export const setShipmentModel = createAction(
  '[Shipment Model] Set Shipment Model Settings',
  props<NormalizedShipmentModel>()
);

export const setGlobalDurationCostPerHour = createAction(
  '[Shipment Model] Set Global Cost Per Hour',
  props<{ globalDurationCostPerHour: number }>()
);

export const setMaxActiveVehicles = createAction(
  '[Shipment Model] Set Max Active Vehicles',
  props<{ maxActiveVehicles: number }>()
);

export const setGlobalStartTime = createAction(
  '[Shipment Model] Set Global Start Time',
  props<{ globalStartTime: string | number }>()
);

export const setGlobalEndTime = createAction(
  '[Shipment Model] Set Global End Time',
  props<{ globalEndTime: string | number }>()
);

export const setPrecedenceRules = createAction(
  '[Shipment Model] Set Precedence Rules',
  props<{ precedenceRules: IPrecedenceRule[] }>()
);

export const setShipmentTypeIncompatibilities = createAction(
  '[Shipment Model] Set Shipment Type Incompatibilities',
  props<{ shipmentTypeIncompatibilities: IShipmentTypeIncompatibility[] }>()
);

export const setShipmentTypeRequirements = createAction(
  '[Shipment Model] Set Shipment Type Requirements',
  props<{ shipmentTypeRequirements: IShipmentTypeRequirement[] }>()
);

export const setTransitionAttributes = createAction(
  '[Shipment Model] Set Transition Attributes',
  props<{ transitionAttributes: ITransitionAttributes[] }>()
);
