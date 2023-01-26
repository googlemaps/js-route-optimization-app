/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createReducer, on } from '@ngrx/store';
import { RequestSettingsActions } from '../actions';
import {
  IConstraintRelaxation,
  IDuration,
  IInjectedSolution,
  IShipmentRoute,
  ScenarioSearchMode,
  ScenarioSolvingMode,
} from '../models';
import { VehicleActions } from '../actions';

export const requestSettingsFeatureKey = 'requestSettings';

export interface State {
  firstSolutionRoutes: IShipmentRoute[];
  injectedModelConstraint: IInjectedSolution;
  injectedSolution: boolean;
  label: string;
  searchMode: ScenarioSearchMode;
  solvingMode: ScenarioSolvingMode;
  timeout: IDuration;
  timeThreshold: string | number;
  traffic: boolean;
  interpretInjectedSolutionsUsingLabels: boolean;
  populateTransitionPolylines: boolean;
  allowLargeDeadlineDespiteInterruptionRisk: boolean;
  useGeodesicDistances: boolean;
  geodesicMetersPerSecond: number;
}

export const initialState: State = {
  firstSolutionRoutes: [],
  injectedModelConstraint: null,
  injectedSolution: false,
  label: '',
  searchMode: 1,
  solvingMode: 0,
  timeout: null,
  timeThreshold: null,
  traffic: false,
  interpretInjectedSolutionsUsingLabels: false,
  populateTransitionPolylines: false,
  allowLargeDeadlineDespiteInterruptionRisk: false,
  useGeodesicDistances: false,
  geodesicMetersPerSecond: 1,
};

