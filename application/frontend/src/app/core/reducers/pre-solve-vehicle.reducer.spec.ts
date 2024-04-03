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

import { reducer, initialState } from './pre-solve-vehicle.reducer';
import { DispatcherActions, VehicleActions } from '../actions';
import { StringFilterOperation } from '../../shared/models';
import * as PreSolveVehicleActions from '../actions/pre-solve-vehicle.actions';

describe('PreSolveVehicle Reducer', () => {
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

    it('should update the state - PreSolveVehicleActions.changePage', () => {
      const newState = {
        pageIndex: 1,
        pageSize: 2,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleActions.changePage({ pageIndex: 1, pageSize: 2 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicle in state - PreSolveVehicleActions.selectVehicle', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleActions.selectVehicle({ vehicleId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicles in state - PreSolveVehicleActions.selectVehicles', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        requested: [],
        displayColumns: null,
      };
      const action = PreSolveVehicleActions.selectVehicles({ vehicleIds: [1, 7] });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected Vehicles in state - PreSolveVehicleActions.deselectVehicle', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleActions.deselectVehicle({ vehicleId: 7 });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - PreSolveVehicleActions.deselectVehicles', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleActions.deselectVehicles({ vehicleIds: [1, 7] });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected Vehicles in state - VehicleActions.deleteVehicle', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        requested: [],
        displayColumns: null,
      };

      const action = VehicleActions.deleteVehicle({ id: 7 });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - VehicleActions.deleteVehicles', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
        displayColumns: null,
      };

      const action = VehicleActions.deleteVehicles({ ids: [1, 7] });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - PreSolveVehicleActions.updateVehiclesSelection', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [2],
        requested: [],
        displayColumns: null,
      };

      const action = PreSolveVehicleActions.updateVehiclesSelection({
        addedVehicleIds: [2],
        removedVehicleIds: [1, 7],
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - DispatcherActions.loadScenario', () => {
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
        selectedVehicles: [1, 7],
        selectedVehicleOperators: [],
        changeTime: 1,
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - PreSolveVehicleActions.addFilter', () => {
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

      const action = PreSolveVehicleActions.addFilter({
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

    it('should update the selected vehicles in state - PreSolveVehicleActions.editFilter', () => {
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

      const action = PreSolveVehicleActions.editFilter({
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

    it('should update the selected vehicles in state - PreSolveVehicleActions.removeFilter', () => {
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

      const action = PreSolveVehicleActions.removeFilter({
        filter: {
          id: 'id',
          label: 'ID = 3',
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - PreSolveVehicleActions.changeSort', () => {
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

      const action = PreSolveVehicleActions.changeSort({ active: 'id', direction: 'asc' });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected vehicles in state - PreSolveVehicleActions.changeDisplayColumns', () => {
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
          'capacities.0': true,
          'capacities.1': true,
          fixedCost: false,
          costPerHour: true,
          costPerKilometer: true,
          routeDistanceLimit: true,
          routeDurationLimit: true,
          travelDurationLimit: true,
          menu: true,
        },
      };
      const action = PreSolveVehicleActions.changeDisplayColumns({
        displayColumns: {
          select: true,
          id: true,
          label: true,
          'capacities.0': true,
          'capacities.1': true,
          fixedCost: false,
          costPerHour: true,
          costPerKilometer: true,
          routeDistanceLimit: true,
          routeDurationLimit: true,
          travelDurationLimit: true,
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
        requested: [1, 2, 3, 4, 5],
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
        requestedVehicleIds: [1, 2, 3, 4, 5],
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
