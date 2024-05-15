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

export const selectOpenUploadDialogOnClose = createSelector(
  selectUIState,
  fromUI.selectOpenUploadDialogOnClose
);
