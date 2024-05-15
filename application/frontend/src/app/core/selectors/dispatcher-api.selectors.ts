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
