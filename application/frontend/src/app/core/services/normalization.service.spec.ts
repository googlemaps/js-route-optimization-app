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

import {
  IInjectedSolution,
  IShipmentModel,
  RelaxationLevel,
  Scenario,
  SearchMode,
} from '../models';
import { NormalizationService } from './normalization.service';
import { google } from '@google-cloud/optimization/build/protos/protos';
import Level = google.maps.routeoptimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.Relaxation.Level;

describe('normalization Service', () => {
  let _normalizationService: NormalizationService;
  let scenario: Scenario;
  let model: IShipmentModel;
  const now = new Date();
  let nowSeconds;
  let tomorrowSeconds;
  beforeEach(() => {
    _normalizationService = new NormalizationService();

    now.setSeconds(0, 0);
    nowSeconds = now.getTime() / 1000;
    tomorrowSeconds = nowSeconds + 86400;

    scenario = {};
    model = {};
  });

  it('normalizes blank scenario - globalStartTime, globalEndTime', () => {
    expect(_normalizationService.normalizeScenario({}, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {},
      },
    });
  });

  it('normalizes scenario with Shipment ', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 48.878454159723745,
                  longitude: 2.330904891015635,
                },
              },
            },
            tags: ['Visit Tag1', 'Visit Tag2'],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: {
          weight_kilograms: {
            amount: '100',
          },
          volume_liters: {
            amount: '20',
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: ['Visit Tag1', 'Visit Tag2'],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalWaypoint: {
                    location: {
                      latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 },
                    },
                  },
                  tags: ['Visit Tag1', 'Visit Tag2'],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - Delivery', () => {
    model.shipments = [
      {
        deliveries: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 48.878454159723745,
                  longitude: 2.330904891015635,
                },
              },
            },
            tags: ['Visit Tag1', 'Visit Tag2'],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: {
          weight_kilograms: {
            amount: '100',
          },
          volume_liters: {
            amount: '20',
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
          id: 1,
          deliveries: [1],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: false,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: ['Visit Tag1', 'Visit Tag2'],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              deliveries: [
                {
                  arrivalWaypoint: {
                    location: {
                      latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 },
                    },
                  },
                  tags: ['Visit Tag1', 'Visit Tag2'],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - Change Time ', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 48.878454159723745,
                  longitude: 2.330904891015635,
                },
              },
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: {
          weight_kilograms: {
            amount: '100',
          },
          volume_liters: {
            amount: '20',
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 120)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
          id: 1,
          deliveries: [],
          changeTime: 120,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 120,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalWaypoint: {
                    location: {
                      latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 },
                    },
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - Demand - Load Demand ', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 48.878454159723745,
                  longitude: 2.330904891015635,
                },
              },
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: { weight: { amount: '200' } },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight: { amount: '200' } },
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalWaypoint: {
                    location: {
                      latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 },
                    },
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight: { amount: '200' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - visit request - Arrival location', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalLocation: {
              latitude: 48.878454159723745,
              longitude: 2.330904891015635,
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: { weight: { amount: '200' } },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight: { amount: '200' } },
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalLocation: {
                    latitude: 48.878454159723745,
                    longitude: 2.330904891015635,
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight: { amount: '200' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - visit request - Arrival location - delete', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalLocation: {
              latitude: 48.878454159723745,
              longitude: 2.330904891015635,
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: { weight: { amount: '200' } },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight: { amount: '200' } },
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalLocation: {
                    latitude: 48.878454159723745,
                    longitude: 2.330904891015635,
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight: { amount: '200' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Shipment - visit request - Departure location ', () => {
    model.shipments = [
      {
        pickups: [
          {
            departureLocation: {
              latitude: 48.878454159723745,
              longitude: 2.330904891015635,
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: { weight: { amount: '200' } },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          loadDemands: { weight: { amount: '200' } },
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          departureWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  departureLocation: {
                    latitude: 48.878454159723745,
                    longitude: 2.330904891015635,
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
              loadDemands: { weight: { amount: '200' } },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Visit Request - Demand - Load Demand ', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalWaypoint: {
              location: {
                latLng: {
                  latitude: 48.878454159723745,
                  longitude: 2.330904891015635,
                },
              },
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
            loadDemands: { weight: { amount: '200' } },
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [
        {
          pickups: [1],
          allowedVehicleIndices: [],
          shipmentType: 'Shipment Type1',
          label: 'Shipment Label 1',
          id: 1,
          deliveries: [],
          changeTime: 0,
        },
      ],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [
        {
          id: 1,
          shipmentId: 1,
          pickup: true,
          arrivalWaypoint: {
            location: { latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 } },
          },
          tags: [],
          timeWindows: [{ endTime: { seconds: '1563112800' } }],
          duration: { seconds: '3600' },
          cost: 0.25,
          visitTypes: ['Visit Type1'],
          label: 'Pickup Request 1',
          changeTime: 0,
          loadDemands: { weight: { amount: '200' } },
        },
      ],
      vehicles: [],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          shipments: [
            {
              pickups: [
                {
                  arrivalWaypoint: {
                    location: {
                      latLng: { latitude: 48.878454159723745, longitude: 2.330904891015635 },
                    },
                  },
                  tags: [],
                  timeWindows: [{ endTime: { seconds: '1563112800' } }],
                  duration: { seconds: '3600' },
                  cost: 0.25,
                  visitTypes: ['Visit Type1'],
                  label: 'Pickup Request 1',
                  loadDemands: { weight: { amount: '200' } },
                },
              ],
              allowedVehicleIndices: [],
              shipmentType: 'Shipment Type1',
              label: 'Shipment Label 1',
            },
          ],
        },
      },
    });
  });

  it('normalizes blank solution ', () => {
    expect(_normalizationService.normalizeSolution({}, [], [], null)).toEqual({
      shipmentRoutes: [],
      visits: [],
      skippedShipments: [],
      skippedShipmentReasons: {},
    });
  });

  it('normalizes blank injected solution ', () => {
    expect(_normalizationService.normalizeInjectedSolution({}, [])).toEqual({
      constraintRelaxations: undefined,
    });
  });

  it('normalizes scenario with Vehicle ', () => {
    model.vehicles = [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        startTimeWindows: [
          {
            startTime: {
              seconds: '1563097800',
            },
            endTime: {
              seconds: '1563102000',
            },
          },
        ],
        endTimeWindows: [
          {
            startTime: {
              seconds: '1563117780',
            },
            endTime: {
              seconds: '1563121980',
            },
          },
        ],
        costPerHour: 30,
        costPerKilometer: 0.2,
        usedIfRouteIsEmpty: true,
        travelDurationLimit: {},
        breakRule: {
          breakRequests: [
            {
              earliestStartTime: {
                seconds: '1563102000',
              },
              latestStartTime: {
                seconds: '1563109200',
              },
              minDuration: {
                seconds: '2700',
              },
            },
          ],
        },
        loadLimits: {
          weight_kilograms: {
            maxLoad: '400',
            startLoadInterval: {},
            endLoadInterval: {},
          },
          volume_liters: {
            maxLoad: '50',
            startLoadInterval: {},
            endLoadInterval: {},
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [],
      vehicles: [
        {
          id: 1,
          startWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          endWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          startTimeWindows: [
            {
              startTime: {
                seconds: '1563097800',
              },
              endTime: {
                seconds: '1563102000',
              },
            },
          ],
          endTimeWindows: [
            {
              startTime: {
                seconds: '1563117780',
              },
              endTime: {
                seconds: '1563121980',
              },
            },
          ],
          costPerHour: 30,
          costPerKilometer: 0.2,
          usedIfRouteIsEmpty: true,
          travelDurationLimit: {},
          breakRule: {
            breakRequests: [
              {
                earliestStartTime: {
                  seconds: '1563102000',
                },
                latestStartTime: {
                  seconds: '1563109200',
                },
                minDuration: {
                  seconds: '2700',
                },
              },
            ],
          },
          loadLimits: {
            weight_kilograms: {
              maxLoad: '400',
              startLoadInterval: {},
              endLoadInterval: {},
            },
            volume_liters: {
              maxLoad: '50',
              startLoadInterval: {},
              endLoadInterval: {},
            },
          },
          changeTime: 0,
        },
      ],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          vehicles: [
            {
              startWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              endWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              startTimeWindows: [
                {
                  startTime: {
                    seconds: '1563097800',
                  },
                  endTime: {
                    seconds: '1563102000',
                  },
                },
              ],
              endTimeWindows: [
                {
                  startTime: {
                    seconds: '1563117780',
                  },
                  endTime: {
                    seconds: '1563121980',
                  },
                },
              ],
              costPerHour: 30,
              costPerKilometer: 0.2,
              usedIfRouteIsEmpty: true,
              travelDurationLimit: {},
              breakRule: {
                breakRequests: [
                  {
                    earliestStartTime: {
                      seconds: '1563102000',
                    },
                    latestStartTime: {
                      seconds: '1563109200',
                    },
                    minDuration: {
                      seconds: '2700',
                    },
                  },
                ],
              },
              loadLimits: {
                weight_kilograms: {
                  maxLoad: '400',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
                volume_liters: {
                  maxLoad: '50',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
              },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Vehicle - Start Location ', () => {
    model.vehicles = [
      {
        startLocation: {
          latitude: 48.883332,
          longitude: 2.369089,
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        startTimeWindows: [
          {
            startTime: {
              seconds: '1563097800',
            },
            endTime: {
              seconds: '1563102000',
            },
          },
        ],
        endTimeWindows: [
          {
            startTime: {
              seconds: '1563117780',
            },
            endTime: {
              seconds: '1563121980',
            },
          },
        ],
        costPerHour: 30,
        costPerKilometer: 0.2,
        usedIfRouteIsEmpty: true,
        travelDurationLimit: {},
        breakRule: {
          breakRequests: [
            {
              earliestStartTime: {
                seconds: '1563102000',
              },
              latestStartTime: {
                seconds: '1563109200',
              },
              minDuration: {
                seconds: '2700',
              },
            },
          ],
        },
        loadLimits: {
          weight_kilograms: {
            maxLoad: '400',
            startLoadInterval: {},
            endLoadInterval: {},
          },
          volume_liters: {
            maxLoad: '50',
            startLoadInterval: {},
            endLoadInterval: {},
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [],
      vehicles: [
        {
          id: 1,
          startWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          endWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          startTimeWindows: [
            {
              startTime: {
                seconds: '1563097800',
              },
              endTime: {
                seconds: '1563102000',
              },
            },
          ],
          endTimeWindows: [
            {
              startTime: {
                seconds: '1563117780',
              },
              endTime: {
                seconds: '1563121980',
              },
            },
          ],
          costPerHour: 30,
          costPerKilometer: 0.2,
          usedIfRouteIsEmpty: true,
          travelDurationLimit: {},
          breakRule: {
            breakRequests: [
              {
                earliestStartTime: {
                  seconds: '1563102000',
                },
                latestStartTime: {
                  seconds: '1563109200',
                },
                minDuration: {
                  seconds: '2700',
                },
              },
            ],
          },
          loadLimits: {
            weight_kilograms: {
              maxLoad: '400',
              startLoadInterval: {},
              endLoadInterval: {},
            },
            volume_liters: {
              maxLoad: '50',
              startLoadInterval: {},
              endLoadInterval: {},
            },
          },
          changeTime: 0,
        },
      ],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          vehicles: [
            {
              startLocation: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
              endWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              startTimeWindows: [
                {
                  startTime: {
                    seconds: '1563097800',
                  },
                  endTime: {
                    seconds: '1563102000',
                  },
                },
              ],
              endTimeWindows: [
                {
                  startTime: {
                    seconds: '1563117780',
                  },
                  endTime: {
                    seconds: '1563121980',
                  },
                },
              ],
              costPerHour: 30,
              costPerKilometer: 0.2,
              usedIfRouteIsEmpty: true,
              travelDurationLimit: {},
              breakRule: {
                breakRequests: [
                  {
                    earliestStartTime: {
                      seconds: '1563102000',
                    },
                    latestStartTime: {
                      seconds: '1563109200',
                    },
                    minDuration: {
                      seconds: '2700',
                    },
                  },
                ],
              },

              loadLimits: {
                weight_kilograms: {
                  maxLoad: '400',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
                volume_liters: {
                  maxLoad: '50',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
              },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Vehicle - End Location ', () => {
    model.vehicles = [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        endLocation: {
          latitude: 48.883332,
          longitude: 2.369089,
        },
        startTimeWindows: [
          {
            startTime: {
              seconds: '1563097800',
            },
            endTime: {
              seconds: '1563102000',
            },
          },
        ],
        endTimeWindows: [
          {
            startTime: {
              seconds: '1563117780',
            },
            endTime: {
              seconds: '1563121980',
            },
          },
        ],
        costPerHour: 30,
        costPerKilometer: 0.2,
        usedIfRouteIsEmpty: true,
        travelDurationLimit: {},
        breakRule: {
          breakRequests: [
            {
              earliestStartTime: {
                seconds: '1563102000',
              },
              latestStartTime: {
                seconds: '1563109200',
              },
              minDuration: {
                seconds: '2700',
              },
            },
          ],
        },

        loadLimits: {
          weight_kilograms: {
            maxLoad: '400',
            startLoadInterval: {},
            endLoadInterval: {},
          },
          volume_liters: {
            maxLoad: '50',
            startLoadInterval: {},
            endLoadInterval: {},
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [],
      vehicles: [
        {
          id: 1,
          startWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          endWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          startTimeWindows: [
            {
              startTime: {
                seconds: '1563097800',
              },
              endTime: {
                seconds: '1563102000',
              },
            },
          ],
          endTimeWindows: [
            {
              startTime: {
                seconds: '1563117780',
              },
              endTime: {
                seconds: '1563121980',
              },
            },
          ],
          costPerHour: 30,
          costPerKilometer: 0.2,
          usedIfRouteIsEmpty: true,
          travelDurationLimit: {},
          breakRule: {
            breakRequests: [
              {
                earliestStartTime: {
                  seconds: '1563102000',
                },
                latestStartTime: {
                  seconds: '1563109200',
                },
                minDuration: {
                  seconds: '2700',
                },
              },
            ],
          },

          loadLimits: {
            weight_kilograms: {
              maxLoad: '400',
              startLoadInterval: {},
              endLoadInterval: {},
            },
            volume_liters: {
              maxLoad: '50',
              startLoadInterval: {},
              endLoadInterval: {},
            },
          },
          changeTime: 0,
        },
      ],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          vehicles: [
            {
              startWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              endLocation: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
              startTimeWindows: [
                {
                  startTime: {
                    seconds: '1563097800',
                  },
                  endTime: {
                    seconds: '1563102000',
                  },
                },
              ],
              endTimeWindows: [
                {
                  startTime: {
                    seconds: '1563117780',
                  },
                  endTime: {
                    seconds: '1563121980',
                  },
                },
              ],
              costPerHour: 30,
              costPerKilometer: 0.2,
              usedIfRouteIsEmpty: true,
              travelDurationLimit: {},
              breakRule: {
                breakRequests: [
                  {
                    earliestStartTime: {
                      seconds: '1563102000',
                    },
                    latestStartTime: {
                      seconds: '1563109200',
                    },
                    minDuration: {
                      seconds: '2700',
                    },
                  },
                ],
              },

              loadLimits: {
                weight_kilograms: {
                  maxLoad: '400',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
                volume_liters: {
                  maxLoad: '50',
                  startLoadInterval: {},
                  endLoadInterval: {},
                },
              },
            },
          ],
        },
      },
    });
  });

  it('normalizes scenario with Vehicle - Capacities ', () => {
    model.vehicles = [
      {
        startWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        startTimeWindows: [
          {
            startTime: {
              seconds: '1563097800',
            },
            endTime: {
              seconds: '1563102000',
            },
          },
        ],
        endTimeWindows: [
          {
            startTime: {
              seconds: '1563117780',
            },
            endTime: {
              seconds: '1563121980',
            },
          },
        ],
        costPerHour: 30,
        costPerKilometer: 0.2,
        usedIfRouteIsEmpty: true,
        travelDurationLimit: {},
        breakRule: {
          breakRequests: [
            {
              earliestStartTime: {
                seconds: '1563102000',
              },
              latestStartTime: {
                seconds: '1563109200',
              },
              minDuration: {
                seconds: '2700',
              },
            },
          ],
        },
        loadLimits: {
          weight_kilograms: {
            maxLoad: '400',
          },
          volume_liters: {
            maxLoad: '50',
          },
        },
      },
    ];
    scenario.model = model;
    expect(_normalizationService.normalizeScenario(scenario, 0)).toEqual({
      firstSolutionRoutes: undefined,
      injectedModelConstraint: undefined,
      injectedSolution: false,
      label: '',
      searchMode: SearchMode.RETURN_FAST,
      shipments: [],
      shipmentModel: {
        globalDurationCostPerHour: undefined,
        maxActiveVehicles: undefined,
        precedenceRules: undefined,
        shipmentTypeRequirements: undefined,
        shipmentTypeIncompatibilities: undefined,
        transitionAttributes: undefined,
        globalStartTime: nowSeconds,
        globalEndTime: tomorrowSeconds,
      },
      solvingMode: undefined,
      timeout: undefined,
      traffic: false,
      visitRequests: [],
      vehicles: [
        {
          id: 1,
          startWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          endWaypoint: {
            location: {
              latLng: {
                latitude: 48.883332,
                longitude: 2.369089,
              },
            },
          },
          startTimeWindows: [
            {
              startTime: {
                seconds: '1563097800',
              },
              endTime: {
                seconds: '1563102000',
              },
            },
          ],
          endTimeWindows: [
            {
              startTime: {
                seconds: '1563117780',
              },
              endTime: {
                seconds: '1563121980',
              },
            },
          ],
          costPerHour: 30,
          costPerKilometer: 0.2,
          usedIfRouteIsEmpty: true,
          travelDurationLimit: {},
          breakRule: {
            breakRequests: [
              {
                earliestStartTime: {
                  seconds: '1563102000',
                },
                latestStartTime: {
                  seconds: '1563109200',
                },
                minDuration: {
                  seconds: '2700',
                },
              },
            ],
          },

          loadLimits: {
            weight_kilograms: {
              maxLoad: '400',
            },
            volume_liters: {
              maxLoad: '50',
            },
          },
          changeTime: 0,
        },
      ],
      allowLargeDeadlineDespiteInterruptionRisk: undefined,
      interpretInjectedSolutionsUsingLabels: undefined,
      populateTransitionPolylines: undefined,
      useGeodesicDistances: undefined,
      geodesicMetersPerSecond: undefined,
      normalizedScenario: {
        model: {
          vehicles: [
            {
              startWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              endWaypoint: {
                location: {
                  latLng: {
                    latitude: 48.883332,
                    longitude: 2.369089,
                  },
                },
              },
              startTimeWindows: [
                {
                  startTime: {
                    seconds: '1563097800',
                  },
                  endTime: {
                    seconds: '1563102000',
                  },
                },
              ],
              endTimeWindows: [
                {
                  startTime: {
                    seconds: '1563117780',
                  },
                  endTime: {
                    seconds: '1563121980',
                  },
                },
              ],
              costPerHour: 30,
              costPerKilometer: 0.2,
              usedIfRouteIsEmpty: true,
              travelDurationLimit: {},
              breakRule: {
                breakRequests: [
                  {
                    earliestStartTime: {
                      seconds: '1563102000',
                    },
                    latestStartTime: {
                      seconds: '1563109200',
                    },
                    minDuration: {
                      seconds: '2700',
                    },
                  },
                ],
              },

              loadLimits: {
                weight_kilograms: {
                  maxLoad: '400',
                },
                volume_liters: {
                  maxLoad: '50',
                },
              },
            },
          ],
        },
      },
    });
  });

  it('normalizes solution ', () => {
    const solutionTest = {
      routes: [
        {
          vehicleIndex: 0,
          vehicleLabel: '',
          vehicleStartTime: { seconds: '1563102000', nanos: 0 },
          vehicleEndTime: { seconds: '1563117780', nanos: 0 },
          visits: [
            {
              shipmentIndex: 0,
              isPickup: true,
              visitRequestIndex: 0,
              startTime: { seconds: '1563105633', nanos: 0 },
              demands: [
                { type: 'volume_liters', value: '20' },
                { type: 'weight_kilograms', value: '100' },
              ],
              detour: { seconds: '2700', nanos: 0 },
              shipmentLabel: '',
              visitLabel: '',
              arrivalLoads: [
                { type: 'volume_liters', value: '0' },
                { type: 'weight_kilograms', value: '0' },
              ],
              loadDemands: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
            },
          ],
          transitions: [
            {
              travelDuration: { seconds: '933', nanos: 0 },
              travelDistanceMeters: 3426,
              trafficInfoUnavailable: false,
              breakDuration: { seconds: '2700', nanos: 0 },
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '3633', nanos: 0 },
              startTime: { seconds: '1563102000', nanos: 0 },
              vehicleLoads: { weight_kilograms: { amount: '0' }, volume_liters: { amount: '0' } },
            },
            {
              travelDuration: { seconds: '967', nanos: 0 },
              travelDistanceMeters: 3840,
              trafficInfoUnavailable: false,
              waitDuration: { seconds: '7580', nanos: 0 },
              totalDuration: { seconds: '8547', nanos: 0 },
              startTime: { seconds: '1563109233', nanos: 0 },
              vehicleLoads: {
                weight_kilograms: { amount: '100' },
                volume_liters: { amount: '20' },
              },
            },
          ],
          hasTrafficInfeasibilities: false,
          routePolyline: {
            points:
              'sojiHyumMDCDEHKBEDGFKJUJWBEDGHOBEBCDEBALGTnA@H@D@LDV@B@DLj@@F@BHZDLRlAVxADVVtAh@bDDRV|AFZTpAZjBl@jDd@pCF^Hf@TlATpA@JBNF^PdAJf@Fd@P|@Fd@@@Hf@F^RhALt@f@xCTjA^zB^vBPnABJJh@Hj@VvAz@`FZdBSLURON_Az@MJMLc@^]XcA~@uAjAC@OLAXhAvFBD@D@B?Jf@dCNp@RhAd@xBNv@DPP|@Ln@p@bDh@pCd@|Bj@rCRd@BH@JBJXr@Zv@z@|BfArCHXn@`BZx@\\z@L\\HVHNC^AT?PCbBEjA?DE`AAJ?F?D?D@HCDADCLMVCt@Cd@APCVAT?B?FAL?D?F?\\BPBb@PlBBb@?PAt@Ah@Ab@Cf@Ad@GbBAJAHEdAAb@AHEpA?JALDpABpA?LBt@?L@R?H@FBPBLJh@DVXZBHBFBF@FBLBNBN@V@\\@H?T?F?@?BAFADAFADAFCDITeApEU`AQv@CLgA`FWhA[rA[fAId@Ib@U`AOr@a@hBu@bDMh@Op@A?[rA?@EPAHAHAAA?A??AA?A?A?A?A@C?A@?@A?ABA??@A@?@A@A@?BCEKIIIAA}@q@c@[a@YmByAg@]ACOQEACCECYYg@_@s@i@[UyAgAk@a@_As@wAgAGCUQIGMAEWCYAICGKM@E@E?I?G@G?G?MAC?CACACAAACAA?IAGAMEOGQKYO_@Uc@IQGK]o@k@eAc@{@B[DW?CBMZsBBOPeAFa@DYJs@PiAT_BFCBABCBCBEFO?E?EAE?IAGCIJ]FSz@sEj@gDFMF]z@iE`@wBTmAXkCXoCDa@@MBIReCF{@?Y?Q?MCM?MMw@EQQkAEYAWCQSeBCYC[G_@y@wHIm@CSEa@K}@CWe@eECYEYKs@Gi@Ku@Gc@E]C]AMCMGaAGiAWaEAWCk@?CCa@ASCi@Ck@Ak@Cu@?E?AA??AIkCAIAi@A]A]CaAAQGkBEoAASM_ECw@EaACs@CkAA]AOAa@CgAA_@IoBEsACi@EwBA[IcBA]Ao@AQ@YBgCB}B?uA?mA?iB?iB?cA?uAAc@?cB?]@_A@]HwBLeFBoADwB@OBoA@i@@UBO@IBK`@m@TWHIHEXOJITQ',
          },
          breaks: [
            {
              startTime: { seconds: '1563102000', nanos: 0 },
              duration: { seconds: '2700', nanos: 0 },
            },
          ],
          metrics: {
            performedShipmentCount: 1,
            travelDuration: { seconds: '1900', nanos: 0 },
            waitDuration: { seconds: '7580', nanos: 0 },
            delayDuration: { seconds: '0', nanos: 0 },
            breakDuration: { seconds: '2700', nanos: 0 },
            visitDuration: { seconds: '3600', nanos: 0 },
            totalDuration: { seconds: '15780', nanos: 0 },
            travelDistanceMeters: 7266,
            maxLoads: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
            totalCost: 0,
          },
          endLoads: [
            { type: 'volume_liters', value: '20' },
            { type: 'weight_kilograms', value: '100' },
          ],
          vehicleDetour: { seconds: '15780', nanos: 0 },
          routeCosts: {
            'model.vehicles.cost_per_hour': 131.5,
            'model.vehicles.cost_per_kilometer': 1.4532,
          },
          routeTotalCost: 132.9532,
        },
      ],
      totalCost: 132.9532,
      requestLabel: '',
      metrics: {
        aggregatedRouteMetrics: {
          performedShipmentCount: 1,
          travelDuration: { seconds: '1900', nanos: 0 },
          waitDuration: { seconds: '7580', nanos: 0 },
          delayDuration: { seconds: '0', nanos: 0 },
          breakDuration: { seconds: '2700', nanos: 0 },
          visitDuration: { seconds: '3600', nanos: 0 },
          totalDuration: { seconds: '15780', nanos: 0 },
          travelDistanceMeters: 7266,
          maxLoads: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
          totalCost: 0,
        },
        skippedMandatoryShipmentCount: 0,
        usedVehicleCount: 1,
        earliestVehicleStartTime: { seconds: '1563102000', nanos: 0 },
        latestVehicleEndTime: { seconds: '1563117780', nanos: 0 },
        totalCost: 132.9532,
        costs: {
          'model.vehicles.cost_per_hour': 131.5,
          'model.vehicles.cost_per_kilometer': 1.4532,
        },
      },
    };
    const shipmentsArr = [
      {
        pickups: [1],
        loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
        id: 1,
        deliveries: [],
        changeTime: 1659106259651,
      },
    ];
    const expectedVisitsArr = [
      {
        id: 1,
        shipmentRouteId: 1,
        shipmentIndex: 0,
        isPickup: true,
        visitRequestIndex: 0,
        startTime: { seconds: '1563105633', nanos: 0 },
        demands: [
          { type: 'volume_liters', value: '20' },
          { type: 'weight_kilograms', value: '100' },
        ],
        detour: { seconds: '2700', nanos: 0 },
        shipmentLabel: '',
        visitLabel: '',
        arrivalLoads: [
          { type: 'volume_liters', value: '0' },
          { type: 'weight_kilograms', value: '0' },
        ],
        loadDemands: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
        changeTime: 1659106303400,
      },
    ];
    const expectedShipmentsRouteArr = [
      {
        vehicleIndex: 0,
        vehicleLabel: '',
        vehicleStartTime: { seconds: '1563102000', nanos: 0 },
        vehicleEndTime: { seconds: '1563117780', nanos: 0 },
        visits: [1],
        transitions: [
          {
            travelDuration: { seconds: '933', nanos: 0 },
            travelDistanceMeters: 3426,
            trafficInfoUnavailable: false,
            breakDuration: { seconds: '2700', nanos: 0 },
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '3633', nanos: 0 },
            startTime: { seconds: '1563102000', nanos: 0 },
            vehicleLoads: { weight_kilograms: { amount: '0' }, volume_liters: { amount: '0' } },
          },
          {
            travelDuration: { seconds: '967', nanos: 0 },
            travelDistanceMeters: 3840,
            trafficInfoUnavailable: false,
            waitDuration: { seconds: '7580', nanos: 0 },
            totalDuration: { seconds: '8547', nanos: 0 },
            startTime: { seconds: '1563109233', nanos: 0 },
            vehicleLoads: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
          },
        ],
        hasTrafficInfeasibilities: false,
        routePolyline: {
          points:
            'sojiHyumMDCDEHKBEDGFKJUJWBEDGHOBEBCDEBALGTnA@H@D@LDV@B@DLj@@F@BHZDLRlAVxADVVtAh@bDDRV|AFZTpAZjBl@jDd@pCF^Hf@TlATpA@JBNF^PdAJf@Fd@P|@Fd@@@Hf@F^RhALt@f@xCTjA^zB^vBPnABJJh@Hj@VvAz@`FZdBSLURON_Az@MJMLc@^]XcA~@uAjAC@OLAXhAvFBD@D@B?Jf@dCNp@RhAd@xBNv@DPP|@Ln@p@bDh@pCd@|Bj@rCRd@BH@JBJXr@Zv@z@|BfArCHXn@`BZx@\\z@L\\HVHNC^AT?PCbBEjA?DE`AAJ?F?D?D@HCDADCLMVCt@Cd@APCVAT?B?FAL?D?F?\\BPBb@PlBBb@?PAt@Ah@Ab@Cf@Ad@GbBAJAHEdAAb@AHEpA?JALDpABpA?LBt@?L@R?H@FBPBLJh@DVXZBHBFBF@FBLBNBN@V@\\@H?T?F?@?BAFADAFADAFCDITeApEU`AQv@CLgA`FWhA[rA[fAId@Ib@U`AOr@a@hBu@bDMh@Op@A?[rA?@EPAHAHAAA?A??AA?A?A?A?A@C?A@?@A?ABA??@A@?@A@A@?BCEKIIIAA}@q@c@[a@YmByAg@]ACOQEACCECYYg@_@s@i@[UyAgAk@a@_As@wAgAGCUQIGMAEWCYAICGKM@E@E?I?G@G?G?MAC?CACACAAACAA?IAGAMEOGQKYO_@Uc@IQGK]o@k@eAc@{@B[DW?CBMZsBBOPeAFa@DYJs@PiAT_BFCBABCBCBEFO?E?EAE?IAGCIJ]FSz@sEj@gDFMF]z@iE`@wBTmAXkCXoCDa@@MBIReCF{@?Y?Q?MCM?MMw@EQQkAEYAWCQSeBCYC[G_@y@wHIm@CSEa@K}@CWe@eECYEYKs@Gi@Ku@Gc@E]C]AMCMGaAGiAWaEAWCk@?CCa@ASCi@Ck@Ak@Cu@?E?AA??AIkCAIAi@A]A]CaAAQGkBEoAASM_ECw@EaACs@CkAA]AOAa@CgAA_@IoBEsACi@EwBA[IcBA]Ao@AQ@YBgCB}B?uA?mA?iB?iB?cA?uAAc@?cB?]@_A@]HwBLeFBoADwB@OBoA@i@@UBO@IBK`@m@TWHIHEXOJITQ',
        },
        breaks: [
          {
            startTime: { seconds: '1563102000', nanos: 0 },
            duration: { seconds: '2700', nanos: 0 },
          },
        ],
        metrics: {
          performedShipmentCount: 1,
          travelDuration: { seconds: '1900', nanos: 0 },
          waitDuration: { seconds: '7580', nanos: 0 },
          delayDuration: { seconds: '0', nanos: 0 },
          breakDuration: { seconds: '2700', nanos: 0 },
          visitDuration: { seconds: '3600', nanos: 0 },
          totalDuration: { seconds: '15780', nanos: 0 },
          travelDistanceMeters: 7266,
          maxLoads: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
          totalCost: 0,
        },
        endLoads: [
          { type: 'volume_liters', value: '20' },
          { type: 'weight_kilograms', value: '100' },
        ],
        vehicleDetour: { seconds: '15780', nanos: 0 },
        routeCosts: {
          'model.vehicles.cost_per_hour': 131.5,
          'model.vehicles.cost_per_kilometer': 1.4532,
        },
        routeTotalCost: 132.9532,
        id: 1,
      },
    ];
    expect(
      _normalizationService.normalizeSolution(solutionTest, [1], shipmentsArr, 1659106303400)
    ).toEqual({
      shipmentRoutes: expectedShipmentsRouteArr,
      visits: expectedVisitsArr,
      skippedShipments: [],
      skippedShipmentReasons: {},
    });
  });

  it('normalizes solution - Skipped Shipment ', () => {
    const testSolution = {
      routes: [
        {
          vehicleIndex: 0,
          vehicleLabel: '',
          vehicleStartTime: { seconds: '1563097800', nanos: 0 },
          vehicleEndTime: { seconds: '1563121735', nanos: 0 },
          visits: [
            {
              shipmentIndex: 0,
              isPickup: true,
              visitRequestIndex: 0,
              startTime: { seconds: '1563098733', nanos: 0 },
              demands: [
                { type: 'volume_liters', value: '20' },
                { type: 'weight_kilograms', value: '100' },
              ],
              detour: { seconds: '0', nanos: 0 },
              shipmentLabel: '',
              visitLabel: '',
              arrivalLoads: [
                { type: 'volume_liters', value: '0' },
                { type: 'weight_kilograms', value: '0' },
              ],
              loadDemands: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
            },
            {
              shipmentIndex: 1,
              isPickup: true,
              visitRequestIndex: 0,
              startTime: { seconds: '1563105931', nanos: 0 },
              demands: [
                { type: 'volume_liters', value: '30' },
                { type: 'weight_kilograms', value: '100' },
              ],
              detour: { seconds: '6441', nanos: 0 },
              shipmentLabel: '',
              visitLabel: '',
              arrivalLoads: [
                { type: 'volume_liters', value: '20' },
                { type: 'weight_kilograms', value: '100' },
              ],
              loadDemands: { volume_liters: { amount: '30' }, weight_kilograms: { amount: '100' } },
            },
            {
              shipmentIndex: 1,
              isPickup: false,
              visitRequestIndex: 0,
              startTime: { seconds: '1563113924', nanos: 0 },
              demands: [
                { type: 'volume_liters', value: '-30' },
                { type: 'weight_kilograms', value: '-100' },
              ],
              detour: { seconds: '0', nanos: 0 },
              shipmentLabel: '',
              visitLabel: '',
              arrivalLoads: [
                { type: 'volume_liters', value: '50' },
                { type: 'weight_kilograms', value: '200' },
              ],
              loadDemands: {
                volume_liters: { amount: '-30' },
                weight_kilograms: { amount: '-100' },
              },
            },
            {
              shipmentIndex: 2,
              isPickup: true,
              visitRequestIndex: 0,
              startTime: { seconds: '1563117954', nanos: 0 },
              demands: [
                { type: 'volume_liters', value: '15' },
                { type: 'weight_kilograms', value: '200' },
              ],
              detour: { seconds: '19005', nanos: 0 },
              shipmentLabel: '',
              visitLabel: '',
              arrivalLoads: [
                { type: 'volume_liters', value: '20' },
                { type: 'weight_kilograms', value: '100' },
              ],
              loadDemands: { volume_liters: { amount: '15' }, weight_kilograms: { amount: '200' } },
            },
          ],
          transitions: [
            {
              travelDuration: { seconds: '933', nanos: 0 },
              travelDistanceMeters: 3426,
              trafficInfoUnavailable: false,
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '933', nanos: 0 },
              startTime: { seconds: '1563097800', nanos: 0 },
              vehicleLoads: { weight_kilograms: { amount: '0' }, volume_liters: { amount: '0' } },
            },
            {
              travelDuration: { seconds: '898', nanos: 0 },
              travelDistanceMeters: 4329,
              trafficInfoUnavailable: false,
              breakDuration: { seconds: '2700', nanos: 0 },
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '3598', nanos: 0 },
              startTime: { seconds: '1563102333', nanos: 0 },
              vehicleLoads: {
                weight_kilograms: { amount: '100' },
                volume_liters: { amount: '20' },
              },
            },
            {
              travelDuration: { seconds: '793', nanos: 0 },
              travelDistanceMeters: 4806,
              trafficInfoUnavailable: false,
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '793', nanos: 0 },
              startTime: { seconds: '1563113131', nanos: 0 },
              vehicleLoads: {
                weight_kilograms: { amount: '200' },
                volume_liters: { amount: '50' },
              },
            },
            {
              travelDuration: { seconds: '430', nanos: 0 },
              travelDistanceMeters: 1348,
              trafficInfoUnavailable: false,
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '430', nanos: 0 },
              startTime: { seconds: '1563117524', nanos: 0 },
              vehicleLoads: {
                weight_kilograms: { amount: '100' },
                volume_liters: { amount: '20' },
              },
            },
            {
              travelDuration: { seconds: '1081', nanos: 0 },
              travelDistanceMeters: 4261,
              trafficInfoUnavailable: false,
              waitDuration: { seconds: '0', nanos: 0 },
              totalDuration: { seconds: '1081', nanos: 0 },
              startTime: { seconds: '1563120654', nanos: 0 },
              vehicleLoads: {
                weight_kilograms: { amount: '300' },
                volume_liters: { amount: '35' },
              },
            },
          ],
          hasTrafficInfeasibilities: false,
          routePolyline: {
            points:
              'sojiHyumMDCDEHKBEDGFKJUJWBEDGHOBEBCDEBALGTnA@H@D@LDV@B@DLj@@F@BHZDLRlAVxADVVtAh@bDDRV|AFZTpAZjBl@jDd@pCF^Hf@TlATpA@JBNF^PdAJf@Fd@P|@Fd@@@Hf@F^RhALt@f@xCTjA^zB^vBPnABJJh@Hj@VvAz@`FZdBSLURON_Az@MJMLc@^]XcA~@uAjAC@OLAXhAvFBD@D@B?Jf@dCNp@RhAd@xBNv@DPP|@Ln@p@bDh@pCd@|Bj@rCRd@BH@JBJXr@Zv@z@|BfArCHXn@`BZx@\\z@L\\HVHNC^AT?PCbBEjA?DE`AAJ?F?D?D@HCDADCLMVCt@Cd@APCVAT?B?FAL?D?F?\\BPBb@PlBBb@?PAt@Ah@Ab@Cf@Ad@GbBAJAHEdAAb@AHEpA?JALDpABpA?LBt@?L@R?H@FBPBLJh@DVXZBHBFBF@FBLBNBN@V@\\@H?T?F?@?BAFADAFADAFCDITeApEU`AQv@CLgA`FWhA[rA[fAId@Ib@U`AOr@a@hBu@bDMh@Op@A?[rA?@EPAHAHAAA?A??AA?A?A?A?A@C?A@?@A?ABA??@A@?@A@A@?BAD?B?@?B?@?@?@?@?@@@?@?@@@?@?@@@?@BDDB@?@@@?@?@?@?@?@A@?@??A@?@A?A@??A@A?A@??A@CPLRNNJPL~AjAjEbD`@\\^V~@r@NJNLHB@R?\\?x@AxD?d@h@Kv@Q?T?JBLRbASXFh@DbAFjA@RF|ABt@N`DD`@Df@B^h@A`CIj@C|@E\\AbDMN?PA|BIn@CTAr@Cf@ALEL?P_@dBhANHZTnBpApChBLFPLTNl@d@f@\\pAz@@?LFP@R@NGD?DAJ?jADvAJN?t@Fb@Bt@DJ@F?~@D@?|AJ|@FZB\\?N@RB`@Bt@D@?N@fAH^@L@P@VBF??dC?Z?D?R?LBlB?F?JBXDd@DV@HRfB@T@V@ZBx@@p@@|@@`A?x@DhE?z@@bBBpC?h@@xBB\\?f@BxC@nA@`C@h@?p@?jA?\\CVAF?H?v@BbAFrAFfBJtB?RT~BFd@Fb@f@zCd@tBXbARt@FRL`@DHL^Td@N^DHFLR`@BF@?@BBDJRZf@j@|@L\\BHBFHLHL@BT\\HLRX@@BFT\\?@z@tA@BZf@r@hA?@Xd@Xd@V^Zh@JNLRHLLTBDLRDFd@r@FJBDHJFHFFFBJBLRDHXf@HRV\\@BLLFJJJPPTTTPJHPJHDHDTJPDPF`@Jb@NLHDBn@R@@TJJDLFHFNFNFTL\\b@Z`@Vb@YXORMJ_@^]^[Vg@f@QPCBMLON]\\}@z@ST]\\C@EDKHA@A@A@A?E@E?G?CACACCCESYGMaAwAMSIIIMIIY_@OSUUIKGKCEGO_@c@_BuBMEAACCKM[_@AAQU[c@Y][a@AAqAcBUWEI]a@?AMOAAW_@CC?AII?AUYAAGKW[EEEGAA?AKMGIsAgB[c@oAcBaAyAg@{@EKEKIWEMGSK_@GWEOGYKg@G]Mk@Qu@Q_AQw@?AI[Mk@G[ACIk@EYKy@UiBKu@Ky@Io@Kw@AGCOIy@Ge@MyA?AGs@Eu@Gs@C]YyDC[YeDO{AAQAQASAK?EASA[CwBG{JCo@E]?q@CiDA}@?A?u@Aw@?u@CmB?u@Au@?]?Y?AAs@?u@Aw@Au@?u@CmB?u@AmBAu@Au@AoBAkBAmBAu@CeD?[Aq@?{@As@?m@BU@QAyA?KF{@@SBU@K@OBKBOJo@B_@Py@f@_Cy@g@BO@O?K?OCOAMEKEIAEAAIIe@]OIu@g@u@c@SMs@[EAK?I@IBEBGDEDEFEHADAB}@u@eCaBu@g@kBoAo@e@b@iBp@}C~@aEP{@TaAHg@ZcB@KH]V_A?AFUPk@|@cD{AwA[[ZZzAvATi@BGNYLe@`@}@b@iA^}@bAgC@IhAsC`@_Ab@mAb@kAXo@Pc@?ALYFQn@gB@?DOXy@h@sA\\cANe@BG?G@E?G?Sh@KFm@ZmBJq@BMb@oCF]`@wBBG?Oh@{CFc@R_AJg@PiAT}AJg@VeBrAl@XLj@RTHHBVJXJTJd@Pr@Xr@Xd@Rl@Vt@\\BW\\}CHy@Da@LmANwALmAHi@j@oCt@mEFYn@qDJWNy@RgAHk@TyAVwACGISGKACAACAACYMo@W_D}Ag@[}CwAeBy@kBy@AAGEA?UKyAq@MIqCoA}Au@_Bu@}As@uCsAw@]QKoCoAqB}@qAo@wAo@iAi@aAc@MGe@Ww@]q@Yi@Y_A_@q@[kAk@e@QcCgAgAe@OIQKaAe@c@SeBw@g@WcAe@yCuAOGs@]WKSMk@Wo@Y_Bw@GGg@WOKc@[?cAAK?qA@[@S@MDWJ_@BU[WC??ACCEKEIACKOMUUe@MYm@kA?A?A?A?A?C?AA?IQA?AAA?A?A?A?A?A?CGEIEGGEGCOGIC]OICAAA?A?C@A?A@m@[KGGEUK_@QKGWMs@_@a@So@[w@a@eAi@MIQMo@e@EQCKCKGKCECC[a@SYGIgCeDaAqAQUKMu@_AkAyAMMc@g@m@w@G[WYY]cCcDsAcBaAqA[e@Ya@U[GMGMO]TWHIHEXOJITQ',
          },
          breaks: [
            {
              startTime: { seconds: '1563102333', nanos: 0 },
              duration: { seconds: '2700', nanos: 0 },
            },
          ],
          metrics: {
            performedShipmentCount: 3,
            travelDuration: { seconds: '4135', nanos: 0 },
            waitDuration: { seconds: '0', nanos: 0 },
            delayDuration: { seconds: '0', nanos: 0 },
            breakDuration: { seconds: '2700', nanos: 0 },
            visitDuration: { seconds: '17100', nanos: 0 },
            totalDuration: { seconds: '23935', nanos: 0 },
            travelDistanceMeters: 18170,
            maxLoads: { volume_liters: { amount: '50' }, weight_kilograms: { amount: '300' } },
            totalCost: 0,
          },
          endLoads: [
            { type: 'volume_liters', value: '35' },
            { type: 'weight_kilograms', value: '300' },
          ],
          vehicleDetour: { seconds: '23935', nanos: 0 },
          routeCosts: {
            'model.vehicles.cost_per_hour': 199.45833333333334,
            'model.vehicles.cost_per_kilometer': 3.634,
          },
          routeTotalCost: 203.09233333333333,
        },
      ],
      totalCost: 203.09233333333333,
      requestLabel: '',
      skippedShipments: [
        {
          index: 3,
          label: '',
          reasons: [
            {
              exampleExceededCapacityType: '',
            },
          ],
        },
      ],
      metrics: {
        aggregatedRouteMetrics: {
          performedShipmentCount: 3,
          travelDuration: { seconds: '4135', nanos: 0 },
          waitDuration: { seconds: '0', nanos: 0 },
          delayDuration: { seconds: '0', nanos: 0 },
          breakDuration: { seconds: '2700', nanos: 0 },
          visitDuration: { seconds: '17100', nanos: 0 },
          totalDuration: { seconds: '23935', nanos: 0 },
          travelDistanceMeters: 18170,
          maxLoads: { weight_kilograms: { amount: '300' }, volume_liters: { amount: '50' } },
          totalCost: 0,
        },
        skippedMandatoryShipmentCount: 1,
        usedVehicleCount: 1,
        earliestVehicleStartTime: { seconds: '1563097800', nanos: 0 },
        latestVehicleEndTime: { seconds: '1563121735', nanos: 0 },
        totalCost: 203.09233333333333,
        costs: {
          'model.vehicles.cost_per_hour': 3.634,
          'model.vehicles.cost_per_kilometer': 199.45833333333334,
        },
      },
    };
    const shipmentsArr = [
      {
        pickups: [1],
        loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '20' } },
        id: 1,
        deliveries: [],
        changeTime: 1659120171057,
      },
      {
        pickups: [3],
        loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '30' } },
        id: 2,
        deliveries: [4],
        changeTime: 1659120171057,
      },
      {
        pickups: [6],
        loadDemands: { weight_kilograms: { amount: '200' }, volume_liters: { amount: '15' } },
        id: 3,
        deliveries: [],
        changeTime: 1659120171057,
      },
      {
        pickups: [10],
        loadDemands: { weight_kilograms: { amount: '100' }, volume_liters: { amount: '25' } },
        id: 5,
        deliveries: [],
        changeTime: 1659120171057,
      },
    ];
    const expectedVisitsArr = [
      {
        id: 1,
        shipmentRouteId: 1,
        shipmentIndex: 0,
        isPickup: true,
        visitRequestIndex: 0,
        startTime: { seconds: '1563098733', nanos: 0 },
        demands: [
          { type: 'volume_liters', value: '20' },
          { type: 'weight_kilograms', value: '100' },
        ],
        detour: { seconds: '0', nanos: 0 },
        shipmentLabel: '',
        visitLabel: '',
        arrivalLoads: [
          { type: 'volume_liters', value: '0' },
          { type: 'weight_kilograms', value: '0' },
        ],
        loadDemands: { volume_liters: { amount: '20' }, weight_kilograms: { amount: '100' } },
        changeTime: 1659120207171,
      },
      {
        id: 3,
        shipmentRouteId: 1,
        shipmentIndex: 1,
        isPickup: true,
        visitRequestIndex: 0,
        startTime: { seconds: '1563105931', nanos: 0 },
        demands: [
          { type: 'volume_liters', value: '30' },
          { type: 'weight_kilograms', value: '100' },
        ],
        detour: { seconds: '6441', nanos: 0 },
        shipmentLabel: '',
        visitLabel: '',
        arrivalLoads: [
          { type: 'volume_liters', value: '20' },
          { type: 'weight_kilograms', value: '100' },
        ],
        loadDemands: { volume_liters: { amount: '30' }, weight_kilograms: { amount: '100' } },
        changeTime: 1659120207171,
      },
      {
        id: 4,
        shipmentRouteId: 1,
        shipmentIndex: 1,
        isPickup: false,
        visitRequestIndex: 0,
        startTime: { seconds: '1563113924', nanos: 0 },
        demands: [
          { type: 'volume_liters', value: '-30' },
          { type: 'weight_kilograms', value: '-100' },
        ],
        detour: { seconds: '0', nanos: 0 },
        shipmentLabel: '',
        visitLabel: '',
        arrivalLoads: [
          { type: 'volume_liters', value: '50' },
          { type: 'weight_kilograms', value: '200' },
        ],
        loadDemands: { volume_liters: { amount: '-30' }, weight_kilograms: { amount: '-100' } },
        changeTime: 1659120207171,
      },
      {
        id: 6,
        shipmentRouteId: 1,
        shipmentIndex: 2,
        isPickup: true,
        visitRequestIndex: 0,
        startTime: { seconds: '1563117954', nanos: 0 },
        demands: [
          { type: 'volume_liters', value: '15' },
          { type: 'weight_kilograms', value: '200' },
        ],
        detour: { seconds: '19005', nanos: 0 },
        shipmentLabel: '',
        visitLabel: '',
        arrivalLoads: [
          { type: 'volume_liters', value: '20' },
          { type: 'weight_kilograms', value: '100' },
        ],
        loadDemands: { volume_liters: { amount: '15' }, weight_kilograms: { amount: '200' } },
        changeTime: 1659120207171,
      },
    ];
    const expectedShipmentsRouteArr = [
      {
        vehicleIndex: 0,
        vehicleLabel: '',
        vehicleStartTime: { seconds: '1563097800', nanos: 0 },
        vehicleEndTime: { seconds: '1563121735', nanos: 0 },
        visits: [1, 3, 4, 6],
        transitions: [
          {
            travelDuration: { seconds: '933', nanos: 0 },
            travelDistanceMeters: 3426,
            trafficInfoUnavailable: false,
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '933', nanos: 0 },
            startTime: { seconds: '1563097800', nanos: 0 },
            vehicleLoads: { weight_kilograms: { amount: '0' }, volume_liters: { amount: '0' } },
          },
          {
            travelDuration: { seconds: '898', nanos: 0 },
            travelDistanceMeters: 4329,
            trafficInfoUnavailable: false,
            breakDuration: { seconds: '2700', nanos: 0 },
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '3598', nanos: 0 },
            startTime: { seconds: '1563102333', nanos: 0 },
            vehicleLoads: {
              weight_kilograms: { amount: '100' },
              volume_liters: { amount: '20' },
            },
          },
          {
            travelDuration: { seconds: '793', nanos: 0 },
            travelDistanceMeters: 4806,
            trafficInfoUnavailable: false,
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '793', nanos: 0 },
            startTime: { seconds: '1563113131', nanos: 0 },
            vehicleLoads: {
              weight_kilograms: { amount: '200' },
              volume_liters: { amount: '50' },
            },
          },
          {
            travelDuration: { seconds: '430', nanos: 0 },
            travelDistanceMeters: 1348,
            trafficInfoUnavailable: false,
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '430', nanos: 0 },
            startTime: { seconds: '1563117524', nanos: 0 },
            vehicleLoads: {
              weight_kilograms: { amount: '100' },
              volume_liters: { amount: '20' },
            },
          },
          {
            travelDuration: { seconds: '1081', nanos: 0 },
            travelDistanceMeters: 4261,
            trafficInfoUnavailable: false,
            waitDuration: { seconds: '0', nanos: 0 },
            totalDuration: { seconds: '1081', nanos: 0 },
            startTime: { seconds: '1563120654', nanos: 0 },
            vehicleLoads: {
              weight_kilograms: { amount: '300' },
              volume_liters: { amount: '35' },
            },
          },
        ],
        hasTrafficInfeasibilities: false,
        routePolyline: {
          points:
            'sojiHyumMDCDEHKBEDGFKJUJWBEDGHOBEBCDEBALGTnA@H@D@LDV@B@DLj@@F@BHZDLRlAVxADVVtAh@bDDRV|AFZTpAZjBl@jDd@pCF^Hf@TlATpA@JBNF^PdAJf@Fd@P|@Fd@@@Hf@F^RhALt@f@xCTjA^zB^vBPnABJJh@Hj@VvAz@`FZdBSLURON_Az@MJMLc@^]XcA~@uAjAC@OLAXhAvFBD@D@B?Jf@dCNp@RhAd@xBNv@DPP|@Ln@p@bDh@pCd@|Bj@rCRd@BH@JBJXr@Zv@z@|BfArCHXn@`BZx@\\z@L\\HVHNC^AT?PCbBEjA?DE`AAJ?F?D?D@HCDADCLMVCt@Cd@APCVAT?B?FAL?D?F?\\BPBb@PlBBb@?PAt@Ah@Ab@Cf@Ad@GbBAJAHEdAAb@AHEpA?JALDpABpA?LBt@?L@R?H@FBPBLJh@DVXZBHBFBF@FBLBNBN@V@\\@H?T?F?@?BAFADAFADAFCDITeApEU`AQv@CLgA`FWhA[rA[fAId@Ib@U`AOr@a@hBu@bDMh@Op@A?[rA?@EPAHAHAAA?A??AA?A?A?A?A@C?A@?@A?ABA??@A@?@A@A@?BAD?B?@?B?@?@?@?@?@@@?@?@@@?@?@@@?@BDDB@?@@@?@?@?@?@?@A@?@??A@?@A?A@??A@A?A@??A@CPLRNNJPL~AjAjEbD`@\\^V~@r@NJNLHB@R?\\?x@AxD?d@h@Kv@Q?T?JBLRbASXFh@DbAFjA@RF|ABt@N`DD`@Df@B^h@A`CIj@C|@E\\AbDMN?PA|BIn@CTAr@Cf@ALEL?P_@dBhANHZTnBpApChBLFPLTNl@d@f@\\pAz@@?LFP@R@NGD?DAJ?jADvAJN?t@Fb@Bt@DJ@F?~@D@?|AJ|@FZB\\?N@RB`@Bt@D@?N@fAH^@L@P@VBF??dC?Z?D?R?LBlB?F?JBXDd@DV@HRfB@T@V@ZBx@@p@@|@@`A?x@DhE?z@@bBBpC?h@@xBB\\?f@BxC@nA@`C@h@?p@?jA?\\CVAF?H?v@BbAFrAFfBJtB?RT~BFd@Fb@f@zCd@tBXbARt@FRL`@DHL^Td@N^DHFLR`@BF@?@BBDJRZf@j@|@L\\BHBFHLHL@BT\\HLRX@@BFT\\?@z@tA@BZf@r@hA?@Xd@Xd@V^Zh@JNLRHLLTBDLRDFd@r@FJBDHJFHFFFBJBLRDHXf@HRV\\@BLLFJJJPPTTTPJHPJHDHDTJPDPF`@Jb@NLHDBn@R@@TJJDLFHFNFNFTL\\b@Z`@Vb@YXORMJ_@^]^[Vg@f@QPCBMLON]\\}@z@ST]\\C@EDKHA@A@A@A?E@E?G?CACACCCESYGMaAwAMSIIIMIIY_@OSUUIKGKCEGO_@c@_BuBMEAACCKM[_@AAQU[c@Y][a@AAqAcBUWEI]a@?AMOAAW_@CC?AII?AUYAAGKW[EEEGAA?AKMGIsAgB[c@oAcBaAyAg@{@EKEKIWEMGSK_@GWEOGYKg@G]Mk@Qu@Q_AQw@?AI[Mk@G[ACIk@EYKy@UiBKu@Ky@Io@Kw@AGCOIy@Ge@MyA?AGs@Eu@Gs@C]YyDC[YeDO{AAQAQASAK?EASA[CwBG{JCo@E]?q@CiDA}@?A?u@Aw@?u@CmB?u@Au@?]?Y?AAs@?u@Aw@Au@?u@CmB?u@AmBAu@Au@AoBAkBAmBAu@CeD?[Aq@?{@As@?m@BU@QAyA?KF{@@SBU@K@OBKBOJo@B_@Py@f@_Cy@g@BO@O?K?OCOAMEKEIAEAAIIe@]OIu@g@u@c@SMs@[EAK?I@IBEBGDEDEFEHADAB}@u@eCaBu@g@kBoAo@e@b@iBp@}C~@aEP{@TaAHg@ZcB@KH]V_A?AFUPk@|@cD{AwA[[ZZzAvATi@BGNYLe@`@}@b@iA^}@bAgC@IhAsC`@_Ab@mAb@kAXo@Pc@?ALYFQn@gB@?DOXy@h@sA\\cANe@BG?G@E?G?Sh@KFm@ZmBJq@BMb@oCF]`@wBBG?Oh@{CFc@R_AJg@PiAT}AJg@VeBrAl@XLj@RTHHBVJXJTJd@Pr@Xr@Xd@Rl@Vt@\\BW\\}CHy@Da@LmANwALmAHi@j@oCt@mEFYn@qDJWNy@RgAHk@TyAVwACGISGKACAACAACYMo@W_D}Ag@[}CwAeBy@kBy@AAGEA?UKyAq@MIqCoA}Au@_Bu@}As@uCsAw@]QKoCoAqB}@qAo@wAo@iAi@aAc@MGe@Ww@]q@Yi@Y_A_@q@[kAk@e@QcCgAgAe@OIQKaAe@c@SeBw@g@WcAe@yCuAOGs@]WKSMk@Wo@Y_Bw@GGg@WOKc@[?cAAK?qA@[@S@MDWJ_@BU[WC??ACCEKEIACKOMUUe@MYm@kA?A?A?A?A?C?AA?IQA?AAA?A?A?A?A?A?CGEIEGGEGCOGIC]OICAAA?A?C@A?A@m@[KGGEUK_@QKGWMs@_@a@So@[w@a@eAi@MIQMo@e@EQCKCKGKCECC[a@SYGIgCeDaAqAQUKMu@_AkAyAMMc@g@m@w@G[WYY]cCcDsAcBaAqA[e@Ya@U[GMGMO]TWHIHEXOJITQ',
        },
        breaks: [
          {
            startTime: { seconds: '1563102333', nanos: 0 },
            duration: { seconds: '2700', nanos: 0 },
          },
        ],
        metrics: {
          performedShipmentCount: 3,
          travelDuration: { seconds: '4135', nanos: 0 },
          waitDuration: { seconds: '0', nanos: 0 },
          delayDuration: { seconds: '0', nanos: 0 },
          breakDuration: { seconds: '2700', nanos: 0 },
          visitDuration: { seconds: '17100', nanos: 0 },
          totalDuration: { seconds: '23935', nanos: 0 },
          travelDistanceMeters: 18170,
          maxLoads: { volume_liters: { amount: '50' }, weight_kilograms: { amount: '300' } },
          totalCost: 0,
        },
        endLoads: [
          { type: 'volume_liters', value: '35' },
          { type: 'weight_kilograms', value: '300' },
        ],
        vehicleDetour: { seconds: '23935', nanos: 0 },
        routeCosts: {
          'model.vehicles.cost_per_hour': 199.45833333333334,
          'model.vehicles.cost_per_kilometer': 3.634,
        },
        routeTotalCost: 203.09233333333333,
        id: 1,
      },
    ];
    expect(
      _normalizationService.normalizeSolution(testSolution, [1], shipmentsArr, 1659120207171)
    ).toEqual({
      shipmentRoutes: expectedShipmentsRouteArr,
      visits: expectedVisitsArr,
      skippedShipments: [5],
      skippedShipmentReasons: {
        5: [{ exampleExceededCapacityType: '' }],
      },
    });
  });

  it('normalizes injected solution ', () => {
    const testInjectedSolution: IInjectedSolution = {
      routes: [],
      skippedShipments: [],
      constraintRelaxations: [
        {
          relaxations: [
            {
              level: RelaxationLevel.RELAX_VISIT_TIMES_AFTER_THRESHOLD,
              thresholdTime: {
                seconds: '2700',
                nanos: 0,
              },
              thresholdVisitCount: 1,
            },
          ],
          vehicleIndices: [0],
        },
      ],
    };
    const testVehicles = [
      {
        id: 1,
        startWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        endWaypoint: {
          location: {
            latLng: {
              latitude: 48.883332,
              longitude: 2.369089,
            },
          },
        },
        startTimeWindows: [
          {
            startTime: {
              seconds: '1563097800',
            },
            endTime: {
              seconds: '1563102000',
            },
          },
        ],
        endTimeWindows: [
          {
            startTime: {
              seconds: '1563117780',
            },
            endTime: {
              seconds: '1563121980',
            },
          },
        ],
        costPerHour: 30,
        costPerKilometer: 0.2,
        usedIfRouteIsEmpty: true,
        travelDurationLimit: {},
        breakRule: {
          breakRequests: [
            {
              earliestStartTime: {
                seconds: '1563102000',
              },
              latestStartTime: {
                seconds: '1563109200',
              },
              minDuration: {
                seconds: '2700',
              },
            },
          ],
        },

        loadLimits: {
          weight_kilograms: {
            maxLoad: '400',
            startLoadInterval: {},
            endLoadInterval: {},
          },
          volume_liters: {
            maxLoad: '50',
            startLoadInterval: {},
            endLoadInterval: {},
          },
        },
      },
    ];
    expect(
      _normalizationService.normalizeInjectedSolution(testInjectedSolution, testVehicles)
    ).toEqual({
      routes: [],
      skippedShipments: [],
      constraintRelaxations: [
        {
          relaxations: [
            {
              level: Level.RELAX_VISIT_TIMES_AFTER_THRESHOLD,
              thresholdTime: {
                seconds: '2700',
                nanos: 0,
              },
              thresholdVisitCount: 1,
            },
          ],
          vehicleIndices: [1],
        },
      ],
    });
  });

  it('normalizes scenario with Shipment - visit request - Arrival Waypoint - delete - Arrival Location', () => {
    model.shipments = [
      {
        pickups: [
          {
            arrivalLocation: {
              latitude: 48.878454159723745,
              longitude: 2.330904891015635,
            },
            tags: [],
            timeWindows: [
              {
                endTime: {
                  seconds: '1563112800',
                },
              },
            ],
            duration: { seconds: '3600' },
            cost: 0.25,
            visitTypes: ['Visit Type1'],
            label: 'Pickup Request 1',
          },
        ],
        allowedVehicleIndices: [],
        shipmentType: 'Shipment Type1',
        label: 'Shipment Label 1',
        loadDemands: { weight: { amount: '200' } },
      },
    ];
    scenario.model = model;
    expect(
      _normalizationService.normalizeScenario(scenario, 0).visitRequests[0].arrivalLocation
    ).toEqual(undefined);
  });
});
