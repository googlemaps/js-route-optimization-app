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

import { reducer, initialState } from './pre-solve-shipment.reducer';
import {
  DispatcherActions,
  MapActions,
  PreSolveShipmentActions,
  ShipmentActions,
  ShipmentsMetadataActions,
  ValidationResultActions,
} from '../actions';
import { StringFilterOperation } from '../../shared/models';

describe('PreSolveShipment Reducer', () => {
  const selectedColorMap = new Map<number, number>([]);
  let prevState;
  beforeEach(() => {
    selectedColorMap.set(1, 0);
    selectedColorMap.set(7, 1);
    prevState = {
      pageIndex: 0,
      pageSize: 25,
      sort: { active: null, direction: null },
      filters: [],
      selected: [1, 7],
      selectedColors: Array.from(selectedColorMap.entries()),
      requested: [],
      displayColumns: null,
      editShipmentId: null,
    };
  });

  describe('an unknown action', () => {
    it('should return the previous state', () => {
      const action = {} as any;
      const result = reducer(initialState, action);
      expect(result).toBe(initialState);
    });

    it('should update the state in an immutable way - PreSolveShipmentActions.changePage', () => {
      const newState = {
        pageIndex: 1,
        pageSize: 2,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.changePage({ pageIndex: 1, pageSize: 2 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected and selectedColors in state - PreSolveShipmentActions.selectShipment', () => {
      const selectedColorMap = new Map<number, number>([]);
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        selectedColors: Array.from(selectedColorMap.set(1, 0).entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.selectShipment({ shipmentId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected shipments and selectedColors in state - PreSolveShipmentActions.selectShipments', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.selectShipments({ shipmentIds: [1, 7] });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.deselectShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.deselectShipment({ shipmentId: 7 });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.deselectShipments', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.deselectShipments({ shipmentIds: [1, 7] });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - ShipmentActions.deleteShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = ShipmentActions.deleteShipment({ id: 7 });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - ShipmentActions.deleteShipments', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = ShipmentActions.deleteShipments({ ids: [1, 7] });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.updateShipmentsSelection', () => {
      const selectedColorMap = new Map<number, number>([]);
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [2],
        selectedColors: Array.from(selectedColorMap.set(2, 0).entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.updateShipmentsSelection({
        addedShipmentIds: [2],
        removedShipmentIds: [1, 7],
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - DispatcherActions.loadScenario', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = DispatcherActions.loadScenario({
        shipments: [],
        vehicles: [],
        visitRequests: [],
        selectedShipments: [1, 7],
        selectedVehicles: [],
        changeTime: 1,
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.addFilter', () => {
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
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.addFilter({
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

    it('should update the selected shipments in state - PreSolveShipmentActions.editFilter', () => {
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
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
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
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.editFilter({
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

    it('should update the selected shipments in state - PreSolveShipmentActions.removeFilter', () => {
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
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [1, 7],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.removeFilter({
        filter: {
          id: 'id',
          label: 'ID = 3',
        },
      });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.changeSort', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: 'id', direction: '' },
        filters: [],
        selected: [1, 7],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: 'id', direction: 'asc' },
        filters: [],
        selected: [1, 7],
        selectedColors: Array.from(selectedColorMap.entries()),
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };

      const action = PreSolveShipmentActions.changeSort({ active: 'id', direction: 'asc' });
      const state = reducer(prevState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(prevState);
    });

    it('should update the selected shipments in state - PreSolveShipmentActions.changeDisplayColumns', () => {
      const prevState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: {
          select: true,
          id: true,
          label: true,
          type: true,
          'visitRequest.label': true,
          'visitRequest.pickup': false,
          'visitRequest.timeWindow': true,
          'visitRequest.softTimeWindow': true,
          'visitRequest.duration': true,
          'visitRequest.cost': true,
          'shipment.demands.0': true,
          'shipment.demands.1': true,
          menu: true,
        },
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.changeDisplayColumns({
        displayColumns: {
          select: true,
          id: true,
          label: true,
          type: true,
          'visitRequest.label': true,
          'visitRequest.pickup': false,
          'visitRequest.timeWindow': true,
          'visitRequest.softTimeWindow': true,
          'visitRequest.duration': true,
          'visitRequest.cost': true,
          'shipment.demands.0': true,
          'shipment.demands.1': true,
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
        selectedColors: [],
        requested: [1, 2, 3, 4, 5],
        displayColumns: null,
        editShipmentId: null,
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
        requestedShipmentIds: [1, 2, 3, 4, 5],
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

    it('should update the state - MapActions.editPreSolveShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: 1,
      };
      const action = MapActions.editPreSolveShipment({ shipmentId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - PreSolveShipmentActions.editShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: 1,
      };
      const action = PreSolveShipmentActions.editShipment({ shipmentId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - ShipmentsMetadataActions.editShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: 1,
      };
      const action = ShipmentsMetadataActions.editShipment({ shipmentId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - ValidationResultActions.editPreSolveShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: 1,
      };
      const action = ValidationResultActions.editPreSolveShipment({ shipmentId: 1 });
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - PreSolveShipmentActions.cancelEditShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.cancelEditShipment();
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });

    it('should update the state - PreSolveShipmentActions.saveShipment', () => {
      const newState = {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = PreSolveShipmentActions.saveShipment({
        changes: {
          shipment: {
            upsert: [],
          },
          visitRequest: {
            upsert: [],
            delete: [],
          },
        },
        changeTime: 2,
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
        selectedColors: [],
        requested: [],
        displayColumns: null,
        editShipmentId: null,
      };
      const action = DispatcherActions.clearSolution();
      const state = reducer(initialState, action);
      expect(state).toEqual(newState);
      expect(state).not.toBe(initialState);
    });
  });
});
