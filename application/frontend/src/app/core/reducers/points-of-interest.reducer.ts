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
