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
