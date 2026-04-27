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
      expect(result).toEqual([]);
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

      const requests = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(requests.length).toBe(1);
      expect(requests[0]).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        destinations: [{ waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
      });
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

      const requests = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(requests[0].origins.length).toBe(2);
      expect(requests[0]).toEqual({
        origins: [
          { waypoint: { location: { latLng: { latitude: 1, longitude: 2 } } } },
          { waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } },
        ],
        destinations: [{ waypoint: { location: { latLng: { latitude: 3, longitude: 4 } } } }],
        travelMode: 'DRIVE',
        routingPreference: 'TRAFFIC_AWARE',
      });
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

      const requests = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(requests[0].origins.length).toBe(2);
      expect(requests[0].destinations.length).toBe(2);
      expect(requests[0]).toEqual({
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
      });
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

      const requests = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(requests.length).toBe(1);
      expect(requests[0].origins.length).toBe(3);
      expect(requests[0].destinations.length).toBe(2);
      expect(requests[0]).toEqual({
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
      });
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

      const requests = service.buildDistanceMatrixRequests(vehicles, visitRequests);
      expect(requests.length).toBe(6);
      expect(requests[0].origins.length).toBe(MAX_CHUNK_SIZE);
      expect(requests[0].destinations.length).toBe(MAX_CHUNK_SIZE);
    });
  });
});
