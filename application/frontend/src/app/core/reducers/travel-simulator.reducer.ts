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

import { createReducer, on } from '@ngrx/store';
import Long from 'long';
import { ShipmentModelActions, TravelSimulatorActions } from '../actions';

export const travelSimulatorKey = 'travelSimulator';

export interface State {
  active: boolean;
  time: number;
}

export const initialState: State = {
  active: false,
  time: 0,
};

export const reducer = createReducer(
  initialState,
  on(TravelSimulatorActions.setActive, (state, { active }) => ({ ...state, active })),
  on(TravelSimulatorActions.setTime, (state, { time }) => ({ ...state, time })),
  // Keep time selection within the global range
  on(ShipmentModelActions.setGlobalStartTime, (state, { globalStartTime }) => ({
    ...state,
    time: Math.max(Long.fromValue(globalStartTime).toNumber(), state.time),
  })),
  on(ShipmentModelActions.setGlobalEndTime, (state, { globalEndTime }) => ({
    ...state,
    time: Math.min(Long.fromValue(globalEndTime).toNumber(), state.time),
  })),
  on(ShipmentModelActions.setShipmentModel, (state, newState) => {
    let newTime = state.time;

    if (newState.globalStartTime) {
      newTime = Long.fromValue(newState.globalStartTime).toNumber();
    }

    if (newState.globalEndTime) {
      newTime = Math.min(Long.fromValue(newState.globalEndTime).toNumber(), newTime);
    }

    return {
      ...state,
      time: newTime,
    };
  })
);

export const selectTime = (state: State): number => state.time;

export const selectActive = (state: State): boolean => state.active;
