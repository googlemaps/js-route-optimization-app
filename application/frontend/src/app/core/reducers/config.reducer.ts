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

import { Config } from '../models/config';
import { createReducer, on } from '@ngrx/store';
import { ConfigActions } from '../actions';
import { MapConfig, MessagesConfig, SymbolConfig } from '../models';
import { Timezone } from 'src/app/shared/models';

export const configFeatureKey = 'config';

export interface State extends Config {
  loaded: boolean;
  loading: boolean;
  error: any;
}

export const initialState: State = {
  backendApi: null,
  unitAbbreviations: null,
  map: null,
  loading: false,
  loaded: false,
  error: null,
  messages: null,
  storageApi: null,
  timezone: {
    description: 'UTC',
    offset: 0,
    label: '\u00b10:00',
  },
  allowExperimentalFeatures: false,
};

export const reducer = createReducer(
  initialState,
  on(ConfigActions.loadConfig, (state) => ({ ...state, loading: true })),
  on(ConfigActions.loadConfigSuccess, (state, { config }) => ({
    ...state,
    ...config,
    loaded: true,
    loading: false,
    error: null,
  })),
  on(ConfigActions.loadConfigFailure, (state, { error }) => ({ ...state, error, loading: false })),
  on(ConfigActions.setTimezone, (state, action) => ({ ...state, timezone: action.newTimezone }))
);

export const selectBackendApiConfig = (state: State): { apiRoot: string } => state.backendApi;

export const selectMapConfig = (state: State): MapConfig => state.map;

export const selectMapApiKey = (state: State): string => state.map && state.map.apiKey;

export const selectMapOptions = (state: State): google.maps.MapOptions =>
  state.map && state.map.options;

export const selectMapSymbols = (state: State): SymbolConfig => state.map && state.map.symbols;

export const selectLoaded = (state: State): boolean => state.loaded;

export const selectLoading = (state: State): boolean => state.loading;

export const selectError = (state: State): any => state.error;

export const selectUnitAbbreviations = (state: State): { [unit: string]: string } =>
  state.unitAbbreviations;

export const selectMessagesConfig = (state: State): MessagesConfig => state.messages;

export const selectTimezone = (state: State): Timezone => state.timezone;

export const selectStorageApi = (state: State): { apiRoot: string; allowUserStorage: boolean } =>
  state.storageApi;

export const selectAllowExperimentalFeatures = (state: State): boolean =>
  state.allowExperimentalFeatures;
