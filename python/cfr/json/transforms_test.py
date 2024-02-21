# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

import copy
import unittest

from . import cfr_json
from . import transforms


class MakeAllShipmentsOptional(unittest.TestCase):
  """Tests for make_all_shipments_optional."""

  maxDiff = None

  def test_no_shipments(self):
    model: cfr_json.ShipmentModel = {}
    transforms.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(model, {})

  def test_default_num_items(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002"},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    transforms.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 1000},
                {"label": "S0003,S0004,S0005", "penaltyCost": 1000},
            ]
        },
    )

  def test_with_num_elements_in_label(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002"},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    transforms.make_all_shipments_optional(
        model, cost=1000, get_num_items=cfr_json.get_num_elements_in_label
    )
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 1000},
                {"label": "S0003,S0004,S0005", "penaltyCost": 3000},
            ]
        },
    )

  def test_with_existing_optional_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002", "penaltyCost": 12345},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    transforms.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 12345},
                {"label": "S0003,S0004,S0005", "penaltyCost": 1000},
            ]
        },
    )


class DuplicateVehicleTest(unittest.TestCase):
  """Tests for duplicate_vehicle."""

  maxDiff = None

  _MODEL: cfr_json.ShipmentModel = {
      "shipments": [
          {"label": "S001", "allowedVehicleIndices": [1]},
          {
              "label": "S002",
              "costsPerVehicle": [100],
              "costsPerVehicleIndices": [1],
          },
      ],
      "vehicles": [
          {
              "label": "V001",
              "costPerKilometer": 5,
              "costPerHour": 180,
          },
          {
              "label": "V002",
              "costPerHour": 60,
          },
      ],
  }

  def test_duplicate_simple_vehicle(self):
    model = copy.deepcopy(self._MODEL)

    transforms.duplicate_vehicle(model, 0)
    transforms.duplicate_vehicle(model, 0)
    self.assertEqual(model["shipments"], self._MODEL["shipments"])
    self.assertSequenceEqual(
        model["vehicles"],
        (
            *self._MODEL["vehicles"],
            {
                "label": "V001 #1",
                "costPerKilometer": 5,
                "costPerHour": 180,
            },
            {
                "label": "V001 #2",
                "costPerKilometer": 5,
                "costPerHour": 180,
            },
        ),
    )

  def test_duplicate_with_allowed_vehicle_indices_and_sparse_costs(self):
    model = copy.deepcopy(self._MODEL)

    transforms.duplicate_vehicle(model, 1)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100, 100],
                    "costsPerVehicleIndices": [1, 2],
                },
            ],
            "vehicles": [
                {
                    "label": "V001",
                    "costPerKilometer": 5,
                    "costPerHour": 180,
                },
                {
                    "label": "V002",
                    "costPerHour": 60,
                },
                {
                    "label": "V002 #1",
                    "costPerHour": 60,
                },
            ],
        },
    )

  def test_duplicate_with_dense_costs(self):
    original_model = copy.deepcopy(self._MODEL)
    original_model["shipments"].append(
        {"label": "S003", "costsPerVehicle": [30, 50]}
    )
    model = copy.deepcopy(original_model)

    transforms.duplicate_vehicle(model, 0)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
                {"label": "S003", "costsPerVehicle": [30, 50, 30]},
            ],
            "vehicles": [
                {
                    "label": "V001",
                    "costPerKilometer": 5,
                    "costPerHour": 180,
                },
                {"label": "V002", "costPerHour": 60},
                {
                    "label": "V001 #1",
                    "costPerKilometer": 5,
                    "costPerHour": 180,
                },
            ],
        },
    )


