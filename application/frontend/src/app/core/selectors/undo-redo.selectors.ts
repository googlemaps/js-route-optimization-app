/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
