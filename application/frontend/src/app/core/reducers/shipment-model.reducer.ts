/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { ShipmentModelActions } from '../actions';
import {
  IPrecedenceRule,
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  ITransitionAttributes,
} from '../models';

export const shipmentModelFeatureKey = 'shipmentModel';

export interface State {
  globalDurationCostPerHour?: number;
  globalStartTime?: string | number;
  globalEndTime?: string | number;
  maxActiveVehicles?: number;
  precedenceRules?: IPrecedenceRule[];
  shipmentTypeIncompatibilities?: IShipmentTypeIncompatibility[];
  shipmentTypeRequirements?: IShipmentTypeRequirement[];
  transitionAttributes?: ITransitionAttributes[];
}

export const initialState: State = {
  globalDurationCostPerHour: null,
  globalStartTime: 0,
  globalEndTime: 0,
  maxActiveVehicles: null,
  precedenceRules: null,
  shipmentTypeIncompatibilities: null,
  shipmentTypeRequirements: null,
  transitionAttributes: null,
};

export const reducer = createReducer(
  initialState,
  on(ShipmentModelActions.setShipmentModel, (state, newState) => {
    const { type: _type, ...shipmentModel } = newState;
    return { ...state, ...shipmentModel };
  }),
  on(ShipmentModelActions.setGlobalDurationCostPerHour, (state, newState) => ({
    ...state,
    globalDurationCostPerHour: newState.globalDurationCostPerHour,
  })),
  on(
    ShipmentModelActions.setMaxActiveVehicles,
    // Clamp maxActiveVehicles to an integer between 1 and the max Int32 value
    (state, newState) => ({ ...state, maxActiveVehicles: newState.maxActiveVehicles })
  ),
  on(ShipmentModelActions.setGlobalStartTime, (state, newState) => ({
    ...state,
    globalStartTime: newState.globalStartTime,
  })),
  on(ShipmentModelActions.setGlobalEndTime, (state, newState) => ({
    ...state,
    globalEndTime: newState.globalEndTime,
  })),
  on(ShipmentModelActions.setPrecedenceRules, (state, newState) => ({
    ...state,
    precedenceRules: newState.precedenceRules,
  })),
  on(ShipmentModelActions.setShipmentTypeIncompatibilities, (state, newState) => ({
    ...state,
    shipmentTypeIncompatibilities: newState.shipmentTypeIncompatibilities,
  })),
  on(ShipmentModelActions.setShipmentTypeRequirements, (state, newState) => ({
    ...state,
    shipmentTypeRequirements: newState.shipmentTypeRequirements,
  })),
  on(ShipmentModelActions.setTransitionAttributes, (state, newState) => ({
    ...state,
    transitionAttributes: newState.transitionAttributes,
  }))
);

export const selectGlobalEndTime = (state: State): string | number => state.globalEndTime;
export const selectGlobalStartTime = (state: State): string | number => state.globalStartTime;
export const selectGlobalDurationCostPerHour = (state: State): number =>
  state.globalDurationCostPerHour;
export const selectPrecedenceRules = (state: State): IPrecedenceRule[] => state.precedenceRules;
export const selectMaxActiveVehicles = (state: State): number => state.maxActiveVehicles;
export const selectShipmentTypeIncompatibilities = (state: State): IShipmentTypeIncompatibility[] =>
  state.shipmentTypeIncompatibilities;
export const selectShipmentTypeRequirements = (state: State): IShipmentTypeRequirement[] =>
  state.shipmentTypeRequirements;
export const selectTransitionAttributes = (state: State): ITransitionAttributes[] =>
  state.transitionAttributes;
