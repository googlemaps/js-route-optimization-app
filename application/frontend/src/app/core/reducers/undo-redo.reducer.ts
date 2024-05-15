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
