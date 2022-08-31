/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ShipmentRoute, Visit } from '../models';
import * as fromDispatcherApi from '../reducers/dispatcher-api.reducer';
import DenormalizeSelectors from './denormalize.selectors';
import RequestSettingsSelectors from './request-settings.selectors';

export const selectDispatcherApiState = createFeatureSelector<fromDispatcherApi.State>(
  fromDispatcherApi.dispatcherApiFeatureKey
);

const selectOptimizeToursLoading = createSelector(
  selectDispatcherApiState,
  fromDispatcherApi.selectLoading
);

const selectOptimizeToursLoaded = createSelector(
  selectDispatcherApiState,
  fromDispatcherApi.selectLoaded
);

const selectOptimizeToursError = createSelector(
  selectDispatcherApiState,
  fromDispatcherApi.selectError
);

const selectSolveContext = (shipmentRouteChanges?: ShipmentRoute[], visitChanges?: Visit[]) =>
  createSelector(
    DenormalizeSelectors.selectIsSolutionIllegal,
    DenormalizeSelectors.selectRequestScenario,
    DenormalizeSelectors.selectRequestIncrementalScenario(shipmentRouteChanges, visitChanges),
    RequestSettingsSelectors.selectTimeout,
    RequestSettingsSelectors.selectInjectedSolution,
    (isSolutionIllegal, scenario, incrementalScenario, solveTime, useInjectedSolution) => {
      return {
        scenario: useInjectedSolution && !isSolutionIllegal ? incrementalScenario : scenario,
      };
    }
  );

export const DispatcherApiSelectors = {
  selectOptimizeToursLoading,
  selectOptimizeToursLoaded,
  selectOptimizeToursError,
  selectSolveContext,
};

export default DispatcherApiSelectors;
