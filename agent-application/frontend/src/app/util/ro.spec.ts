/*
Copyright 2026 Google LLC

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

import { configureProtobuf } from './configure-protobuf';
import { toOptimizeToursRequest, toOptimizeToursResponse } from './ro';

const jsonBlock = (obj: unknown) => `\`\`\`json${JSON.stringify(obj)}\`\`\``;

describe('parse GMPRO JSON', () => {
  beforeAll(() => {
    configureProtobuf();
  });

  it('should return undefined for empty request', () => {
    expect(toOptimizeToursRequest('')).toBeUndefined();
  });

  it('should return undefined for empty response', () => {
    expect(toOptimizeToursResponse('')).toBeUndefined();
  });

  it('should return undefined for empty JSON request', () => {
    expect(toOptimizeToursRequest('```json```')).toBeUndefined();
    expect(toOptimizeToursRequest('```json {}```')).toBeUndefined();
  });

  it('should return undefined for empty JSON response', () => {
    expect(toOptimizeToursResponse('```json```')).toBeUndefined();
    expect(toOptimizeToursResponse('```json {}```')).toBeUndefined();
  });

  it('should return an OptimizeToursRequest for a valid request JSON', () => {
    expect(toOptimizeToursRequest(jsonBlock(sampleRequest))).not.toBeUndefined();
  });

  it('should return an OptimizeToursResponse for a valid response JSON', () => {
    expect(toOptimizeToursResponse(jsonBlock(sampleResponse))).not.toBeUndefined();
  });

  it('should return an undefined response for a valid request JSON', () => {
    expect(toOptimizeToursResponse(jsonBlock(sampleRequest))).toBeUndefined();
  });

  it('should return an undefined request for a valid response JSON', () => {
    expect(toOptimizeToursRequest(jsonBlock(sampleResponse))).toBeUndefined();
  });
});

const sampleRequest = {
  timeout: '2s',
  model: {
    shipments: [
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 37.802395,
                  longitude: -122.405822,
                },
              },
            },
            timeWindows: [
              {
                startTime: '2024-02-13T07:30:00Z',
                endTime: '2024-02-13T09:30:00Z',
              },
            ],
          },
        ],
        deliveries: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 37.760202,
                  longitude: -122.426796,
                },
              },
            },
            timeWindows: [
              {
                startTime: '2024-02-13T09:30:00Z',
                endTime: '2024-02-13T11:30:00Z',
              },
            ],
          },
        ],
        label: 'Bernese mountain dog',
      },
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 37.738067,
                  longitude: -122.498593,
                },
              },
            },
            timeWindows: [
              {
                startTime: '2024-02-13T07:30:00Z',
                endTime: '2024-02-13T09:30:00Z',
              },
            ],
          },
        ],
        deliveries: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 37.760202,
                  longitude: -122.426796,
                },
              },
            },
            timeWindows: [
              {
                startTime: '2024-02-13T09:30:00Z',
                endTime: '2024-02-13T11:30:00Z',
              },
            ],
          },
        ],
        label: 'Chihuahua',
      },
    ],
    vehicles: [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 37.760202,
              longitude: -122.426796,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 37.760202,
              longitude: -122.426796,
            },
          },
        },
        costPerHour: 27,
        startTimeWindows: [
          {
            startTime: '2024-02-13T07:00:00Z',
            endTime: '2024-02-13T07:15:00Z',
          },
        ],
        endTimeWindows: [
          {
            startTime: '2024-02-13T11:45:00Z',
            endTime: '2024-02-13T12:00:00Z',
          },
        ],
      },
    ],
    globalStartTime: '2024-02-13T07:00:00Z',
    globalEndTime: '2024-02-13T19:00:00Z',
  },
};

const sampleResponse = {
  routes: [
    {
      vehicleStartTime: '2024-02-13T00:00:00Z',
      vehicleEndTime: '2024-02-13T00:38:42Z',
      visits: [
        {
          isPickup: true,
          startTime: '2024-02-13T00:00:00Z',
          detour: '0s',
        },
        {
          startTime: '2024-02-13T00:19:31Z',
          detour: '0s',
        },
      ],
      transitions: [
        {
          travelDuration: '0s',
          waitDuration: '0s',
          totalDuration: '0s',
          startTime: '2024-02-13T00:00:00Z',
        },
        {
          travelDuration: '1171s',
          travelDistanceMeters: 9004,
          waitDuration: '0s',
          totalDuration: '1171s',
          startTime: '2024-02-13T00:00:00Z',
        },
        {
          travelDuration: '1151s',
          travelDistanceMeters: 9599,
          waitDuration: '0s',
          totalDuration: '1151s',
          startTime: '2024-02-13T00:19:31Z',
        },
      ],
      metrics: {
        performedShipmentCount: 1,
        travelDuration: '2322s',
        waitDuration: '0s',
        delayDuration: '0s',
        breakDuration: '0s',
        visitDuration: '0s',
        totalDuration: '2322s',
        travelDistanceMeters: 18603,
      },
      routeCosts: {
        'model.vehicles.cost_per_kilometer': 18.603,
      },
      routeTotalCost: 18.603,
    },
  ],
  metrics: {
    aggregatedRouteMetrics: {
      performedShipmentCount: 1,
      travelDuration: '2322s',
      waitDuration: '0s',
      delayDuration: '0s',
      breakDuration: '0s',
      visitDuration: '0s',
      totalDuration: '2322s',
      travelDistanceMeters: 18603,
    },
    usedVehicleCount: 1,
    earliestVehicleStartTime: '2024-02-13T00:00:00Z',
    latestVehicleEndTime: '2024-02-13T00:38:42Z',
    totalCost: 18.603,
    costs: {
      'model.vehicles.cost_per_kilometer': 18.603,
    },
  },
};
