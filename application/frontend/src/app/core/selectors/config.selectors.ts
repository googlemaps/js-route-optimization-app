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
import { SkippedShipmentReasonCode } from '../models/dispatcher.model';
import * as fromConfig from '../reducers/config.reducer';

export const selectConfigState = createFeatureSelector<fromConfig.State>(
  fromConfig.configFeatureKey
);

export const selectConfigLoading = createSelector(selectConfigState, fromConfig.selectLoading);

export const selectConfigLoaded = createSelector(selectConfigState, fromConfig.selectLoaded);

export const selectConfigError = createSelector(selectConfigState, fromConfig.selectError);

export const selectBackendApiConfig = createSelector(
  selectConfigState,
  fromConfig.selectBackendApiConfig
);

export const selectUnitAbbreviations = createSelector(
  selectConfigState,
  fromConfig.selectUnitAbbreviations
);

export const selectMessagesConfig = createSelector(
  selectConfigState,
  fromConfig.selectMessagesConfig
);

export const selectBackendApiRoot = createSelector(
  selectBackendApiConfig,
  (config) => config.apiRoot
);

export const selectMapConfig = createSelector(selectConfigState, fromConfig.selectMapConfig);

export const selectMapApiKey = createSelector(selectConfigState, fromConfig.selectMapApiKey);

export const selectMapOptions = createSelector(selectConfigState, fromConfig.selectMapOptions);

export const selectMapSymbols = createSelector(selectConfigState, fromConfig.selectMapSymbols);

export const selectTimezone = createSelector(selectConfigState, fromConfig.selectTimezone);

export const selectTimezoneOffset = createSelector(selectTimezone, (timezone) => timezone.offset);

export const selectStorageApi = createSelector(selectConfigState, fromConfig.selectStorageApi);

export const selectHasStorageApiRoot = createSelector(
  selectStorageApi,
  (api) => !!(api && api.apiRoot)
);

export const selectAllowUserStorage = createSelector(selectStorageApi, (api) => {
  return String(api?.allowUserStorage).toLowerCase() === 'true';
});

export const selectAllowExperimentalFeatures = createSelector(
  selectConfigState,
  fromConfig.selectAllowExperimentalFeatures
);

const defaultSkippedShipmentReasonsDescriptions = {
  [SkippedShipmentReasonCode.CODE_UNSPECIFIED]: 'Unspecified',
  [SkippedShipmentReasonCode.NO_VEHICLE]: 'No vehicle',
  [SkippedShipmentReasonCode.DEMAND_EXCEEDS_VEHICLE_CAPACITY]: 'Vehicle capacity',
  [SkippedShipmentReasonCode.CANNOT_BE_PERFORMED_WITHIN_VEHICLE_DISTANCE_LIMIT]:
    'Vehicle distance limit',
  [SkippedShipmentReasonCode.CANNOT_BE_PERFORMED_WITHIN_VEHICLE_DURATION_LIMIT]:
    'Vehicle duration limit',
  [SkippedShipmentReasonCode.CANNOT_BE_PERFORMED_WITHIN_VEHICLE_TRAVEL_DURATION_LIMIT]:
    'Vehicle travel duration limit',
  [SkippedShipmentReasonCode.CANNOT_BE_PERFORMED_WITHIN_VEHICLE_TIME_WINDOWS]:
    'Vehicle time window',
  [SkippedShipmentReasonCode.VEHICLE_NOT_ALLOWED]: 'Vehicle not allowed',
};

export const selectSkippedShipmentReasonDescriptions = createSelector(
  selectConfigState,
  (_state) => defaultSkippedShipmentReasonsDescriptions
);