class RemoveVehiclesTest(unittest.TestCase):
  """Tests for remove_vehicles."""

  maxDiff = None

  _MODEL: cfr_json.ShipmentModel = {
      "shipments": [
          {"label": "S001", "allowedVehicleIndices": [1]},
          {
              "label": "S002",
              "costsPerVehicle": [100],
              "costsPerVehicleIndices": [0],
              "allowedVehicleIndices": [1, 2],
          },
          {
              "label": "S003",
              "costsPerVehicle": [100, 200, 300],
          },
      ],
      "vehicles": [
          {
              "label": "V001",
              "costPerKilometer": 5,
              "costPerHour": 180,
          },
          {
              "label": "V002",
              "costPerHour": 60,
          },
          {
              "label": "V003",
              "costPerHour": 80,
          },
      ],
  }

  def test_remove_one_vehicle(self):
    model = copy.deepcopy(self._MODEL)
    transforms.remove_vehicles(model, (0,))
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {
                    "label": "S002",
                    "allowedVehicleIndices": [0, 1],
                },
                {
                    "label": "S003",
                    "costsPerVehicle": [200, 300],
                },
            ],
            "vehicles": [
                {
                    "label": "V002",
                    "costPerHour": 60,
                },
                {
                    "label": "V003",
                    "costPerHour": 80,
                },
            ],
        },
    )

  def test_remove_another_vehicle(self):
    model = copy.deepcopy(self._MODEL)
    transforms.remove_vehicles(model, (2,))
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                    "allowedVehicleIndices": [1],
                },
                {
                    "label": "S003",
                    "costsPerVehicle": [100, 200],
                },
            ],
            "vehicles": [
                {
                    "label": "V001",
                    "costPerKilometer": 5,
                    "costPerHour": 180,
                },
                {
                    "label": "V002",
                    "costPerHour": 60,
                },
            ],
        },
    )

  def test_remove_multiple_vehicles(self):
    model = copy.deepcopy(self._MODEL)
    transforms.remove_vehicles(model, (0, 2))
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {
                    "label": "S002",
                    "allowedVehicleIndices": [0],
                },
                {
                    "label": "S003",
                    "costsPerVehicle": [200],
                },
            ],
            "vehicles": [
                {
                    "label": "V002",
                    "costPerHour": 60,
                },
            ],
        },
    )

  def test_infeasible_shipment(self):
    model = copy.deepcopy(self._MODEL)
    with self.assertRaisesRegex(ValueError, "becomes infeasible"):
      transforms.remove_vehicles(model, (1,))

  def test_remove_infeasible_shipment(self):
    model = copy.deepcopy(self._MODEL)
    transforms.remove_vehicles(
        model, (1,), transforms.OnInfeasibleShipment.REMOVE
    )
    self.assertEqual(
        model,
        {
            "shipments": [
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                    "allowedVehicleIndices": [1],
                },
                {
                    "label": "S003",
                    "costsPerVehicle": [100, 300],
                },
            ],
            "vehicles": [
                {
                    "label": "V001",
                    "costPerKilometer": 5,
                    "costPerHour": 180,
                },
                {
                    "label": "V003",
                    "costPerHour": 80,
                },
            ],
        },
    )


class RemoveVehiclesFromInjectedFirstSolutionRoutesTest(unittest.TestCase):
  """Tests for remove_vehicles_from_injected_first_solution_routes."""

  maxDiff = None

  def test_no_injected_first_solution(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "vehicles": [
                {"label": "V001"},
                {"label": "V002"},
                {"label": "V003"},
            ]
        }
    }
    expected_request = copy.deepcopy(request)
    transforms.remove_vehicles_from_injected_first_solution_routes(
        request, {0: 0, 2: 1, 3: 2}
    )
    self.assertEqual(request, expected_request)

  def test_remove_some_vehicles(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "vehicles": [
                {"label": "V001"},
                {"label": "V002"},
                {"label": "V003"},
            ]
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001"},
            {"vehicleIndex": 1, "vehicleLabel": "V004"},
            {"vehicleIndex": 5, "vehicleLabel": "V007"},
        ],
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "vehicles": [
                {"label": "V001"},
                {"label": "V002"},
                {"label": "V003"},
            ]
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleIndex": 1, "vehicleLabel": "V004"},
            {"vehicleIndex": 2, "vehicleLabel": "V007"},
        ],
    }
    transforms.remove_vehicles_from_injected_first_solution_routes(
        request, {1: 1, 5: 2}
    )
    self.assertEqual(request, expected_request)


