/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createSelector } from '@ngrx/store';
import { IInjectedSolution, IOptimizeToursRequest, IOptimizeToursResponse } from '../models';
import DenormalizeSelectors from './denormalize.selectors';
import * as fromUI from './ui.selectors';
import RequestSettingsSelectors from './request-settings.selectors';

export const selectHasDownload = createSelector(fromUI.selectStarted, (started) => started);

export const selectDownload = createSelector(
  DenormalizeSelectors.selectRequestScenario,
  DenormalizeSelectors.selectDenormalizedSolution(),
  RequestSettingsSelectors.selectInjectedSolution,
  DenormalizeSelectors.selectRequestIncrementalScenario(),
  (
    scenario,
    solution,
    usingInjectedSolution,
    incrementalScenario
  ): {
    injectedSolution?: IInjectedSolution;
    scenario: IOptimizeToursRequest;
    solution?: IOptimizeToursResponse;
  } => {
    return {
      scenario: usingInjectedSolution && incrementalScenario ? incrementalScenario : scenario,
      solution,
    };
  }
);
