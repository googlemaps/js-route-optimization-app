/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import * as fromMapApi from '../reducers/map-api.reducer';

export const selectMapApiState = createFeatureSelector<fromMapApi.State>(
  fromMapApi.mapApiFeatureKey
);

export const selectScriptLoading = createSelector(
  selectMapApiState,
  fromMapApi.selectScriptLoading
);

export const selectScriptLoaded = createSelector(selectMapApiState, fromMapApi.selectScriptLoaded);

export const selectScriptError = createSelector(selectMapApiState, fromMapApi.selectScriptError);