class SoftenShipmentAllowedVehicleIndicesTest(unittest.TestCase):
  """Tests for soften_shipment_allowed_vehicle_indices."""

  maxDiff = None

  def test_negative_cost(self):
    with self.assertRaises(ValueError):
      transforms.soften_shipment_allowed_vehicle_indices(
          {}, cost=-1, num_vehicles=2
      )

  def test_no_allowed_vehicle_indices(self):
    shipment: cfr_json.Shipment = {"label": "S002"}
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=100, num_vehicles=2
    )
    self.assertEqual(shipment, {"label": "S002"})

  def test_zero_cost(self):
    shipment: cfr_json.Shipment = {
        "label": "S001",
        "allowedVehicleIndices": [0, 1, 2, 3],
    }
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=0, num_vehicles=10
    )
    self.assertEqual(shipment, {"label": "S001"})

  def test_with_cost_and_no_existing_costs(self):
    shipment: cfr_json.Shipment = {
        "label": "S003",
        "allowedVehicleIndices": [2, 3],
    }
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=10, num_vehicles=5
    )
    self.assertEqual(
        shipment,
        {
            "label": "S003",
            "costsPerVehicle": [10, 10, 10],
            "costsPerVehicleIndices": [0, 1, 4],
        },
    )

  def test_with_cost_and_existing_costs_with_indices(self):
    shipment: cfr_json.Shipment = {
        "label": "S003",
        "allowedVehicleIndices": [2, 3, 5],
        "costsPerVehicle": [100, 300, 400],
        "costsPerVehicleIndices": [1, 3, 4],
    }
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=10, num_vehicles=7
    )
    self.assertEqual(
        shipment,
        {
            "label": "S003",
            "costsPerVehicle": [10, 110, 300, 410, 10],
            "costsPerVehicleIndices": [0, 1, 3, 4, 6],
        },
    )

  def test_with_cost_and_existing_costs_without_indices(self):
    shipment: cfr_json.Shipment = {
        "label": "S003",
        "allowedVehicleIndices": [2, 3],
        "costsPerVehicle": [100, 200, 300, 400, 500],
    }
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=10, num_vehicles=5
    )
    self.assertEqual(
        shipment,
        {
            "label": "S003",
            "costsPerVehicle": [110, 210, 300, 400, 510],
        },
    )

  def test_adding_cost_to_all_vehicles(self):
    shipment: cfr_json.Shipment = {
        "label": "S003",
        "allowedVehicleIndices": [2, 3],
        "costsPerVehicle": [200, 300, 400],
        "costsPerVehicleIndices": [2, 3, 4],
    }
    transforms.soften_shipment_allowed_vehicle_indices(
        shipment, cost=10, num_vehicles=5
    )
    self.assertEqual(
        shipment,
        {
            "label": "S003",
            "costsPerVehicle": [10, 10, 200, 300, 410],
        },
    )


class SoftenAllowedVehicleIndicesTest(unittest.TestCase):
  """Tests for soften_allowed_vehicle_indices."""

  maxDiff = None

  def test_no_shipments(self):
    model: cfr_json.ShipmentModel = {}
    transforms.soften_allowed_vehicle_indices(model, 1000)
    self.assertEqual(model, {})

  def test_soften_allowed_vehicle_indices(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "label": "S001",
            },
            {"label": "S002", "allowedVehicleIndices": [0, 3]},
            {
                "label": "S003",
                "allowedVehicleIndices": [0, 1, 3],
                "costsPerVehicleIndices": [0, 3],
                "costsPerVehicle": [100, 300],
            },
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
            {"label": "V003"},
            {"label": "V004"},
        ],
    }
    expected_model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "label": "S001",
            },
            {
                "label": "S002",
                "costsPerVehicleIndices": [1, 2],
                "costsPerVehicle": [1000, 1000],
            },
            {
                "label": "S003",
                "costsPerVehicleIndices": [0, 2, 3],
                "costsPerVehicle": [100, 1000, 300],
            },
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
            {"label": "V003"},
            {"label": "V004"},
        ],
    }
    transforms.soften_allowed_vehicle_indices(model, 1000)
    self.assertEqual(model, expected_model)


class RemoveLoadLimitstest(unittest.TestCase):
  """Tests for remove_load_limits."""

  def test_no_vehicles(self):
    model: cfr_json.ShipmentModel = {}
    transforms.remove_load_limits(model)
    self.assertEqual(model, {})

  def test_remove_load_limits(self):
    model: cfr_json.ShipmentModel = {
        "vehicles": [
            {
                "label": "V0001",
                "loadLimits": {
                    "ore": {"maxLoad": "32"},
                    "wheat": {"maxLoad": "12"},
                },
            },
            {
                "label": "V0002",
            },
        ]
    }
    transforms.remove_load_limits(model)
    self.assertEqual(
        model,
        {
            "vehicles": [
                {
                    "label": "V0001",
                },
                {
                    "label": "V0002",
                },
            ]
        },
    )


