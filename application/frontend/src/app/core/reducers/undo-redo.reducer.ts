/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Action, createReducer } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import { Page } from '../models';

export const undoRedoFeatureKey = 'undoRedo';

export interface Frame {
  actions: Action[];
  undoPage: Page;
  redoPage?: Page;
  active: boolean;
}

export interface State {
  undo: Frame[];
  initialState: Partial<Omit<fromRoot.State, 'undoRedo'>>;
  actions: Action[];
  redo: Frame[];
}

export const initialState: State = {
  undo: [],
  initialState: null,
  actions: [],
  redo: [],
};

export const reducer = createReducer(initialState);

export const selectUndo = (state: State): Frame[] => state.undo;

export const selectRedo = (state: State): Frame[] => state.redo;
