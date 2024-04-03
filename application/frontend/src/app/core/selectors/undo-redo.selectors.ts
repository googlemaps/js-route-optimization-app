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

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromUndoRedo from '../reducers/undo-redo.reducer';

export const selectUndoRedoState = createFeatureSelector<fromUndoRedo.State>(
  fromUndoRedo.undoRedoFeatureKey
);

export const selectUndo = createSelector(selectUndoRedoState, fromUndoRedo.selectUndo);

export const selectRedo = createSelector(selectUndoRedoState, fromUndoRedo.selectRedo);

export const selectCanUndo = createSelector(selectUndo, (undo) =>
  undo?.some((frame) => frame.active)
);

export const selectCanRedo = createSelector(selectRedo, (redo) =>
  redo?.some((frame) => frame.active)
);
