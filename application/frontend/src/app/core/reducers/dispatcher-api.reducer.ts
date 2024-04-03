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
