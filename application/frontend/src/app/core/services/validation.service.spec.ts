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

import { TestBed } from '@angular/core/testing';
import { Dictionary } from '@ngrx/entity';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import Long from 'long';
import { createTimestamp, durationSeconds } from 'src/app/util';
import {
  IShipmentTypeIncompatibility,
  IShipmentTypeRequirement,
  ITimeWindow,
  Shipment,
  ShipmentRoute,
  ShipmentTypeIncompatibilityMode,
  ShipmentTypeRequirementMode,
  Vehicle,
  Visit,
  VisitRequest,
} from '../models';
import * as fromValidation from '../selectors/validation.selectors';
import { ValidationService } from './validation.service';

describe('ValidationService', () => {
  let service: ValidationService;
  let store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromValidation.selectValidateRequest, value: {} },
            { selector: fromValidation.selectValidationContext, value: {} },
          ],
        }),
      ],
    });
    service = TestBed.inject(ValidationService);
    store = TestBed.inject(MockStore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getErrorEntityIds', () => {
    it('should return empty list', () => {
      const vehicles = [1, 2, 3, 4, 5, 6].map((id) => ({ id })) as Vehicle[];
      expect(service.getErrorEntityIds(vehicles, 'label')).toEqual([]);
    });
    it('should return list of ids', () => {
      const vehicles = [1, 2, 3, 4, 5, 6].map((id) => ({ id })) as Vehicle[];
      vehicles.push({ id: 123, label: 'test1' });
      vehicles.push({ id: 124, label: 'test2' });
      expect(service.getErrorEntityIds(vehicles, 'label')).toEqual([6, 7]);
    });
    it('should return empty list with empty input', () => {
      expect(service.getErrorEntityIds({}, '')).toEqual([]);
    });
  });

  describe('validateRequest', () => {
    describe('shipment allowed vehicle indices', () => {
      it('returns no error', () => {
        const vehicles = [1, 2, 3, 4, 5, 6].map((id) => ({ id })) as Vehicle[];
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map(
              (id) =>
                ({
                  id,
                  allowedVehicleIndices: [0, 2, 4],
                  pickups: [id],
                  deliveries: [],
                } as Shipment)
            ),
          ] as Shipment[],
          vehicles,
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({
          vehicles,
        });

        const result = service.validateRequest();
        expect(result.shipments).toBeNull();
      });

      it('returns no error when allowed vehicles partially ignored', () => {
        const vehicles = [1, 2, 3, 4, 5, 6].map((id) => ({ id })) as Vehicle[];
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map(
              (id) =>
                ({
                  id,
                  allowedVehicleIndices: [0, 2, 4],
                  pickups: [id],
                  deliveries: [],
                } as Shipment)
            ),
          ] as Shipment[],
          vehicles,
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set([1, 5]),
        });
        setValidationContext({
          vehicles,
        });

        const result = service.validateRequest();
        expect(result.shipments).toBeNull();
      });

      it('returns error when all allowed vehicles ignored', () => {
        const vehicles = [1, 2, 3, 4, 5, 6].map((id) => ({ id })) as Vehicle[];
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map(
              (id) =>
                ({
                  id,
                  allowedVehicleIndices: id === 2 ? [] : [0, 2, 4],
                  pickups: [id],
                  deliveries: [],
                } as Shipment)
            ),
          ] as Shipment[],
          vehicles,
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set([1, 3, 5]),
        });
        setValidationContext({
          vehicles,
        });

        const result = service.validateRequest();
        expect(result.shipments).toEqual({
          1: { allowedVehicleIndices: true },
          3: { allowedVehicleIndices: true },
        });
      });
    });

    describe('shipment time window outside global time limit', () => {
      it('returns no error', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map((id) => ({ id, pickups: [id], deliveries: [] })),
            ...[4, 5, 6].map((id) => ({ id, pickups: [], deliveries: [id] })),
          ] as Shipment[],
          vehicles: [],
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({
          globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)],
          visitRequests: [
            { id: 1, shipmentId: 1, pickup: true, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 2, shipmentId: 2, pickup: true, timeWindows: [getTimeWindow(3001, 5999)] },
            { id: 3, shipmentId: 3, pickup: true, timeWindows: [getTimeWindow(4500, 4500)] },
            { id: 4, shipmentId: 4, pickup: false, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, shipmentId: 5, pickup: false, timeWindows: [getTimeWindow(3001, 5999)] },
            { id: 6, shipmentId: 6, pickup: false, timeWindows: [getTimeWindow(4500, 4500)] },
          ],
        });

        const result = service.validateRequest();
        expect(result.shipments).toBeNull();
      });

      it('returns error', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map((id) => ({ id, pickups: [id], deliveries: [] })),
            ...[4, 5, 6].map((id) => ({ id, pickups: [], deliveries: [id] })),
          ] as Shipment[],
          vehicles: [],
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({
          globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)],
          visitRequests: [
            { id: 1, shipmentId: 1, pickup: true, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 2, shipmentId: 2, pickup: true, timeWindows: [getTimeWindow(0, 2999)] },
            { id: 3, shipmentId: 3, pickup: true, timeWindows: [getTimeWindow(6001, 9000)] },
            { id: 4, shipmentId: 4, pickup: false, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, shipmentId: 5, pickup: false, timeWindows: [getTimeWindow(2999, 2999)] },
            { id: 6, shipmentId: 6, pickup: false, timeWindows: [getTimeWindow(6001, 6001)] },
          ],
        });

        const result = service.validateRequest();
        expect(result.shipments).toEqual({
          2: { timeWindowOutOfRange: true },
          3: { timeWindowOutOfRange: true },
          5: { timeWindowOutOfRange: true },
          6: { timeWindowOutOfRange: true },
        });
      });

      it('ignores shipments', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [
            ...[1, 2, 3].map((id) => ({ id, pickups: [id], deliveries: [] })),
            ...[4, 5, 6].map((id) => ({ id, pickups: [], deliveries: [id] })),
          ] as Shipment[],
          vehicles: [],
          ignoreShipmentIds: new Set([3, 5]),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({
          globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)],
          visitRequests: [
            { id: 1, shipmentId: 1, pickup: true, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 2, shipmentId: 2, pickup: true, timeWindows: [getTimeWindow(0, 2999)] },
            { id: 3, shipmentId: 3, pickup: true, timeWindows: [getTimeWindow(6001, 9000)] },
            { id: 4, shipmentId: 4, pickup: false, timeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, shipmentId: 5, pickup: false, timeWindows: [getTimeWindow(2999, 2999)] },
            { id: 6, shipmentId: 6, pickup: false, timeWindows: [getTimeWindow(6001, 6001)] },
          ],
        });

        const result = service.validateRequest();
        expect(result.shipments).toEqual({
          2: { timeWindowOutOfRange: true },
          6: { timeWindowOutOfRange: true },
        });
      });
    });

    describe('vehicle time window outside global time limit', () => {
      it('returns no error', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [],
          vehicles: [
            { id: 1, startTimeWindows: [getTimeWindow(3000, 6000)], endTimeWindows: null },
            { id: 2, startTimeWindows: [getTimeWindow(3001, 5999)] },
            { id: 3, startTimeWindows: [getTimeWindow(4500, 4500)] },
            { id: 4, endTimeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, endTimeWindows: [getTimeWindow(3001, 5999)] },
            { id: 6, endTimeWindows: [getTimeWindow(4500, 4500)] },
          ] as Vehicle[],
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({ globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)] });

        const result = service.validateRequest();
        expect(result.vehicles).toBeNull();
      });

      it('returns error', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [],
          vehicles: [
            { id: 1, startTimeWindows: [getTimeWindow(3000, 6000)], endTimeWindows: null },
            { id: 2, startTimeWindows: [getTimeWindow(2999, 5999)] },
            { id: 3, startTimeWindows: [getTimeWindow(3000, 6001)] },
            { id: 4, endTimeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, endTimeWindows: [getTimeWindow(2999, 2999)] },
            { id: 6, endTimeWindows: [getTimeWindow(6001, 6001)] },
          ] as Vehicle[],
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set<number>(),
        });
        setValidationContext({ globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)] });

        const result = service.validateRequest();
        expect(result.vehicles).toEqual({
          2: { timeWindowOutOfRange: true },
          3: { timeWindowOutOfRange: true },
          5: { timeWindowOutOfRange: true },
          6: { timeWindowOutOfRange: true },
        });
      });

      it('ignores vehicles', () => {
        store.overrideSelector(fromValidation.selectValidateRequest, {
          shipments: [],
          vehicles: [
            { id: 1, startTimeWindows: [getTimeWindow(3000, 6000)], endTimeWindows: null },
            { id: 2, startTimeWindows: [getTimeWindow(2999, 5999)] },
            { id: 3, startTimeWindows: [getTimeWindow(3000, 6001)] },
            { id: 4, endTimeWindows: [getTimeWindow(3000, 6000)] },
            { id: 5, endTimeWindows: [getTimeWindow(2999, 2999)] },
            { id: 6, endTimeWindows: [getTimeWindow(6001, 6001)] },
          ] as Vehicle[],
          ignoreShipmentIds: new Set<number>(),
          ignoreVehicleIds: new Set([3, 5]),
        });
        setValidationContext({ globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)] });

        const result = service.validateRequest();
        expect(result.vehicles).toEqual({
          2: { timeWindowOutOfRange: true },
          6: { timeWindowOutOfRange: true },
        });
      });
    });
  });

  describe('validateVisit', () => {
    describe('pickup outside global time limit', () => {
      it('returns no error', () => {
        for (const startTime of [3000, 4500, 6000].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)],
            shipments: [{ id: 1 }] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1 },
              { id: 2, shipmentId: 1 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = { id: 1, shipmentRouteId: 1, isPickup: true, startTime };
          const errors = service.validateVisit(visit, null);

          expect(errors?.globalOutOfRange).toBeFalsy();
        }
      });

      it('returns error', () => {
        for (const startTime of [2999, 6001].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            globalDuration: [Long.fromNumber(3000), Long.fromNumber(6000)],
            shipments: [{ id: 1 }] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = { id: 1, shipmentRouteId: 1, isPickup: true, startTime };
          const errors = service.validateVisit(visit, null);

          expect(errors?.globalOutOfRange).toBeTruthy();
        }
      });
    });

    describe("pickup outside visit request's time limits", () => {
      it('returns no error', () => {
        for (const startTime of [4000, 4500, 5000].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipments: [{ id: 1, pickups: [1], deliveries: [2] }] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true, timeWindows: [getTimeWindow(4000, 5000)] },
              { id: 2, shipmentId: 1, timeWindows: [getTimeWindow(4000, 5000)] },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime,
            duration: { seconds: 1000 },
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.visitRequestOutOfRange).toBeFalsy();
        }
      });

      it('returns no error when without time windows', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [{ id: 1, pickups: [1], deliveries: [2] }] as Shipment[],
          vehicles: [{ id: 1 }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, pickup: true, timeWindows: [] },
            { id: 2, shipmentId: 1 },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.visitRequestOutOfRange).toBeFalsy();
      });

      it('returns error', () => {
        for (const startTime of [3999, 5001].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipments: [{ id: 1, pickups: [1], deliveries: [2] }] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true, timeWindows: [getTimeWindow(4000, 5000)] },
              { id: 2, shipmentId: 1, timeWindows: [getTimeWindow(4000, 5000)] },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = { id: 1, shipmentRouteId: 1, isPickup: true, startTime };
          const errors = service.validateVisit(visit, null);

          expect(errors?.visitRequestOutOfRange).toBeTruthy();
        }
      });
    });

    describe("pickup outside vehicle's availability", () => {
      it('returns no error', () => {
        for (const startTime of [4000, 4500, 5000].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipments: [{ id: 1, pickups: [1], deliveries: [2] }] as Shipment[],
            vehicles: [
              // Vehicle with availability [4000, 5000]
              {
                id: 1,
                startTimeWindows: [getTimeWindow(4250, 4499), getTimeWindow(4000, 4249)],
                endTimeWindows: [getTimeWindow(4750, 5000), getTimeWindow(4501, 4749)],
              },
            ] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = { id: 1, shipmentRouteId: 1, isPickup: true, startTime };
          const errors = service.validateVisit(visit, null);

          expect(errors?.vehicleOutOfRange).toBeFalsy();
        }
      });

      it('returns error', () => {
        for (const startTime of [3999, 5001].map((seconds) => createTimestamp(seconds))) {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipments: [{ id: 1, pickups: [1], deliveries: [2] }] as Shipment[],
            vehicles: [
              // Vehicle with availability [4000, 5000]
              {
                id: 1,
                startTimeWindows: [getTimeWindow(4250, 4499), getTimeWindow(4000, 4249)],
                endTimeWindows: [getTimeWindow(4750, 5000), getTimeWindow(4501, 4749)],
              },
            ] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = { id: 1, shipmentRouteId: 1, isPickup: true, startTime };
          const errors = service.validateVisit(visit, null);

          expect(errors?.vehicleOutOfRange).toBeTruthy();
        }
      });
    });

    describe('pickup shipment type incompatibility', () => {
      describe('NOT_PERFORMED_BY_SAME_VEHICLE', () => {
        it('returns no error when without shipment type', () => {
          for (const mode of [
            null,
            ShipmentTypeIncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE,
          ]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
            ];
            setValidationContext({
              shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode: mode }],
              shipments: [
                // No shipment type to be incompatible with 'bar'
                { id: 1, pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
          }
        });

        it('returns no error when without incompatibility', () => {
          for (const mode of [
            null,
            ShipmentTypeIncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE,
          ]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
            ];
            setValidationContext({
              shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode: mode }],
              shipments: [
                // No 'bar' shipment to be incompatible with
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
          }
        });

        it('returns error when with incompatibility', () => {
          for (const mode of [
            null,
            ShipmentTypeIncompatibilityMode.NOT_PERFORMED_BY_SAME_VEHICLE,
          ]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(4000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(4499) },
            ];
            setValidationContext({
              shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode: mode }],
              shipments: [
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            // 'foo' pickup incompatible with 'bar' pickup/delivery
            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toEqual({
              shipmentType: 'foo',
              otherShipmentTypes: ['bar'],
            });
            expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
          }
        });
      });

      describe('NOT_PERFORMED_BY_SAME_VEHICLE', () => {
        const incompatibilityMode =
          ShipmentTypeIncompatibilityMode.NOT_IN_SAME_VEHICLE_SIMULTANEOUSLY;

        it('returns no error when without shipment type', () => {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode }],
            shipments: [
              // No 'foo' shipment to be incompatible with 'bar'
              { id: 1, pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
        });

        it('returns no error when without type incompatibility', () => {
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode }],
            shipments: [
              // No 'bar' shipment to be incompatible with 'foo'
              { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
              { id: 2, pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
        });

        it('returns no error when non-simultaneous type incompatibility', () => {
          // Visit under test's shipment 1 occupies [4500, 5000]
          const otherPickupDeliveryTimes = [
            [4000, 4449], // delivery before
            [5001, 5500], // pickup after
          ].map((times) => times.map(createTimestamp));
          for (const [pickupTime, deliveryTime] of otherPickupDeliveryTimes) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: pickupTime },
              { id: 4, shipmentRouteId: 1, startTime: deliveryTime },
            ];
            setValidationContext({
              shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode }],
              shipments: [
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toBeFalsy();
          }
        });

        it('returns error when non-simultaneous type incompatibility', () => {
          // Visit under test's shipment 1 occupies [4500, 5000]
          const otherPickupDeliveryTimes = [
            [4000, 4500], // delivery overlaps
            [5000, 5500], // pickup overlaps
            [3000, 6000], // full overlap
          ].map((times) => times.map(createTimestamp));
          for (const [pickupTime, deliveryTime] of otherPickupDeliveryTimes) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: pickupTime },
              { id: 4, shipmentRouteId: 1, startTime: deliveryTime },
            ];
            setValidationContext({
              shipmentTypeIncompatibilities: [{ types: ['foo', 'bar'], incompatibilityMode }],
              shipments: [
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeCannotBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeCannotBeInSameVehicleSimultaneously).toEqual({
              shipmentType: 'foo',
              otherShipmentTypes: ['bar'],
            });
          }
        });
      });
    });

    describe('pickup shipment type requirement', () => {
      describe('PERFORMED_BY_SAME_VEHICLE', () => {
        it('returns no error when without shipment type', () => {
          for (const mode of [null, ShipmentTypeRequirementMode.PERFORMED_BY_SAME_VEHICLE]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
            ];
            setValidationContext({
              shipmentTypeRequirements: [
                {
                  requiredShipmentTypeAlternatives: ['bar', 'baz'],
                  dependentShipmentTypes: ['foo'],
                  requirementMode: mode,
                },
              ],
              shipments: [
                { id: 1, pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            // No shipment type to be incompatible with
            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
          }
        });

        it('returns no error when with required shipment type', () => {
          for (const mode of [null, ShipmentTypeRequirementMode.PERFORMED_BY_SAME_VEHICLE]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
            ];
            setValidationContext({
              shipmentTypeRequirements: [
                {
                  requiredShipmentTypeAlternatives: ['bar', 'baz'],
                  dependentShipmentTypes: ['foo'],
                  requirementMode: mode,
                },
              ],
              shipments: [
                // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle (present)
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
          }
        });

        it('returns error when without required shipment type', () => {
          for (const mode of [null, ShipmentTypeRequirementMode.PERFORMED_BY_SAME_VEHICLE]) {
            const visits = [
              { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
              { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
              { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
              { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
            ];
            setValidationContext({
              shipmentTypeRequirements: [
                {
                  requiredShipmentTypeAlternatives: ['bar', 'baz'],
                  dependentShipmentTypes: ['foo'],
                  requirementMode: mode,
                },
              ],
              shipments: [
                // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle (missing)
                { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
                { id: 2, pickups: [3], deliveries: [4] },
              ] as Shipment[],
              vehicles: [{ id: 1 }] as Vehicle[],
              visitRequests: [
                { id: 1, shipmentId: 1, pickup: true },
                { id: 2, shipmentId: 1 },
                { id: 3, shipmentId: 2, pickup: true },
                { id: 4, shipmentId: 2 },
              ] as VisitRequest[],
              visits,
              routes: [{ id: 1, visits: getVisitIds(visits) }],
            });

            const visit = {
              id: 1,
              shipmentRouteId: 1,
              isPickup: true,
              startTime: createTimestamp(4500),
            };
            const errors = service.validateVisit(visit, null);

            expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toEqual({
              shipmentType: 'foo',
              otherShipmentTypes: ['bar', 'baz'],
            });
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
            expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
          }
        });
      });

      describe('IN_SAME_VEHICLE_AT_PICKUP_TIME', () => {
        it('returns no error when without shipment type', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME;
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(5000) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar', 'baz'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              { id: 1, pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          // No shipment type to be incompatible with
          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
        });

        it('returns no error when with required shipment type at pickup time', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME;
          // Shipment 2 pickup time 4499 just before shipment 1's pickup time 4500 (see visit under test)
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(4499) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar', 'baz'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle at pickup time
              { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
        });

        it('returns error when without required shipment type at pickup time', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_PICKUP_TIME;
          // Shipment 2 pickup time 4500 on (must be before) shipment 1's pickup time 4500 (see visit under test)
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(4500) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar', 'baz'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle at pickup time
              { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toEqual({
            shipmentType: 'foo',
            otherShipmentTypes: ['bar', 'baz'],
          });
        });
      });

      describe('IN_SAME_VEHICLE_AT_DELIVERY_TIME', () => {
        it('returns no error when without shipment type', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME;
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(5000) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              { id: 1, pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          // No shipment type to be incompatible with
          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
        });

        it('returns no error when with required shipment type at delivery time', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME;
          // Shipment 2 pickup time 4999 just before shipment 1's delivery time 5000
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(4999) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle at delivery time
              { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
        });

        it('returns error when without required shipment type at delivery time', () => {
          const requirementMode = ShipmentTypeRequirementMode.IN_SAME_VEHICLE_AT_DELIVERY_TIME;
          // Shipment 2 pickup time 5000 on (must be before) shipment 1's delivery time 5000
          const visits = [
            { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
            { id: 2, shipmentRouteId: 1, startTime: createTimestamp(5000) },
            { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(5000) },
            { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
          ];
          setValidationContext({
            shipmentTypeRequirements: [
              {
                requiredShipmentTypeAlternatives: ['bar', 'baz'],
                dependentShipmentTypes: ['foo'],
                requirementMode,
              },
            ],
            shipments: [
              // Visit under test's shipment 1 requires shipment 2 to be on the same vehicle at delivery time
              { id: 1, shipmentType: 'foo', pickups: [1], deliveries: [2] },
              { id: 2, shipmentType: 'bar', pickups: [3], deliveries: [4] },
            ] as Shipment[],
            vehicles: [{ id: 1 }] as Vehicle[],
            visitRequests: [
              { id: 1, shipmentId: 1, pickup: true },
              { id: 2, shipmentId: 1 },
              { id: 3, shipmentId: 2, pickup: true },
              { id: 4, shipmentId: 2 },
            ] as VisitRequest[],
            visits,
            routes: [{ id: 1, visits: getVisitIds(visits) }],
          });

          const visit = {
            id: 1,
            shipmentRouteId: 1,
            isPickup: true,
            startTime: createTimestamp(4500),
          };
          const errors = service.validateVisit(visit, null);

          expect(errors?.shipmentTypeMustBePerformedBySameVehicle).toBeFalsy();
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtDeliveryTime).toEqual({
            shipmentType: 'foo',
            otherShipmentTypes: ['bar', 'baz'],
          });
          expect(errors?.shipmentTypeMustBePerformedBySameVehicleAtPickupTime).toBeFalsy();
        });
      });
    });

    describe('shipment excess demand', () => {
      it('returns no error when without demands', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            // No shipment 1 demands
            { id: 1, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            // No shipment 1 visit request demands
            { id: 1, shipmentId: 1, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toBeFalsy();
      });

      it('returns no error when incompatible demand type', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            // Shipment 1 has demands, but without those for 'foo'
            { id: 1, loadDemands: { bar: { amount: 200 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [
            // Vehicle 1 only defines capacities for 'foo'
            { id: 1, loadLimits: { foo: { maxLoad: 250 } } },
          ] as Vehicle[],
          visitRequests: [
            // Shipment 1 has demands, but without those for 'foo'
            { id: 1, shipmentId: 1, loadDemands: { bar: { amount: 50 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toBeFalsy();
      });

      it('returns no error when simultaneous demands within capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            { id: 1, loadDemands: { foo: { amount: 1 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 198 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, loadDemands: { foo: { amount: 1 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toBeFalsy();
      });

      it('returns no error when non-simultaneous demands within capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          // Shipment 2 delivery immediately before shipment 1 pickup
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(4499) },
        ];
        setValidationContext({
          // Only one shipment can be on the vehicle at a time due to the shipment + pickup demand
          shipments: [
            { id: 1, loadDemands: { foo: { amount: 200 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toBeFalsy();
      });

      it('returns error when simultaneous shipment and pickup demands exceed capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          // Shipment 2 delivery on shipment 1 pickup exceeds capacity
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(4500) },
        ];
        setValidationContext({
          // Only one shipment can be on the vehicle at a time due to the shipment + pickup demand
          shipments: [
            { id: 1, loadDemands: { foo: { amount: 200 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toEqual({
          foo: 250,
        });
      });

      it('returns error when simultaneous shipment demand exceeds capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            { id: 1, loadDemands: { foo: { amount: 1 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toEqual({
          // Excess of 1 from shipment
          foo: 1,
        });
      });

      it('returns error when simultaneous pickup demands exceed capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            { id: 1, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 200 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, loadDemands: { foo: { amount: 1 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 50 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 50 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toEqual({
          // Excess of 1 from pickup
          foo: 1,
        });
      });

      it('returns error with excess capacity', () => {
        const visits = [
          { id: 1, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(0) },
          { id: 3, shipmentRouteId: 1, isPickup: true, startTime: createTimestamp(3000) },
          { id: 4, shipmentRouteId: 1, startTime: createTimestamp(6000) },
        ];
        setValidationContext({
          shipments: [
            { id: 1, loadDemands: { foo: { amount: 150 } }, pickups: [1] },
            { id: 2, loadDemands: { foo: { amount: 100 } }, pickups: [3], deliveries: [4] },
          ] as Shipment[],
          vehicles: [{ id: 1, loadLimits: { foo: { maxLoad: 250 } } }] as Vehicle[],
          visitRequests: [
            { id: 1, shipmentId: 1, loadDemands: { foo: { amount: 10 } }, pickup: true },
            { id: 3, shipmentId: 2, loadDemands: { foo: { amount: 25 } }, pickup: true },
            { id: 4, shipmentId: 2, loadDemands: { foo: { amount: 25 } } },
          ] as VisitRequest[],
          visits,
          routes: [{ id: 1, visits: getVisitIds(visits) }],
        });

        const visit = {
          id: 1,
          shipmentRouteId: 1,
          isPickup: true,
          startTime: createTimestamp(4500),
        };
        const errors = service.validateVisit(visit, null);

        expect(errors?.shipmentExcessDemand).toEqual({
          // Excess after shipment 1 capacity (150 from shipment + 10 from pickup)
          // is deducted from the remaining 125 capacity after shipment 2 pickup
          foo: 35,
        });
      });
    });
  });

  function getVisitIds(visits: Visit[]): number[] {
    return visits
      .slice()
      .sort((a, b) => durationSeconds(a.startTime).compare(durationSeconds(b.startTime)))
      .map((visit) => visit.id);
  }

  function getTimeWindow(startTime: number, endTime: number): ITimeWindow {
    return {
      startTime: createTimestamp(startTime),
      endTime: createTimestamp(endTime),
    };
  }

  function setValidationContext(context: {
    globalDuration?: [Long, Long];
    shipmentTypeIncompatibilities?: IShipmentTypeIncompatibility[];
    shipmentTypeRequirements?: IShipmentTypeRequirement[];
    routes?: ShipmentRoute[];
    shipments?: Shipment[];
    vehicles?: Vehicle[];
    visitRequests?: VisitRequest[];
    visits?: Visit[];
  }): void {
    function makeDictionary<T extends { id: number }>(values: T[]): Dictionary<T> {
      const dictionary = {} as Dictionary<T>;
      values?.forEach((value) => {
        dictionary[value.id] = value;
      });
      return dictionary;
    }
    store.overrideSelector(fromValidation.selectValidationContext, {
      globalDuration: context.globalDuration || [Long.MIN_VALUE, Long.MAX_VALUE],
      shipmentTypeIncompatibilities: context.shipmentTypeIncompatibilities,
      shipmentTypeRequirements: context.shipmentTypeRequirements,
      shipmentRoutes: makeDictionary(context.routes),
      visitRequests: makeDictionary(context.visitRequests),
      shipments: makeDictionary(context.shipments),
      vehicles: makeDictionary(context.vehicles),
      visits: makeDictionary(context.visits),
      vehicleIndexById: new Map(
        context.vehicles?.map((vehicle, index) => [vehicle.id, index]) || []
      ),
    });
  }
});
