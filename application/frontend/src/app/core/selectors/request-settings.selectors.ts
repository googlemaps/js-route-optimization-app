/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
