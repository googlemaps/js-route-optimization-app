/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { PointOfInterestEndDrag, PointOfInterestStartDrag, ShipmentRoute, Visit } from '../models';
import { PoiActions } from '../actions';

export const poiFeatureKey = 'pointsOfInterest';

export interface State {
  dragStart: PointOfInterestStartDrag;
  dragEnd: PointOfInterestEndDrag;
  isDragging: boolean;
  timeline: {
    id: number;
    scrollOffsetY: number;
    y: number;
  };
  savePending: boolean;
  saveChanges?: { visits: Visit[]; shipmentRoutes: ShipmentRoute[] };
  saveError?: any;
}

export const initialState: State = {
  dragStart: null,
  dragEnd: null,
  isDragging: false,
  timeline: null,
  savePending: false,
  saveChanges: null,
  saveError: null,
};

export const reducer = createReducer(
  initialState,
  on(PoiActions.startDrag, (state, { dragStart }) => ({
    ...state,
    dragStart,
    isDragging: true,
    timeline: null,
  })),
  on(PoiActions.endDrag, (state, { dragEnd }) => ({ ...state, dragEnd, isDragging: false })),
  on(PoiActions.beginTimelineOverlap, (state, { overlap }) => ({
    ...state,
    timeline: { ...overlap },
  })),
  on(PoiActions.endTimelineOverlap, (state) => ({ ...state, timeline: null })),
  on(PoiActions.save, (state, { visits, shipmentRoutes }) => ({
    ...state,
    savePending: true,
    saveChanges: { visits, shipmentRoutes },
    saveError: null,
  })),
  on(PoiActions.saveCancel, (state) => ({
    ...state,
    savePending: false,
    saveChanges: null,
    saveError: null,
  })),
  on(PoiActions.saveFailure, (state, { error }) => ({
    ...state,
    savePending: false,
    saveChanges: null,
    saveError: error,
  })),
  on(PoiActions.saveSuccess, (state) => ({
    ...state,
    saveChanges: null,
    savePending: false,
    saveError: null,
  }))
);

export const selectDragState = (state: State): State => state;
export const selectDragStart = (state: State): PointOfInterestStartDrag => state.dragStart;
export const selectDragEnd = (state: State): PointOfInterestEndDrag => state.dragEnd;
export const selectIsDragging = (state: State): boolean => state.isDragging;
export const selectOverlapTimeline = (
  state: State
): { id: number; scrollOffsetY: number; y: number } => state.timeline;
export const selectSavePending = (state: State): boolean => state.savePending;
export const selectSaveChanges = (
  state: State
): { visits: Visit[]; shipmentRoutes: ShipmentRoute[] } => state.saveChanges;
export const selectSaveError = (state: State): any => state.saveError;
