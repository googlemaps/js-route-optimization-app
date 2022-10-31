import { RequestSettingsActions, VehicleActions } from '../actions';
import { RelaxationLevel } from '../models';
import {
  reducer,
  initialState,
  selectInjectedModelConstraint,
  selectAllowLargeDeadlineDespiteInterruptionRisk,
  selectGeodesicMetersPerSecond,
  selectInjectedSolution,
  selectInterpretInjectedSolutionsUsingLabels,
  selectLabel,
  selectPopulateTransitionPolylines,
  selectSearchMode,
  selectSolveMode,
  selectTimeout,
  selectTimeThreshold,
  selectTraffic,
  selectUseGeodesicDistances,
} from './request-settings.reducer';

describe('RequestSettings Reducer', () => {
  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });
  });
  it('on RequestSettings setters', () => {
    let state = reducer(initialState, RequestSettingsActions.setLabel({ label: 'Test' }));
    expect(state.label).toBe('Test');
    state = reducer(state, RequestSettingsActions.setSearchMode({ searchMode: 2 }));
    expect(state.searchMode).toBe(2);
    state = reducer(state, RequestSettingsActions.setTimeThreshold({ timeThreshold: 1234 }));
    expect(state.timeThreshold).toBe(1234);
    state = reducer(state, RequestSettingsActions.setTraffic({ traffic: true }));
    expect(state.traffic).toBe(true);
    state = reducer(state, RequestSettingsActions.setTraffic({ traffic: false }));
    expect(state.traffic).toBe(false);
    state = reducer(state, RequestSettingsActions.setTimeout({ timeout: { seconds: 456 } }));
    expect(state.timeout).toEqual({ seconds: 456 });
    state = reducer(state, RequestSettingsActions.setTimeout({ timeout: { seconds: 123 } }));
    expect(state.timeout).toEqual({ seconds: 123 });
    state = reducer(
      state,
      RequestSettingsActions.setRequestSettings({ timeout: { seconds: 789 }, label: 'Test2' })
    );
    expect(state.timeout).toEqual({ seconds: 789 });
    expect(state.label).toBe('Test2');
  });

  it('on setInterpretInjectedSolutionsUsingLabels', () => {
    let newState = reducer(
      initialState,
      RequestSettingsActions.setInterpretInjectedSolutionsUsingLabels({
        interpretInjectedSolutionsUsingLabels: true,
      })
    );
    expect(newState.interpretInjectedSolutionsUsingLabels).toBe(true);
    newState = reducer(
      initialState,
      RequestSettingsActions.setInterpretInjectedSolutionsUsingLabels({
        interpretInjectedSolutionsUsingLabels: false,
      })
    );
    expect(newState.interpretInjectedSolutionsUsingLabels).toBe(false);
  });

  it('on setPopulateTransitionPolylines', () => {
    let newState = reducer(
      initialState,
      RequestSettingsActions.setPopulateTransitionPolylines({ populateTransitionPolylines: true })
    );
    expect(newState.populateTransitionPolylines).toBe(true);
    newState = reducer(
      initialState,
      RequestSettingsActions.setPopulateTransitionPolylines({ populateTransitionPolylines: false })
    );
    expect(newState.populateTransitionPolylines).toBe(false);
  });

  it('on SetAllowLargeDeadlineDespiteInterruptionRisk', () => {
    let newState = reducer(
      initialState,
      RequestSettingsActions.SetAllowLargeDeadlineDespiteInterruptionRisk({
        allowLargeDeadlineDespiteInterruptionRisk: true,
      })
    );
    expect(newState.allowLargeDeadlineDespiteInterruptionRisk).toBe(true);
    newState = reducer(
      initialState,
      RequestSettingsActions.SetAllowLargeDeadlineDespiteInterruptionRisk({
        allowLargeDeadlineDespiteInterruptionRisk: false,
      })
    );
    expect(newState.allowLargeDeadlineDespiteInterruptionRisk).toBe(false);
  });

  it('on SetUseGeodesicDistances', () => {
    let newState = reducer(
      initialState,
      RequestSettingsActions.SetUseGeodesicDistances({ useGeodesicDistances: true })
    );
    expect(newState.useGeodesicDistances).toBe(true);
    newState = reducer(
      initialState,
      RequestSettingsActions.SetUseGeodesicDistances({ useGeodesicDistances: false })
    );
    expect(newState.useGeodesicDistances).toBe(false);
  });

  it('on setGeodesicMetersPerSecond', () => {
    const newState = reducer(
      initialState,
      RequestSettingsActions.setGeodesicMetersPerSecond({ geodesicMetersPerSecond: 12 })
    );
    expect(newState.geodesicMetersPerSecond).toBe(12);
  });
  it('on removeGlobalConstraint empty indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const newState = reducer(state, RequestSettingsActions.removeGlobalConstraint({ index: 0 }));
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(1);
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toEqual(
      state.injectedModelConstraint.constraintRelaxations
    );
  });

  it('on removeGlobalConstraint not empty vehicle indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [3, 4] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const newState = reducer(state, RequestSettingsActions.removeGlobalConstraint({ index: 0 }));
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    expect(newState.injectedModelConstraint.constraintRelaxations).toEqual(
      state.injectedModelConstraint.constraintRelaxations
    );
  });

  it('on setGlobalConstraints not empty vehicle indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [3, 4] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const constraint = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      state,
      RequestSettingsActions.setGlobalConstraints({ constraints: [constraint] })
    );
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toBe(
      state.injectedModelConstraint.constraintRelaxations
    );
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(3);
    expect(newState.injectedModelConstraint.constraintRelaxations[2]).not.toBe({
      relaxations: [constraint],
      vehicleIndices: [],
    });
  });
  it('on setGlobalConstraints with empty vehicle indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const constraint = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      state,
      RequestSettingsActions.setGlobalConstraints({ constraints: [constraint] })
    );
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toBe(
      state.injectedModelConstraint.constraintRelaxations
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).not.toBe({
      relaxations: [constraint],
      vehicleIndices: [],
    });
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
  });
  it('on upsertGlobalConstraints not empty vehicle indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [3, 4] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const constraint = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      state,
      RequestSettingsActions.upsertGlobalConstraints({ constraints: [constraint] })
    );
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toBe(
      state.injectedModelConstraint.constraintRelaxations
    );
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(3);
    expect(newState.injectedModelConstraint.constraintRelaxations[2]).not.toBe({
      relaxations: [constraint],
      vehicleIndices: [],
    });
  });
  it('on upsertGlobalConstraints with empty vehicle indices', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [] },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const constraint = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      state,
      RequestSettingsActions.upsertGlobalConstraints({ constraints: [constraint] })
    );
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toBe(
      state.injectedModelConstraint.constraintRelaxations
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).not.toBe({
      relaxations: [constraint],
      vehicleIndices: [],
    });
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
  });
  it('on upsertGlobalConstraints with empty vehicle indices and index', () => {
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          {
            relaxations: [
              {
                index: 0,
                level: RelaxationLevel.RELAX_ALL_AFTER_THRESHOLD,
                thresholdTime: { seconds: 10, nanos: 10 },
                thresholdVisits: 0,
                thresholdVisitCount: 23,
              },
            ],
            vehicleIndices: [],
          },
        ],
      },
    };
    expect(state.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    const constraint = {
      index: 0,
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
      thresholdVisitCount: 0,
    };
    const newState = reducer(
      state,
      RequestSettingsActions.upsertGlobalConstraints({ constraints: [constraint] })
    );
    expect(newState.injectedModelConstraint.constraintRelaxations).not.toBe(
      state.injectedModelConstraint.constraintRelaxations
    );
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    expect(newState.injectedModelConstraint.constraintRelaxations[1].relaxations[0]).toEqual(
      constraint
    );
  });
  it('on upsertVehicle null timeThreshold', () => {
    const newState = reducer(initialState, VehicleActions.upsertVehicle({ vehicle: { id: 12 } }));
    expect(newState).toEqual(initialState);
  });
  it('on upsertVehicle empty timeThreshold', () => {
    const newState = reducer(
      initialState,
      VehicleActions.upsertVehicle({ timeThresholds: [], vehicle: { id: 12 } })
    );
    expect(newState).toEqual(initialState);
  });
  it('on upsertVehicle not null timeThreshold null constraintRelaxations', () => {
    const timeThreshold = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      initialState,
      VehicleActions.upsertVehicle({ timeThresholds: [timeThreshold], vehicle: { id: 12 } })
    );
    expect(newState.injectedModelConstraint).not.toEqual(initialState.injectedModelConstraint);
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(1);
    expect(newState.injectedModelConstraint.constraintRelaxations).toEqual([
      {
        relaxations: [
          {
            level: RelaxationLevel.LEVEL_UNSPECIFIED,
            thresholdTime: { seconds: 0, nanos: 0 },
            thresholdVisitCount: 0,
          },
        ],
        vehicleIndices: [12],
      },
    ]);
  });
  it('on upsertVehicle not null timeThreshold not null constraintRelaxations', () => {
    const timeThreshold = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [12] },
        ],
      },
    };
    const newState = reducer(
      state,
      VehicleActions.upsertVehicle({ timeThresholds: [timeThreshold], vehicle: { id: 12 } })
    );
    expect(newState.injectedModelConstraint).not.toEqual(state.injectedModelConstraint);
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    expect(newState.injectedModelConstraint.constraintRelaxations[0]).toEqual(
      state.injectedModelConstraint.constraintRelaxations[0]
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).not.toEqual(
      state.injectedModelConstraint.constraintRelaxations[1]
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).toEqual({
      relaxations: [
        {
          level: RelaxationLevel.LEVEL_UNSPECIFIED,
          thresholdTime: { seconds: 0, nanos: 0 },
          thresholdVisitCount: 0,
        },
      ],
      vehicleIndices: [12],
    });
  });
  it('on upsertVehicles null timeThreshold', () => {
    const newState = reducer(
      initialState,
      VehicleActions.upsertVehicles({ changeTime: 10, vehicles: [{ id: 12 }] })
    );
    expect(newState).toEqual(initialState);
  });
  it('on upsertVehicles empty timeThreshold', () => {
    const newState = reducer(
      initialState,
      VehicleActions.upsertVehicles({ changeTime: 10, vehicles: [{ id: 12 }] })
    );
    expect(newState).toEqual(initialState);
  });
  it('on upsertVehicles not null timeThreshold null constraintRelaxations', () => {
    const timeThreshold = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const newState = reducer(
      initialState,
      VehicleActions.upsertVehicles({
        changeTime: 10,
        timeThresholds: [timeThreshold],
        vehicles: [{ id: 12 }],
      })
    );
    expect(newState.injectedModelConstraint).not.toEqual(initialState.injectedModelConstraint);
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(1);
    expect(newState.injectedModelConstraint.constraintRelaxations).toEqual([
      {
        relaxations: [
          {
            level: RelaxationLevel.LEVEL_UNSPECIFIED,
            thresholdTime: { seconds: 0, nanos: 0 },
            thresholdVisitCount: 0,
          },
        ],
        vehicleIndices: [12],
      },
    ]);
  });
  it('on upsertVehicles not null timeThreshold not null constraintRelaxations', () => {
    const timeThreshold = {
      level: RelaxationLevel.LEVEL_UNSPECIFIED,
      thresholdTime: { seconds: 0, nanos: 0 },
      thresholdVisits: 0,
    };
    const state = {
      ...initialState,
      injectedModelConstraint: {
        constraintRelaxations: [
          { relaxations: [], vehicleIndices: [1, 2] },
          { relaxations: [], vehicleIndices: [12] },
        ],
      },
    };
    const newState = reducer(
      state,
      VehicleActions.upsertVehicles({
        changeTime: 10,
        timeThresholds: [timeThreshold],
        vehicles: [{ id: 12 }],
      })
    );
    expect(newState.injectedModelConstraint).not.toEqual(state.injectedModelConstraint);
    expect(newState.injectedModelConstraint.constraintRelaxations.length).toBe(2);
    expect(newState.injectedModelConstraint.constraintRelaxations[0]).toEqual(
      state.injectedModelConstraint.constraintRelaxations[0]
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).not.toEqual(
      state.injectedModelConstraint.constraintRelaxations[1]
    );
    expect(newState.injectedModelConstraint.constraintRelaxations[1]).toEqual({
      relaxations: [
        {
          level: RelaxationLevel.LEVEL_UNSPECIFIED,
          thresholdTime: { seconds: 0, nanos: 0 },
          thresholdVisitCount: 0,
        },
      ],
      vehicleIndices: [12],
    });
  });

  it('validate request-settings selectors', () => {
    expect(selectInjectedModelConstraint(initialState)).toEqual(
      initialState.injectedModelConstraint
    );
    expect(selectLabel(initialState)).toEqual(initialState.label);
    expect(selectInterpretInjectedSolutionsUsingLabels(initialState)).toEqual(
      initialState.interpretInjectedSolutionsUsingLabels
    );
    expect(selectPopulateTransitionPolylines(initialState)).toEqual(
      initialState.populateTransitionPolylines
    );
    expect(selectAllowLargeDeadlineDespiteInterruptionRisk(initialState)).toEqual(
      initialState.allowLargeDeadlineDespiteInterruptionRisk
    );
    expect(selectUseGeodesicDistances(initialState)).toEqual(initialState.useGeodesicDistances);
    expect(selectGeodesicMetersPerSecond(initialState)).toEqual(
      initialState.geodesicMetersPerSecond
    );
    expect(selectSearchMode(initialState)).toEqual(initialState.searchMode);
    expect(selectSolveMode(initialState)).toEqual(initialState.solvingMode);
    expect(selectInjectedSolution(initialState)).toEqual(initialState.injectedSolution);
    expect(selectTimeThreshold(initialState)).toEqual(initialState.timeThreshold);
    expect(selectTraffic(initialState)).toEqual(initialState.traffic);
    expect(selectTimeout(initialState)).toEqual(initialState.timeout);
  });
});