export const reducer = createReducer(
  initialState,
  on(
    RequestSettingsActions.setRequestSettings,
    RequestSettingsActions.setLabel,
    RequestSettingsActions.setSearchMode,
    RequestSettingsActions.setTimeThreshold,
    RequestSettingsActions.setTraffic,
    RequestSettingsActions.setTimeout,
    (state, settings) => {
      const { type: _type, ...requestSettings } = settings;
      return { ...state, ...requestSettings };
    }
  ),
  on(RequestSettingsActions.setInterpretInjectedSolutionsUsingLabels, (state, newState) => ({
    ...state,
    interpretInjectedSolutionsUsingLabels: newState.interpretInjectedSolutionsUsingLabels,
  })),
  on(RequestSettingsActions.setPopulateTransitionPolylines, (state, newState) => ({
    ...state,
    populateTransitionPolylines: newState.populateTransitionPolylines,
  })),
  on(RequestSettingsActions.SetAllowLargeDeadlineDespiteInterruptionRisk, (state, newState) => ({
    ...state,
    allowLargeDeadlineDespiteInterruptionRisk: newState.allowLargeDeadlineDespiteInterruptionRisk,
  })),
  on(RequestSettingsActions.SetUseGeodesicDistances, (state, newState) => ({
    ...state,
    useGeodesicDistances: newState.useGeodesicDistances,
  })),
  on(RequestSettingsActions.setGeodesicMetersPerSecond, (state, newState) => ({
    ...state,
    geodesicMetersPerSecond: newState.geodesicMetersPerSecond,
  })),
  on(RequestSettingsActions.removeGlobalConstraint, (state) => {
    const relaxations = state.injectedModelConstraint.constraintRelaxations;
    const globalIndex = relaxations.findIndex(
      (constraint) => constraint.vehicleIndices.length === 0
    );
    const updatedRelaxations = [...relaxations];
    if (globalIndex >= 0) {
      updatedRelaxations.splice(globalIndex, 1);
    }

    return {
      ...state,
      injectedModelConstraint: {
        skippedShipments: state.injectedModelConstraint?.skippedShipments,
        routes: state.injectedModelConstraint?.routes,
        constraintRelaxations: updatedRelaxations,
      },
    };
  }),
  on(RequestSettingsActions.setGlobalConstraints, (state, { constraints }) => {
    const updatedRelaxations = state.injectedModelConstraint?.constraintRelaxations?.slice() || [];
    const globalIndex = updatedRelaxations.findIndex(
      (constraint) => constraint.vehicleIndices.length === 0
    );

    const newRelaxations: IConstraintRelaxation = {
      relaxations: constraints.map((constraint) => ({
        level: constraint.level,
        thresholdTime: constraint.thresholdTime,
        thresholdVisitCount: constraint.thresholdVisits,
      })),
      vehicleIndices: [],
    };

    if (globalIndex >= 0) {
      updatedRelaxations[globalIndex] = newRelaxations;
    } else {
      updatedRelaxations.push(newRelaxations);
    }

    return {
      ...state,
      injectedModelConstraint: {
        skippedShipments: state.injectedModelConstraint?.skippedShipments,
        routes: state.injectedModelConstraint?.routes,
        constraintRelaxations: updatedRelaxations,
      },
    };
  }),
  on(RequestSettingsActions.upsertGlobalConstraints, (state, { constraints }) => {
    const updatedRelaxations = state.injectedModelConstraint?.constraintRelaxations.slice() || [];
    const globalIndex = updatedRelaxations.findIndex(
      (constraint) => constraint.vehicleIndices.length === 0
    );
    const globalRelaxation = globalIndex >= 0 ? updatedRelaxations[globalIndex] : null;
    const newRelaxations = {
      relaxations: globalRelaxation?.relaxations || [],
      vehicleIndices: [],
    };

    if (globalIndex >= 0) {
      updatedRelaxations[globalIndex] = newRelaxations;
    } else {
      updatedRelaxations.push(newRelaxations);
    }

    constraints.forEach((constraint) => {
      if (constraint.index != null) {
        newRelaxations.relaxations[constraint.index].level = constraint.level;
        newRelaxations.relaxations[constraint.index].thresholdTime = constraint.thresholdTime;
        newRelaxations.relaxations[constraint.index].thresholdVisitCount =
          constraint.thresholdVisits;
      } else {
        newRelaxations.relaxations.push({
          level: constraint.level,
          thresholdTime: constraint.thresholdTime,
          thresholdVisitCount: constraint.thresholdVisits,
        });
      }
    });

    return {
      ...state,
      injectedModelConstraint: {
        skippedShipments: state.injectedModelConstraint?.skippedShipments,
        routes: state.injectedModelConstraint?.routes,
        constraintRelaxations: updatedRelaxations,
      },
    };
  }),
  on(VehicleActions.upsertVehicle, (state, action) => {
    if (!action.timeThresholds || !action.timeThresholds.length) {
      return { ...state };
    }
    const updatedRelaxations = state.injectedModelConstraint?.constraintRelaxations.slice() || [];
    const vehicleIndex = updatedRelaxations.findIndex((constraint) =>
      constraint.vehicleIndices.includes(action.vehicle.id)
    );

    const updatedTimeThresholds = {
      relaxations: [],
      vehicleIndices: [action.vehicle.id],
    };

    action.timeThresholds.forEach((constraint) => {
      updatedTimeThresholds.relaxations.push({
        level: constraint.level,
        thresholdTime: constraint.thresholdTime,
        thresholdVisitCount: constraint.thresholdVisits,
      });
    });

    if (vehicleIndex < 0) {
      updatedRelaxations.push(updatedTimeThresholds);
    } else {
      updatedRelaxations[vehicleIndex] = updatedTimeThresholds;
    }

    return {
      ...state,
      injectedModelConstraint: {
        skippedShipments: state.injectedModelConstraint?.skippedShipments,
        routes: state.injectedModelConstraint?.routes,
        constraintRelaxations: updatedRelaxations,
      },
    };
  }),
  on(
    // Applies one set of time thresholds to a set of vehicles
    VehicleActions.upsertVehicles,
    (state, action) => {
      if (!action.timeThresholds || !action.timeThresholds.length) {
        return { ...state };
      }
      const updatedRelaxations = state.injectedModelConstraint?.constraintRelaxations.slice() || [];

      action.vehicles.forEach((vehicle) => {
        const vehicleIndex = updatedRelaxations.findIndex((constraint) =>
          constraint.vehicleIndices.includes(vehicle.id)
        );

        const updatedTimeThresholds = {
          relaxations: [],
          vehicleIndices: [vehicle.id],
        };

        action.timeThresholds.forEach((constraint) => {
          updatedTimeThresholds.relaxations.push({
            level: constraint.level,
            thresholdTime: constraint.thresholdTime,
            thresholdVisitCount: constraint.thresholdVisits,
          });
        });

        if (vehicleIndex < 0) {
          updatedRelaxations.push(updatedTimeThresholds);
        } else {
          updatedRelaxations[vehicleIndex] = updatedTimeThresholds;
        }
      });

      return {
        ...state,
        injectedModelConstraint: {
          skippedShipments: state.injectedModelConstraint?.skippedShipments,
          routes: state.injectedModelConstraint?.routes,
          constraintRelaxations: updatedRelaxations,
        },
      };
    }
  )
);

export const selectInjectedModelConstraint = (state: State): IInjectedSolution =>
  state.injectedModelConstraint;

export const selectLabel = (state: State): string => state.label;

export const selectInterpretInjectedSolutionsUsingLabels = (state: State): boolean =>
  state.interpretInjectedSolutionsUsingLabels;

export const selectPopulateTransitionPolylines = (state: State): boolean =>
  state.populateTransitionPolylines;

export const selectAllowLargeDeadlineDespiteInterruptionRisk = (state: State): boolean =>
  state.allowLargeDeadlineDespiteInterruptionRisk;

export const selectUseGeodesicDistances = (state: State): boolean => state.useGeodesicDistances;

export const selectGeodesicMetersPerSecond = (state: State): number =>
  state.geodesicMetersPerSecond;

export const selectSearchMode = (state: State): ScenarioSearchMode => state.searchMode;

export const selectSolveMode = (state: State): ScenarioSolvingMode => state.solvingMode;

export const selectInjectedSolution = (state: State): boolean => state.injectedSolution;

export const selectTimeThreshold = (state: State): string | number => state.timeThreshold;

export const selectTraffic = (state: State): boolean => state.traffic;

export const selectTimeout = (state: State): IDuration => state.timeout;