class ScaleVisitRequestDurations(unittest.TestCase):
  """Tests for scale_visit_request_duration."""

  maxDiff = None

  _MODEL: cfr_json.ShipmentModel = {
      "shipments": [
          {
              "pickups": [{"duration": "100s"}, {"duration": "0s"}],
              "deliveries": [{"duration": "60s"}],
          },
          {"pickups": [{"duration": "30s"}]},
          {"deliveries": [{"duration": "120s"}]},
      ]
  }

  def test_negative_factor(self):
    model: cfr_json.ShipmentModel = {}
    with self.assertRaisesRegex(ValueError, "non-negative"):
      transforms.scale_visit_request_durations(model, -0.5)

  def test_zero_factor(self):
    model: cfr_json.ShipmentModel = copy.deepcopy(self._MODEL)
    expected_model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [{"duration": "0s"}, {"duration": "0s"}],
                "deliveries": [{"duration": "0s"}],
            },
            {"pickups": [{"duration": "0s"}]},
            {"deliveries": [{"duration": "0s"}]},
        ]
    }
    transforms.scale_visit_request_durations(model, 0)
    self.assertEqual(model, expected_model)

  def test_non_zero_factor(self):
    model: cfr_json.ShipmentModel = copy.deepcopy(self._MODEL)
    expected_model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [{"duration": "110s"}, {"duration": "0s"}],
                "deliveries": [{"duration": "66s"}],
            },
            {"pickups": [{"duration": "33s"}]},
            {"deliveries": [{"duration": "132s"}]},
        ]
    }
    transforms.scale_visit_request_durations(model, 1.1)
    self.assertEqual(model, expected_model)


class RemovePickupsTest(unittest.TestCase):
  """Tests for remove_pickups."""

  maxDiff = None

  def test_no_pickup(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [{
                "timeWindows": [
                    {
                        "startTime": "2023-10-03T08:30:00Z",
                        "endTime": "2023-10-03T08:30:00Z",
                    },
                    {
                        "startTime": "2023-10-03T12:00:00Z",
                        "endTime": "2023-10-03T14:00:00Z",
                    },
                ]
            }],
        }],
    }
    original_model = copy.deepcopy(model)
    transforms.remove_pickups(model)
    self.assertEqual(model, original_model)

  def test_no_deliveries(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T09:00:00Z",
                    "endTime": "2023-10-03T12:00:00Z",
                }]
            }]
        }],
    }
    original_model = copy.deepcopy(model)
    transforms.remove_pickups(model)
    self.assertEqual(model, original_model)

  def test_no_delivery_time_windows(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [
            {
                "pickups": [{
                    "timeWindows": [{
                        "startTime": "2023-10-03T09:00:00Z",
                        "endTime": "2023-10-03T10:00:00Z",
                    }],
                    "duration": "600s",
                }],
                "deliveries": [{
                    "duration": "12s",
                }],
            },
        ],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [
            {
                "deliveries": [{
                    "duration": "12s",
                    "timeWindows": [{"startTime": "2023-10-03T09:10:00Z"}],
                }],
            },
        ],
    }
    transforms.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_delivery_time_windows(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [{
                "timeWindows": [
                    {
                        "startTime": "2023-10-03T08:44:00Z",
                        "endTime": "2023-10-03T09:00:00Z",
                    },
                    {
                        "startTime": "2023-10-03T11:00:00Z",
                    },
                ],
                "duration": "60s",
            }],
            "deliveries": [{
                "timeWindows": [
                    {
                        "endTime": "2023-10-03T08:10:00Z",
                    },
                    {
                        "startTime": "2023-10-03T08:15:00Z",
                        "softStartTime": "2023-10-03T08:30:00Z",
                        "softEndTime": "2023-10-03T08:40:00Z",
                        "endTime": "2023-10-03T14:00:00Z",
                        "costPerHourBeforeSoftStartTime": 6,
                        "costPerHourAfterSoftEndTime": 12,
                    },
                    {
                        "startTime": "2023-10-03T16:00:00Z",
                        "endTime": "2023-10-03T17:00:00Z",
                    },
                ],
                "duration": "120s",
            }],
        }],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [{
                "timeWindows": [
                    {
                        "startTime": "2023-10-03T08:45:00Z",
                        "softEndTime": "2023-10-03T08:45:00Z",
                        "endTime": "2023-10-03T14:00:00Z",
                        "costPerHourAfterSoftEndTime": 12,
                    },
                    {
                        "startTime": "2023-10-03T16:00:00Z",
                        "endTime": "2023-10-03T17:00:00Z",
                    },
                ],
                "duration": "120s",
            }],
        }],
    }
    transforms.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_delivery_time_windows_with_visit_cost(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [
                {
                    "timeWindows": [{"startTime": "2023-10-03T08:44:00Z"}],
                    "duration": "60s",
                    "cost": 5,
                },
                {
                    "timeWindows": [{"startTime": "2023-10-03T11:00:00Z"}],
                    "duration": "60s",
                    "cost": 3,
                },
            ],
            "deliveries": [{
                "timeWindows": [{
                    "softEndTime": "2023-10-03T08:40:00Z",
                    "endTime": "2023-10-03T14:00:00Z",
                    "costPerHourAfterSoftEndTime": 12,
                }],
                "cost": 10,
                "duration": "120s",
            }],
        }],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T08:45:00Z",
                    "softEndTime": "2023-10-03T08:45:00Z",
                    "endTime": "2023-10-03T14:00:00Z",
                    "costPerHourAfterSoftEndTime": 12,
                }],
                "duration": "120s",
                "cost": 14,
            }],
        }],
    }
    transforms.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_infeasible_shipment(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T12:00:00Z",
                }],
                "duration": "7200s",
            }],
            "deliveries": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T13:00:00Z",
                    "endTime": "2023-10-03T13:30:00Z",
                }]
            }],
        }],
    }
    with self.assertRaisesRegex(ValueError, "is infeasible"):
      transforms.remove_pickups(model)


