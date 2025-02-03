# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from collections.abc import Sequence
from os import path
import tempfile
import unittest

from . import cfr_json
from . import io_utils
from . import transform_request


class TransformRequestTest(unittest.TestCase):
  """Tests for the transform_request utility."""

  maxDiff = None

  def run_transform_request_main(
      self, input_request: cfr_json.OptimizeToursRequest, args: Sequence[str]
  ) -> cfr_json.OptimizeToursRequest:
    """Runs the transform_request main function with the given parameters.

    Invokes the transform_request utility by simulating running it from a
    command line:
      1. stores `input_request` to a temporary file,
      2. runs `transform_request.main`, injecting `args` as command-line flags,
         makes it store the output to another temporary file,
      3. loads the output from the temporary file, and compares it with
         `expected_output` via `self.assertEqual()`.

    Args:
      input_request: The input CFR JSON request, to be transformed by the tool.
      args: Command-line flags passed to the transform_request utility. The args
        should not contain `--input` and `--output`, as those are added by the
        method.

    Returns:
      The actual output of the transformation script as a parsed CFR JSON
      request.
    """
    with tempfile.TemporaryDirectory() as tmp_dir:
      input_file = path.join(tmp_dir, "input.json")
      output_file = path.join(tmp_dir, "output.json")

      io_utils.write_json_to_file(input_file, input_request)
      transform_request.main(
          ["--input_file", input_file, "--output_file", output_file, *args]
      )
      output_request: cfr_json.OptimizeToursRequest = (
          io_utils.read_json_from_file(output_file)
      )
    return output_request

  def test_no_transforms(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002"}],
            "vehicles": [{"label": "V001"}, {"label": "V002"}],
        }
    }
    self.assertEqual(self.run_transform_request_main(request, ()), request)

  def test_add_injected_first_solution_routes_from_file(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{}]},
                {"label": "S002", "deliveries": [{}]},
                {"label": "S003", "pickups": [{}]},
            ],
            "vehicles": [{"label": "V001"}, {"label": "V002"}],
        }
    }
    response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentIndex": 0, "isPickup": True},
                    {"shipmentIndex": 2, "isPickup": True},
                ]
            },
            {"visits": [{"shipmentIndex": 1}]},
        ]
    }
    expected_output_request = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{}]},
                {"label": "S002", "deliveries": [{}]},
                {"label": "S003", "pickups": [{}]},
            ],
            "vehicles": [{"label": "V001"}, {"label": "V002"}],
        },
        "injectedFirstSolutionRoutes": [
            {
                "visits": [
                    {"shipmentIndex": 0, "isPickup": True},
                    {"shipmentIndex": 2, "isPickup": True},
                ]
            },
            {"visits": [{"shipmentIndex": 1}]},
        ],
    }
    response_file = path.join(
        self.enterContext(tempfile.TemporaryDirectory()), "solution.json"
    )
    io_utils.write_json_to_file(response_file, response)
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                f"--add_injected_first_solution_routes_from_file={response_file}",
            ),
        ),
        expected_output_request,
    )

  def test_add_injected_first_solution_routes_from_file__invalid_route(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{}]},
            ],
            "vehicles": [{"label": "V001"}],
        }
    }
    response: cfr_json.OptimizeToursResponse = {
        "routes": [{"vehicleIndex": 1, "visits": [{"shipmentIndex": 2}]}]
    }
    response_file = path.join(
        self.enterContext(tempfile.TemporaryDirectory()), "solution.json"
    )
    io_utils.write_json_to_file(response_file, response)
    with self.assertRaisesRegex(ValueError, "Invalid vehicle index:"):
      self.run_transform_request_main(
          request,
          (f"--add_injected_first_solution_routes_from_file={response_file}",),
      )

  def test_shipment_penalty_cost_per_item__one_item_per_shipment(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002, S003, S004"}]
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "penaltyCost": 100000},
                {"label": "S002, S003, S004", "penaltyCost": 100000},
            ]
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--shipment_penalty_cost_per_item", "100000")
        ),
        expected_output_request,
    )

  def test_shipment_penalty_cost_per_item__comma_separated(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002, S003, S004"}]
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "penaltyCost": 100000},
                {"label": "S002, S003, S004", "penaltyCost": 300000},
            ]
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--shipment_penalty_cost_per_item=100000",
                "--items_per_shipment=COMMA_SEPARATED_LIST_IN_LABEL",
            ),
        ),
        expected_output_request,
    )

  def test_remove_pickups(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "deliveries": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86595,
                                    "longitude": 2.34888,
                                }
                            }
                        },
                        "duration": "60s",
                    }],
                    "label": "S001",
                    "pickups": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86482,
                                    "longitude": 2.34932,
                                }
                            }
                        },
                    }],
                },
                {
                    "deliveries": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86471,
                                    "longitude": 2.34901,
                                }
                            }
                        },
                        "duration": "120s",
                    }],
                    "label": "S002",
                    "pickups": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86482,
                                    "longitude": 2.34932,
                                }
                            }
                        },
                    }],
                },
            ]
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "deliveries": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86595,
                                    "longitude": 2.34888,
                                }
                            }
                        },
                        "duration": "60s",
                    }],
                    "label": "S001",
                },
                {
                    "deliveries": [{
                        "arrivalWaypoint": {
                            "location": {
                                "latLng": {
                                    "latitude": 48.86471,
                                    "longitude": 2.34901,
                                }
                            }
                        },
                        "duration": "120s",
                    }],
                    "label": "S002",
                },
            ]
        }
    }
    self.assertEqual(
        self.run_transform_request_main(request, ("--remove_pickups",)),
        expected_output_request,
    )

  def test_soften_allowed_vehicle_indices(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001"},
                {"label": "S002", "allowedVehicleIndices": [0, 2]},
                {"label": "S003", "allowedVehicleIndices": [3]},
            ],
            "vehicles": [
                {"label": "V001"},
                {"label": "V002"},
                {"label": "V003"},
                {"label": "V004"},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001"},
                {
                    "label": "S002",
                    "costsPerVehicle": [1500, 1500],
                    "costsPerVehicleIndices": [1, 3],
                },
                {
                    "label": "S003",
                    "costsPerVehicle": [1500, 1500, 1500],
                    "costsPerVehicleIndices": [0, 1, 2],
                },
            ],
            "vehicles": [
                {"label": "V001"},
                {"label": "V002"},
                {"label": "V003"},
                {"label": "V004"},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--soften_allowed_vehicle_indices", "1500")
        ),
        expected_output_request,
    )

  def test_visit_duration_scaling_factor_nonzero(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{"duration": "10s"}]},
                {"label": "S002", "deliveries": [{"duration": "60s"}]},
            ]
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{"duration": "8s"}]},
                {"label": "S002", "deliveries": [{"duration": "48s"}]},
            ]
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--visit_duration_scaling_factor=0.8",)
        ),
        expected_output_request,
    )

  def test_visit_duration_scaling_factor_zero(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{"duration": "10s"}]},
                {"label": "S002", "deliveries": [{"duration": "60s"}]},
            ]
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{"duration": "0s"}]},
                {"label": "S002", "deliveries": [{"duration": "0s"}]},
            ]
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--visit_duration_scaling_factor=0",)
        ),
        expected_output_request,
    )

  def test_duplicate_vehicles_by_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2, 3]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100, 100],
                    "costsPerVehicleIndices": [1, 4],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V001 #1", "costPerHour": 30},
                {"label": "V001 #2", "costPerHour": 30},
                {"label": "V002 #1", "costPerHour": 60},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--duplicate_vehicles_by_label=V001,V001,V002",)
        ),
        expected_output_request,
    )

  def test_duplicate_vehicles_by_label__invalid_vehicle_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002"}],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
            ],
        }
    }
    with self.assertRaisesRegex(
        ValueError,
        "Vehicle label from --duplicate_vehicles_by_label does not appear in"
        " the model: 'V12345'",
    ):
      self.run_transform_request_main(
          request,
          ("--duplicate_vehicles_by_label=V12345",),
      )

  def test_remove_vehicles_by_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    expected_output_request_v001: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--remove_vehicles_by_label=V001",)
        ),
        expected_output_request_v001,
    )
    expected_output_request_v001_v002: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {"label": "S002"},
            ],
            "vehicles": [
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--remove_vehicles_by_label=V001,V002",)
        ),
        expected_output_request_v001_v002,
    )

  def test_remove_vehicles_by_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {"label": "S002"},
            ],
            "vehicles": [
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--remove_vehicles_by_index=0,1",)
        ),
        expected_output_request,
    )

  def test_remove_vehicles_by_label_and_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {"label": "S002"},
            ],
            "vehicles": [
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            ("--remove_vehicles_by_index=1", "--remove_vehicles_by_label=V001"),
        ),
        expected_output_request,
    )

  def test_remove_vehicles_and_injected_first_solution_routes_by_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 0, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request_v001: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {
                "vehicleIndex": 0,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 0, "visitRequestIndex": 0}],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--remove_vehicles_by_label=V001",)
        ),
        expected_output_request_v001,
    )
    expected_output_request_v001_v002: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0]},
                {"label": "S002"},
            ],
            "vehicles": [
                {"label": "V003", "costPerHour": 90},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--remove_vehicles_by_label=V001,V002",)
        ),
        expected_output_request_v001_v002,
    )

  def test_remove_vehicles_by_label__invalid_vehicle_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002"}],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
            ],
        }
    }
    with self.assertRaisesRegex(
        ValueError,
        "Vehicle labels from --remove_vehicles_by_label do not appear in the"
        " model: 'V12345'",
    ):
      self.run_transform_request_main(
          request,
          ("--remove_vehicles_by_label=V12345",),
      )

  def test_remove_vehicles_by_label__invalid_vehicle_label_allow_unseen_labels(
      self,
  ):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002"}],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [{"label": "S001"}, {"label": "S002"}],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--remove_vehicles_by_label=V12345,V002",
                "--allow_unseen_vehicle_labels",
            ),
        ),
        expected_output_request,
    )

  def test_transform_breaks(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "globalStartTime": "2024-02-12T09:00:00Z",
            "globalEndTime": "2024-02-12T19:00:00Z",
            "vehicles": [
                {
                    "label": "V001",
                    "breakRule": {
                        "breakRequests": [{
                            "earliestStartTime": "2024-02-12T13:00:00Z",
                            "latestStartTime": "2024-02-12T13:30:00Z",
                            "minDuration": "3600s",
                        }],
                    },
                },
                {"label": "V002"},
            ],
        }
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "globalStartTime": "2024-02-12T09:00:00Z",
            "globalEndTime": "2024-02-12T19:00:00Z",
            "vehicles": [
                {
                    "label": "V001",
                    "breakRule": {
                        "breakRequests": [
                            {
                                "earliestStartTime": "2024-02-12T12:30:00Z",
                                "latestStartTime": "2024-02-12T13:30:00Z",
                                "minDuration": "3600s",
                            },
                            {
                                "earliestStartTime": "2024-02-12T16:00:00Z",
                                "latestStartTime": "2024-02-12T17:00:00Z",
                                "minDuration": "900s",
                            },
                        ],
                    },
                },
                {
                    "label": "V002",
                    "breakRule": {
                        "breakRequests": [{
                            "earliestStartTime": "2024-02-12T16:00:00Z",
                            "latestStartTime": "2024-02-12T17:00:00Z",
                            "minDuration": "900s",
                        }]
                    },
                },
            ],
        }
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--transform_breaks",
                """
                new
                  earliestStartTime=16:00:00
                  latestStartTime=17:00:00
                  minDuration=900s;
                @time=13:00:00
                  earliestStartTime=12:30:00
                """,
            ),
        ),
        expected_output_request,
    )

  def test_reduce_to_shipments_by_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 0, "visitRequestIndex": 0}],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--reduce_to_shipments_by_index=1",)
        ),
        expected_output_request,
        f"{request=}\n{expected_output_request=}",
    )

  def test_reduce_to_shipments_by_index_with_used_shipment(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    with self.assertRaises(ValueError):
      self.run_transform_request_main(
          request, ("--reduce_to_shipments_by_index=0",)
      )

  def test_reduce_to_shipments_by_index_with_used_shipment_drop_visit(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--reduce_to_shipments_by_index=0",
                "--removed_shipment_used_in_injected_route_visit=REMOVE_VISIT",
            ),
        ),
        expected_output_request,
        f"{request=}\n{expected_output_request=}",
    )

  def test_reduce_to_vehicles_by_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 60},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {
                "vehicleIndex": 0,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 0, "visitRequestIndex": 0}],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--reduce_to_vehicles_by_label=V002",)
        ),
        expected_output_request,
        f"{request=}\n{expected_output_request=}",
    )

  def test_reduce_to_vehicles_by_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 60},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {
                "vehicleIndex": 0,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 0, "visitRequestIndex": 0}],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--reduce_to_vehicles_by_index=1",)
        ),
        expected_output_request,
        f"{request=}\n{expected_output_request=}",
    )

  def test_reduce_to_vehicles_by_invalid_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
            ],
        },
    }
    with self.assertRaises(SystemExit):
      _ = (
          self.run_transform_request_main(
              request, ("--reduce_to_vehicles_by_index=-1",)
          ),
      )

  def test_reduce_to_vehicles_by_label_invalid_label(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
            ],
        },
    }
    with self.assertRaises(ValueError):
      _ = (
          self.run_transform_request_main(
              request, ("--reduce_to_vehicles_by_label=V1234",)
          ),
      )

  def test_reduce_to_vehicles_by_label_invalid_label_allow_unseen(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 30},
                {"label": "V003", "costPerHour": 30},
            ],
        },
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 30},
            ],
        },
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--reduce_to_vehicles_by_label=V1234,V002",
                "--allow_unseen_vehicle_labels",
            ),
        ),
        expected_output_request,
    )

  def test_reduce_to_vehicles_by_label_and_index(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [0, 2]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [1],
                },
            ],
            "vehicles": [
                {"label": "V001", "costPerHour": 30},
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {"vehicleLabel": "V001", "visits": []},
            {
                "vehicleIndex": 1,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    expected_output_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "allowedVehicleIndices": [1]},
                {
                    "label": "S002",
                    "costsPerVehicle": [100],
                    "costsPerVehicleIndices": [0],
                },
            ],
            "vehicles": [
                {"label": "V002", "costPerHour": 60},
                {"label": "V003", "costPerHour": 90},
            ],
        },
        "injectedFirstSolutionRoutes": [
            {
                "vehicleIndex": 0,
                "vehicleLabel": "V002",
                "visits": [{"shipmentIndex": 1, "visitRequestIndex": 0}],
            },
        ],
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--reduce_to_vehicles_by_index=1",
                "--reduce_to_vehicles_by_label=V003",
            ),
        ),
        expected_output_request,
        f"{request=}\n{expected_output_request=}",
    )

  def test_override_avoid_u_turns_for_all_shipments(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{}, {}], "deliveries": [{}]},
                {"label": "S002", "pickups": [{}], "deliveries": [{}]},
            ]
        },
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S001",
                    "pickups": [
                        {"avoidUTurns": True},
                        {"avoidUTurns": True},
                    ],
                    "deliveries": [{"avoidUTurns": True}],
                },
                {
                    "label": "S002",
                    "pickups": [{"avoidUTurns": True}],
                    "deliveries": [{"avoidUTurns": True}],
                },
            ]
        },
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_avoid_u_turns=true",)
        ),
        expected_request,
    )

  def test_override_avoid_u_turns_for_some_shipments(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {"label": "S001", "pickups": [{}, {}]},
                {"label": "S002", "pickups": [{}], "deliveries": [{}]},
                {"label": "S003", "deliveries": [{}]},
            ]
        },
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {
            "shipments": [
                {
                    "label": "S001",
                    "pickups": [
                        {"avoidUTurns": False},
                        {"avoidUTurns": False},
                    ],
                },
                {"label": "S002", "pickups": [{}], "deliveries": [{}]},
                {"label": "S003", "deliveries": [{"avoidUTurns": False}]},
            ]
        },
    }
    self.assertEqual(
        self.run_transform_request_main(
            request,
            (
                "--override_avoid_u_turns=false",
                "--override_avoid_u_turns_shipment_indices=0,2",
            ),
        ),
        expected_request,
    )

  def test_override_consider_road_traffic_true_from_false(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {},
        "considerRoadTraffic": False,
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {},
        "considerRoadTraffic": True,
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_consider_road_traffic=true",)
        ),
        expected_request,
    )

  def test_override_consider_road_traffic_false_from_none(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {},
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {},
        "considerRoadTraffic": False,
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_consider_road_traffic=false",)
        ),
        expected_request,
    )

  def test_override_internal_parameters(self):
    request: cfr_json.OptimizeToursRequest = {"model": {}}
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {},
        "internalParameters": "foobar",
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_internal_parameters", "foobar")
        ),
        expected_request,
    )

  def test_override_internal_parameters__reset_parameters(self):
    request: cfr_json.OptimizeToursRequest = {
        "model": {},
        "internalParameters": "foobar",
    }
    expected_request: cfr_json.OptimizeToursRequest = {
        "model": {},
    }
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_internal_parameters=",)
        ),
        expected_request,
    )

  def test_override_internal_parameters__reset_already_clear_parameters(self):
    request: cfr_json.OptimizeToursRequest = {"model": {}}
    expected_request: cfr_json.OptimizeToursRequest = {"model": {}}
    self.assertEqual(
        self.run_transform_request_main(
            request, ("--override_internal_parameters", "")
        ),
        expected_request,
    )


if __name__ == "__main__":
  unittest.main()
