/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { Page } from '../models';
import * as fromUI from '../reducers/ui.reducer';

export const selectUIState = createFeatureSelector<fromUI.State>(fromUI.uiFeatureKey);

export const selectModal = createSelector(selectUIState, fromUI.selectModal);

export const selectPage = createSelector(selectUIState, fromUI.selectPage);

export const selectHasMap = createSelector(selectUIState, fromUI.selectHasMap);

export const selectClickedVehicleId = createSelector(selectUIState, fromUI.selectClickedVehicleId);

export const selectClickedVisitRequestId = createSelector(
  selectUIState,
  fromUI.selectClickedVisitRequestId
);

export const selectSplitSizes = createSelector(selectUIState, fromUI.selectSplitSizes);

export const selectStarted = createSelector(
  selectPage,
  (page) => page != null && page !== Page.Welcome
);

export const selectMouseOverId = createSelector(selectUIState, fromUI.selectMouseOverId);
