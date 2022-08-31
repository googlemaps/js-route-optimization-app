/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