class SplitShipmentTest(unittest.TestCase):
  """Tests for split_shipment."""

  maxDiff = None

  def test_small_shipment_no_item_types(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6",
        "loadDemands": {
            "num_items": {"amount": "6"},
        },
    }
    # No splitting happens when the number of items is smaller than max_items.
    original_shipment = copy.deepcopy(shipment)
    new_shipments = list(transforms.split_shipment(shipment, "num_items", 10))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

    # No splitting happens also when the number of items is equal to max_items.
    new_shipments = list(transforms.split_shipment(shipment, "num_items", 6))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

  def test_small_shipment_with_item_types(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6",
        "loadDemands": {
            "num_items": {"amount": "6"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }
    # No splitting happens when the number of items is smaller than max_items.
    original_shipment = copy.deepcopy(shipment)
    new_shipments = list(transforms.split_shipment(shipment, "num_items", 10))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

    # No splitting happens also when the number of items is equal to max_items.
    new_shipments = list(transforms.split_shipment(shipment, "num_items", 6))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

  def test_split_once(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6, S7, S8, S9",
        "allowedVehicleIndices": [1, 2, 3],
        "loadDemands": {
            "num_items": {"amount": "9"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }

    new_shipments = list(transforms.split_shipment(shipment, "num_items", 5))
    self.assertEqual(
        shipment,
        {
            "label": "S1, S2, S3, S4, S5",
            "allowedVehicleIndices": [1, 2, 3],
            "loadDemands": {
                "num_items": {"amount": "5"},
                "boxes": {"amount": "3"},
                "envelopes": {"amount": "2"},
            },
        },
    )
    self.assertSequenceEqual(
        new_shipments,
        (
            {
                "label": "S6, S7, S8, S9",
                "allowedVehicleIndices": [1, 2, 3],
                "loadDemands": {
                    "num_items": {"amount": "4"},
                    "envelopes": {"amount": "1"},
                },
            },
        ),
    )

  def test_split_many_times(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6, S7, S8, S9",
        "loadDemands": {
            "num_items": {"amount": "9"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }

    new_shipments = list(transforms.split_shipment(shipment, "num_items", 3))
    self.assertEqual(
        shipment,
        {
            "label": "S1, S2, S3",
            "loadDemands": {
                "num_items": {"amount": "3"},
                "boxes": {"amount": "3"},
            },
        },
    )
    self.assertSequenceEqual(
        new_shipments,
        (
            {
                "label": "S4, S5, S6",
                "loadDemands": {
                    "num_items": {"amount": "3"},
                    "envelopes": {"amount": "3"},
                },
            },
            {
                "label": "S7, S8, S9",
                "loadDemands": {
                    "num_items": {"amount": "3"},
                },
            },
        ),
    )


if __name__ == "__main__":
  unittest.main()
