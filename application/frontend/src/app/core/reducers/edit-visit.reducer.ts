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
import { EditVisitActions, MapActions, RoutesChartActions } from '../actions';
import { ShipmentRoute, Visit } from '../models';

export const editVisitFeatureKey = 'editVisit';

export interface State {
  visitId?: number;
  commitChanges?: { visits: Visit[]; shipmentRoutes: ShipmentRoute[] };
  savePending: boolean;
  saveChanges?: { visits: Visit[]; shipmentRoutes: ShipmentRoute[] };
  saveError: any;
}

export const initialState: State = {
  visitId: null,
  commitChanges: null,
  savePending: false,
  saveChanges: null,
  saveError: null,
};

export const reducer = createReducer(
  initialState,

  on(MapActions.editVisit, RoutesChartActions.editVisit, (state, { visitId }) => ({
    ...state,
    visitId,
  })),
  on(
    EditVisitActions.cancel,
    EditVisitActions.commitChanges,
    EditVisitActions.editShipment,
    () => initialState
  ),
  on(EditVisitActions.saveSuccess, (state, { visits, shipmentRoutes }) => ({
    ...state,
    commitChanges: { visits, shipmentRoutes },
    saveChanges: null,
    savePending: false,
    saveError: null,
  })),
  on(EditVisitActions.save, (state, { visits, shipmentRoutes }) => ({
    ...state,
    saveChanges: { visits, shipmentRoutes },
    savePending: true,
    saveError: null,
  })),
  on(EditVisitActions.saveCancel, (state) => ({
    ...state,
    savePending: false,
    saveChanges: null,
    saveError: null,
  })),
  on(EditVisitActions.saveFailure, (state, { error }) => ({
    ...state,
    savePending: false,
    saveChanges: null,
    saveError: error,
  }))
);

export const selectVisitId = (state: State): number => state.visitId;

export const selectCommitChanges = (
  state: State
): { visits: Visit[]; shipmentRoutes: ShipmentRoute[] } => state.commitChanges;

export const selectSavePending = (state: State): boolean => state.savePending;

export const selectSaveChanges = (
  state: State
): { visits: Visit[]; shipmentRoutes: ShipmentRoute[] } => state.saveChanges;

export const selectSaveError = (state: State): any => state.saveError;
