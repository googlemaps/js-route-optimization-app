/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { DispatcherActions, DispatcherApiActions } from '../actions';

export const dispatcherApiFeatureKey = 'dispatcherApi';

export interface State {
  loading: boolean;
  loaded: boolean;
  error: any;
}

export const initialState: State = {
  loading: false,
  loaded: false,
  error: null,
};

export const reducer = createReducer(
  initialState,
  on(DispatcherApiActions.optimizeTours, (state) => ({ ...state, loading: true })),
  on(
    DispatcherActions.uploadScenarioSuccess,
    DispatcherApiActions.optimizeToursCancel,
    DispatcherActions.clearSolution,
    (state) => ({ ...state, loading: false })
  ),
  on(DispatcherApiActions.optimizeToursSuccess, (state) => ({
    ...state,
    loaded: true,
    loading: false,
    error: null,
  })),
  on(DispatcherApiActions.optimizeToursFailure, (state, { error }) => ({
    ...state,
    error,
    loading: false,
  }))
);

export const selectLoaded = (state: State): boolean => state.loaded;

export const selectLoading = (state: State): boolean => state.loading;

export const selectError = (state: State): boolean => state.error;
