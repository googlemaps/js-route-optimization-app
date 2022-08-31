/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
