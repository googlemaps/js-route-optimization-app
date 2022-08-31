/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { Page } from '../models';
import * as fromUI from './ui.selectors';

export const selectActive = createSelector(
  fromUI.selectPage,
  (page) =>
    page === Page.RoutesChart || page === Page.RoutesMetadata || page === Page.ShipmentsMetadata
);

export const selectInactive = createSelector(selectActive, (active) => !active);

export const selectGenerateDisabled = createSelector(selectActive, (_) => false);
