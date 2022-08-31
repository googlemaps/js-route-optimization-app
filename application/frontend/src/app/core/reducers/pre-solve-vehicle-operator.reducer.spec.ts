/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { reducer, initialState } from './pre-solve-vehicle-operator.reducer';
import {
  DispatcherActions,
  PreSolveVehicleOperatorActions,
  VehicleOperatorActions,
} from '../actions';
import { StringFilterOperation } from '../../shared/models';

describe('PreSolveVehicleOperator Reducer', () => {
  let prevState;
  beforeEach(() => {
    prevState = {
      pageIndex: 0,
      pageSize: 25,
      sort: { active: null, direction: null },
      filters: [],
      selected: [1, 7],
      requested: [],
      displayColumns: null,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });

    it('should update the state - PreSolveVehicleOperatorActions.changePage', () => {
      const newState = {
        pageIndex: 1,
        pageSize: 2,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleOperatorActions.changePage({ pageIndex: 1, pageSize: 2 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicle Operators in state - PreSolveVehicleOperatorActions.selectVehicleOperator', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleOperatorActions.selectVehicleOperator({ vehicleOperatorId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicle Operators in state - PreSolveVehicleOperatorActions.selectVehicleOperators', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleOperatorActions.selectVehicleOperators({
        vehicleOperatorIds: [1, 7],
      });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicle Operators in state - PreSolveVehicleOperatorActions.deselectVehicleOperator', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.deselectVehicleOperator({
        vehicleOperatorId: 7,
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.deselectVehicleOperators', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.deselectVehicleOperators({
        vehicleOperatorIds: [1, 7],
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected Vehicle Operators in state - VehicleOperatorActions.deleteVehicleOperator', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };

      const action = VehicleOperatorActions.deleteVehicleOperator({ id: 7 });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - VehicleOperatorActions.deleteVehicleOperators', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };

      const action = VehicleOperatorActions.deleteVehicleOperators({ ids: [1, 7] });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.updateVehicleOperatorsSelection', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [2],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.updateVehicleOperatorsSelection({
        addedVehicleOperatorIds: [2],
        removedVehicleOperatorIds: [1, 7],
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - DispatcherActions.loadScenario', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const action = DispatcherActions.loadScenario({
        shipments: [],
        vehicles: [],
        vehicleOperators: [],
        visitRequests: [],
        selectedShipments: [],
        selectedVehicles: [],
        selectedVehicleOperators: [1, 7],
        changeTime: 1,
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.addFilter', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [
          {
            id: 'id',
            label: 'ID = 2',
            params: {
              operation: StringFilterOperation.Is,
              value: '2',
            },
          },
        ],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.addFilter({
        filter: {
          id: 'id',
          label: 'ID = 2',
          params: {
            operation: StringFilterOperation.Is,
            value: '2',
          },
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.editFilter', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [
          {
            id: 'id',
            label: 'ID = 3',
            params: {
              operation: StringFilterOperation.Is,
              value: '3',
            },
          },
        ],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [
          {
            id: 'id',
            label: 'ID = 3',
            params: {
              operation: StringFilterOperation.Is,
              value: '3',
            },
          },
        ],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.editFilter({
        currentFilter: {
          id: 'id',
          label: 'ID = 3',
          params: {
            operation: StringFilterOperation.Is,
            value: '3',
          },
        },
        previousFilter: {
          id: 'id',
          label: 'ID = 2',
          params: {
            operation: StringFilterOperation.Is,
            value: '2',
          },
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.removeFilter', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [
          {
            id: 'id',
            label: 'ID = 3',
          },
        ],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.removeFilter({
        filter: {
          id: 'id',
          label: 'ID = 3',
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.changeSort', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: 'id', direction: '' },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: 'id', direction: 'asc' },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleOperatorActions.changeSort({ active: 'id', direction: 'asc' });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicle Operators in state - PreSolveVehicleOperatorActions.changeDisplayColumns', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: {
          select: true,
          id: true,
          label: true,
          type: false,
          startTimeWindow: true,
          endTimeWindow: true,
          menu: true,
        },
      };
      const action = PreSolveVehicleOperatorActions.changeDisplayColumns({
        displayColumns: {
          select: true,
          id: true,
          label: true,
          type: false,
          startTimeWindow: true,
          endTimeWindow: true,
          menu: true,
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should return the previous state - uploadScenarioSuccess', () => {
      const action = DispatcherActions.uploadScenarioSuccess({ scenario: {} });
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });

    it('should update the state - DispatcherActions.loadSolution', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };
      const action = DispatcherActions.loadSolution({
        elapsedSolution: {
          scenario: {},
          solution: {},
          elapsedTime: 1,
          requestTime: 2,
          timeOfResponse: 3,
          batchTime: 4,
        },
        requestedShipmentIds: [],
        requestedVehicleIds: [],
        shipmentRoutes: [],
        visits: [],
        skippedShipments: [],
        skippedShipmentReasons: {},
      });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - DispatcherActions.clearSolution', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };
      const action = DispatcherActions.clearSolution();
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });
});
