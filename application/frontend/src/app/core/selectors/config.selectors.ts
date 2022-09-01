/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
