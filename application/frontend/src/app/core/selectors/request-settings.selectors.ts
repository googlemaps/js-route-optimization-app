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

import * as fromRequestSettings from '../reducers/request-settings.reducer';
import { createFeatureSelector, createSelector } from '@ngrx/store';

export const selectRequestSettingsState = createFeatureSelector<fromRequestSettings.State>(
  fromRequestSettings.requestSettingsFeatureKey
);

const selectLabel = createSelector(selectRequestSettingsState, fromRequestSettings.selectLabel);

const selectInterpretInjectedSolutionsUsingLabels = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectInterpretInjectedSolutionsUsingLabels
);

const selectPopulateTransitionPolylines = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectPopulateTransitionPolylines
);

const selectAllowLargeDeadlineDespiteInterruptionRisk = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectAllowLargeDeadlineDespiteInterruptionRisk
);

const selectUseGeodesicDistances = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectUseGeodesicDistances
);

const selectGeodesicMetersPerSecond = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectGeodesicMetersPerSecond
);
const selectSearchMode = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectSearchMode
);
const selectSolveMode = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectSolveMode
);

const selectInjectedSolution = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectInjectedSolution
);

const selectInjectedModelConstraint = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectInjectedModelConstraint
);

const selectConstraintRelaxations = createSelector(
  selectInjectedModelConstraint,
  (model) => model?.constraintRelaxations || []
);

const selectGlobalConstraintRelaxations = createSelector(
  selectConstraintRelaxations,
  (constraints) => {
    const filtered = constraints.filter((constraint) => constraint.vehicleIndices?.length === 0);
    return filtered.length ? filtered[0] : null;
  }
);

const selectConstraintRelaxationsForVehicle = (params: any) =>
  createSelector(selectConstraintRelaxations, (constraints) => {
    const filtered = constraints.filter((constraint) =>
      constraint.vehicleIndices?.includes(params.id)
    );
    return filtered.length ? filtered[0] : null;
  });

const selectGlobalAndVehicleConstraintRelaxationsForVehicle = (params: any) =>
  createSelector(selectInjectedSolution, selectConstraintRelaxations, (injected, constraints) => {
    return injected
      ? constraints.filter(
          (constraint) =>
            constraint.vehicleIndices?.includes(params.id) ||
            constraint.vehicleIndices?.length === 0
        )
      : [];
  });

const selectTimeThreshold = createSelector(
  selectRequestSettingsState,
  fromRequestSettings.selectTimeThreshold
);

const selectTraffic = createSelector(selectRequestSettingsState, fromRequestSettings.selectTraffic);

const selectTimeout = createSelector(selectRequestSettingsState, fromRequestSettings.selectTimeout);

export const RequestSettingsSelectors = {
  selectTimeout,
  selectTraffic,
  selectTimeThreshold,
  selectGlobalAndVehicleConstraintRelaxationsForVehicle,
  selectConstraintRelaxationsForVehicle,
  selectGlobalConstraintRelaxations,
  selectConstraintRelaxations,
  selectInjectedModelConstraint,
  selectInjectedSolution,
  selectSearchMode,
  selectSolveMode,
  selectInterpretInjectedSolutionsUsingLabels,
  selectPopulateTransitionPolylines,
  selectAllowLargeDeadlineDespiteInterruptionRisk,
  selectUseGeodesicDistances,
  selectLabel,
  selectGeodesicMetersPerSecond,
};

export default RequestSettingsSelectors;
