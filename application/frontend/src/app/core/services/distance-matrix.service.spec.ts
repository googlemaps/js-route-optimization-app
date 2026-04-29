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
import { provideMockStore } from '@ngrx/store/testing';
import { DistanceMatrixService, MAX_CHUNK_SIZE } from './distance-matrix.service';
import { Vehicle, VisitRequest } from '../models';
import { selectMapApiKey } from '../selectors/config.selectors';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DistanceMatrixService', () => {
  let service: DistanceMatrixService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: selectMapApiKey, value: 'test-api-key' }],
        }),
      ],
    });
    service = TestBed.inject(DistanceMatrixService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('buildDistanceMatrixRequests', () => {
    it('should return empty requests for empty inputs', () => {
      const result = service.buildDistanceMatrixRequests([], []);
      expect(result.chunkedRequests).toEqual([]);
      expect(result.originEntities).toEqual([]);
      expect(result.destinationEntityIds).toEqual([]);
    });

    it('should extract vehicle start locations', () => {
      const vehicles: Vehicle[] = [
        {
          id: 1,
          startWaypoint: {
            location: { latLng: { latitude: 1, longitude: 2 } },
          },
        },
      ] as Vehicle[];

      const visitRequests: VisitRequest[] = [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 3, longitude: 4 } },
          },
        },
      ] as VisitRequest[];

      const result = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(result.chunkedRequests.length).toBe(1);
      expect(result.chunkedRequests[0].request).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        destinations: [{ waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: jasmine.any(String),
      });
      expect(result.originEntities).toEqual([
        { id: 1, type: 'vehicle' },
        { id: 1, type: 'visitRequest' },
      ]);
      expect(result.destinationEntityIds).toEqual([1]);
    });

    it('should filter out vehicles without start locations', () => {
      const vehicles: Vehicle[] = [
        { id: 1, startWaypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
        { id: 2, startWaypoint: undefined },
        { id: 3, startWaypoint: { location: undefined } },
      ] as Vehicle[];

      const visitRequests: VisitRequest[] = [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: { location: { latLng: { latitude: 3, longitude: 4 } } },
        },
      ] as VisitRequest[];

      const result = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(result.chunkedRequests[0].request.origins.length).toBe(2);
      expect(result.chunkedRequests[0].request).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        destinations: [{ waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: jasmine.any(String),
      });
      expect(result.originEntities).toEqual([
        { id: 1, type: 'vehicle' },
        { id: 1, type: 'visitRequest' },
      ]);
    });

    it('should filter out visit requests without arrival waypoints', () => {
      const vehicles: Vehicle[] = [] as Vehicle[];

      const visitRequests: VisitRequest[] = [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: { location: { latLng: { latitude: 1, longitude: 2 } } },
        },
        {
          id: 2,
          shipmentId: 1,
          pickup: false,
          arrivalWaypoint: undefined,
        },
        {
          id: 3,
          shipmentId: 2,
          pickup: true,
          arrivalWaypoint: { location: { latLng: { latitude: 3, longitude: 4 } } },
        },
      ] as VisitRequest[];

      const result = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(result.chunkedRequests[0].request.origins.length).toBe(2);
      expect(result.chunkedRequests[0].request.destinations.length).toBe(2);
      expect(result.chunkedRequests[0].request).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        destinations: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: jasmine.any(String),
      });
      expect(result.originEntities).toEqual([
        { id: 1, type: 'visitRequest' },
        { id: 3, type: 'visitRequest' },
      ]);
      expect(result.destinationEntityIds).toEqual([1, 3]);
    });

    it('should include all origins and destinations', () => {
      const vehicles: Vehicle[] = [
        { id: 1, startWaypoint: { location: { latLng: { latitude: 0, longitude: 0 } } } },
      ] as Vehicle[];

      const visitRequests: VisitRequest[] = [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: { location: { latLng: { latitude: 1, longitude: 1 } } },
        },
        {
          id: 2,
          shipmentId: 1,
          pickup: false,
          arrivalWaypoint: { location: { latLng: { latitude: 2, longitude: 2 } } },
        },
      ] as VisitRequest[];

      const result = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(result.chunkedRequests.length).toBe(1);
      expect(result.chunkedRequests[0].request.origins.length).toBe(3);
      expect(result.chunkedRequests[0].request.destinations.length).toBe(2);
      expect(result.chunkedRequests[0].request).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 0, longitude: 0 } } } },
          { waypoint: { location: { latLng: { latitude: 1, longitude: 1 } } } },
          { waypoint: { location: { latLng: { latitude: 2, longitude: 2 } } } },
        ],
        destinations: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 1 } } } },
          { waypoint: { location: { latLng: { latitude: 2, longitude: 2 } } } },
        ],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
        departureTime: jasmine.any(String),
      });
      expect(result.originEntities).toEqual([
        { id: 1, type: 'vehicle' },
        { id: 1, type: 'visitRequest' },
        { id: 2, type: 'visitRequest' },
      ]);
      expect(result.destinationEntityIds).toEqual([1, 2]);
    });

    it('should chunk requests when exceeding max chunk size', () => {
      const vehicles: Vehicle[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        startWaypoint: { location: { latLng: { latitude: i, longitude: i } } },
      })) as Vehicle[];

      const visitRequests: VisitRequest[] = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        shipmentId: i,
        pickup: true,
        arrivalWaypoint: { location: { latLng: { latitude: 100 + i, longitude: 100 + i } } },
      })) as VisitRequest[];

      const result = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(result.chunkedRequests.length).toBe(6);
      expect(result.chunkedRequests[0].request.origins.length).toBe(MAX_CHUNK_SIZE);
      expect(result.chunkedRequests[0].request.destinations.length).toBe(MAX_CHUNK_SIZE);
      expect(result.chunkedRequests[0].originOffset).toBe(0);
      expect(result.chunkedRequests[0].destinationOffset).toBe(0);
      expect(result.chunkedRequests[1].originOffset).toBe(0);
      expect(result.chunkedRequests[1].destinationOffset).toBe(25);
      expect(result.chunkedRequests[2].originOffset).toBe(25);
      expect(result.chunkedRequests[2].destinationOffset).toBe(0);
    });
  });
});
