/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { MapApiActions } from '../actions';

export const mapApiFeatureKey = 'mapApi';

export interface State {
  script: {
    loaded: boolean;
    loading: boolean;
    error: any;
  };
}

export const initialState: State = {
  script: {
    loading: false,
    loaded: false,
    error: null,
  },
};

export const reducer = createReducer(
  initialState,
  on(MapApiActions.loadScript, (state) => ({
    ...state,
    script: { ...state.script, loading: true },
  })),
  on(MapApiActions.loadScriptSuccess, (state) => ({
    ...state,
    script: { ...state.script, loaded: true, loading: false, error: null },
  })),
  on(MapApiActions.loadScriptFailure, (state, { error }) => ({
    ...state,
    script: { ...state.script, error, loading: false },
  }))
);

export const selectScriptLoaded = (state: State): boolean => state.script && state.script.loaded;

export const selectScriptLoading = (state: State): boolean => state.script && state.script.loading;

export const selectScriptError = (state: State): boolean => state.script && state.script.error;
