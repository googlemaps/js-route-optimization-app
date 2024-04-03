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

import { Dictionary } from '@ngrx/entity';
import { ShipmentRoute, Visit } from '../models';
import * as fromEditVisit from '../reducers/edit-visit.reducer';
import { selectEditVisitState, selectVisitShipmentRouteChanges } from './edit-visit.selectors';

describe('EditVisit Selectors', () => {
  it('should select the feature state', () => {
    const result = selectEditVisitState({
      [fromEditVisit.editVisitFeatureKey]: {
        visitId: null,
        savePending: false,
        saveChanges: null,
        saveError: null,
      },
    });

    expect(result).toEqual({
      visitId: null,
      savePending: false,
      saveChanges: null,
      saveError: null,
    });
  });

  describe('selectVisitShipmentRouteChanges', () => {
    it('should update shipment route visits for visit changes within shipment route', () => {
      const visits: Dictionary<Visit> = {
        3: {
          id: 3,
          shipmentRouteId: 2,
          shipmentIndex: 1,
          isPickup: true,
          startTime: { seconds: 1563100177 },
        },
        4: { id: 4, shipmentRouteId: 2, shipmentIndex: 1, startTime: { seconds: 1563110769 } },
        6: {
          id: 6,
          shipmentRouteId: 2,
          shipmentIndex: 2,
          isPickup: true,
          startTime: { seconds: 1563117207 },
        },
        8: {
          id: 8,
          shipmentRouteId: 2,
          shipmentIndex: 3,
          isPickup: true,
          startTime: { seconds: 1563096208 },
        },
        10: {
          id: 10,
          shipmentRouteId: 2,
          shipmentIndex: 4,
          isPickup: true,
          startTime: { seconds: 1563114995 },
        },
      };
      const shipmentRoutes: Dictionary<ShipmentRoute> = {
        2: {
          id: 2,
          visits: [8, 3, 4, 10, 6],
          travelSteps: [8, 3, 4, 10, 6, 42].map((id) => ({ distanceMeters: id })),
        },
      };
      const visitChanges = [
        {
          id: 3,
          shipmentRouteId: 2,
          shipmentIndex: 1,
          isPickup: true,
          startTime: { seconds: 1563121387 },
        },
        { id: 4, shipmentRouteId: 2, shipmentIndex: 1, startTime: { seconds: 1563131979 } },
      ];

      const visitShipmentRouteChanges = selectVisitShipmentRouteChanges(visitChanges).projector(
        visits,
        shipmentRoutes
      );

      const changeTime = jasmine.any(Number);
      expect(visitShipmentRouteChanges).toEqual({
        visits: visitChanges.map((visit) => ({ ...visit, changeTime })),
        shipmentRoutes: [
          {
            id: 2,
            visits: [8, 10, 6, 3, 4],
            travelSteps: [8, 10, 6, 3, 4, 42].map((id) => ({ distanceMeters: id })),
            changeTime,
          },
        ],
      });
    });

    it('should update shipment route visits for visit changes between shipment routes', () => {
      const visits: Dictionary<Visit> = {
        1: { id: 1, shipmentRouteId: 2, isPickup: true, startTime: { seconds: 1563123463 } },
        3: {
          id: 3,
          shipmentRouteId: 1,
          shipmentIndex: 1,
          isPickup: true,
          startTime: { seconds: 1563105877 },
        },
        4: { id: 4, shipmentRouteId: 1, shipmentIndex: 1, startTime: { seconds: 1563113769 } },
        6: {
          id: 6,
          shipmentRouteId: 1,
          shipmentIndex: 2,
          isPickup: true,
          startTime: { seconds: 1563117769 },
        },
        8: {
          id: 8,
          shipmentRouteId: 1,
          shipmentIndex: 3,
          isPickup: true,
          startTime: { seconds: 1563099208 },
        },
        10: {
          id: 10,
          shipmentRouteId: 2,
          shipmentIndex: 4,
          isPickup: true,
          startTime: { seconds: 1563099957 },
        },
      };
      const shipmentRoutes: Dictionary<ShipmentRoute> = {
        1: {
          id: 1,
          visits: [8, 3, 4, 6],
          travelSteps: [8, 3, 4, 6, 42].map((id) => ({ distanceMeters: id })),
        },
        2: {
          id: 2,
          visits: [10, 1],
          travelSteps: [10, 1, 24].map((id) => ({ distanceMeters: id })),
        },
      };
      const visitChanges = [
        {
          id: 3,
          shipmentRouteId: 2,
          shipmentIndex: 1,
          isPickup: true,
          startTime: { seconds: 1563106437 },
        },
        { id: 4, shipmentRouteId: 2, shipmentIndex: 1, startTime: { seconds: 1563114329 } },
      ];

      const visitShipmentRouteChanges = selectVisitShipmentRouteChanges(visitChanges).projector(
        visits,
        shipmentRoutes
      );

      const changeTime = jasmine.any(Number);
      expect(visitShipmentRouteChanges).toEqual({
        visits: visitChanges.map((visit) => ({ ...visit, changeTime })),
        shipmentRoutes: [
          {
            id: 1,
            visits: [8, 6],
            travelSteps: [8, 6, 42].map((id) => ({ distanceMeters: id })),
            changeTime,
          },
          {
            id: 2,
            visits: [10, 3, 4, 1],
            travelSteps: [10, 3, 4, 1, 24].map((id) => ({ distanceMeters: id })),
            changeTime,
          },
        ],
      });
    });
  });
});
