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

"""Tests for evaluate_solution.py."""

from collections.abc import Sequence
import copy
from os import path
import tempfile
import unittest
from unittest import mock

from . import cfr_api
from . import cfr_json
from . import evaluate_solution
from . import io_utils
from ..testdata import testdata


class MakeReducedRequestTest(unittest.TestCase):
  """Tests for make_reduced_request."""

  maxDiff = None

  _MODEL: cfr_json.ShipmentModel = {
      "shipments": [
          {"label": "S001"},
          {"label": "S002"},
          {"label": "S003"},
          {"label": "S004"},
          {"label": "S005"},
          {"label": "S006"},
      ],
      "vehicles": [
          {"label": "V001"},
          {"label": "V002"},
          {"label": "V003"},
          {"label": "V004"},
      ],
  }

  def test_all_skipped(self):
    model = copy.deepcopy(self._MODEL)
    routes: Sequence[cfr_json.ShipmentRoute] = ()
    reduced_request, new_shipment_for_old_shipment, skipped_shipments = (
        evaluate_solution.make_reduced_request(model, routes)
    )
    self.assertEqual(model, self._MODEL)
    self.assertEqual(
        reduced_request,
        {
            "model": {
                "shipments": [],
                "vehicles": [
                    {"label": "V001"},
                    {"label": "V002"},
                    {"label": "V003"},
                    {"label": "V004"},
                ],
            },
            "injectedSolutionConstraint": {
                "constraintRelaxations": [{
                    "relaxations": [
                        {"level": "RELAX_VISIT_TIMES_AFTER_THRESHOLD"}
                    ]
                }],
                "routes": [],
            },
            "searchMode": "RETURN_FAST",
        },
    )
    self.assertEqual(new_shipment_for_old_shipment, {})
    self.assertEqual(
        skipped_shipments,
        {
            0: {"label": "S001"},
            1: {"label": "S002"},
            2: {"label": "S003"},
            3: {"label": "S004"},
            4: {"label": "S005"},
            5: {"label": "S006"},
        },
    )

  def test_some_visits(self):
    model = copy.deepcopy(self._MODEL)
    routes: Sequence[cfr_json.ShipmentRoute] = (
        {"visits": [{"shipmentIndex": 2}, {"shipmentIndex": 1}]},
        {"vehicleIndex": 1},
        {
            "vehicleIndex": 2,
            "visits": [{
                "shipmentIndex": 4,
                "visitRequestIndex": 3,
                "injectedSolutionLocationToken": 10,
                "isPickup": True,
            }],
        },
    )
    reduced_request, new_shipment_for_old_shipment, skipped_shipments = (
        evaluate_solution.make_reduced_request(model, routes)
    )
    self.assertEqual(model, self._MODEL)
    self.assertEqual(
        reduced_request,
        {
            "model": {
                "shipments": [
                    {"label": "S002"},
                    {"label": "S003"},
                    {"label": "S005"},
                ],
                "vehicles": [
                    {"label": "V001"},
                    {"label": "V002"},
                    {"label": "V003"},
                    {"label": "V004"},
                ],
            },
            "injectedSolutionConstraint": {
                "constraintRelaxations": [{
                    "relaxations": [
                        {"level": "RELAX_VISIT_TIMES_AFTER_THRESHOLD"}
                    ]
                }],
                "routes": [
                    {"visits": [{"shipmentIndex": 1}, {"shipmentIndex": 0}]},
                    {"vehicleIndex": 1},
                    {
                        "vehicleIndex": 2,
                        "visits": [{
                            "shipmentIndex": 2,
                            "visitRequestIndex": 3,
                            "injectedSolutionLocationToken": 10,
                            "isPickup": True,
                        }],
                    },
                ],
            },
            "searchMode": "RETURN_FAST",
        },
    )
    self.assertEqual(new_shipment_for_old_shipment, {1: 0, 2: 1, 4: 2})
    self.assertEqual(
        skipped_shipments,
        {
            0: {"label": "S001"},
            3: {"label": "S004"},
            5: {"label": "S006"},
        },
    )


class IntegrateSkippedShipmentsTest(unittest.TestCase):
  """Integrates skipped shipments back to the reduced request."""

  maxDiff = None

  def setUp(self):
    super().setUp()
    self._input_request: cfr_json.OptimizeToursRequest = testdata.json(
        "evaluate_solution/input_request.json"
    )

  def test_integrate_empty(self):
    reduced_response = {
        "routes": [{}, {"vehicleIndex": 1}, {"vehicleIndex": 2}],
        "metrics": {},
    }
    new_shipment_for_old_shipment = {}
    skipped_shipments = dict(
        enumerate(self._input_request["model"]["shipments"])
    )
    output_response = evaluate_solution.integrate_skipped_shipments(
        reduced_response, new_shipment_for_old_shipment, skipped_shipments
    )
    self.assertEqual(
        output_response,
        {
            "routes": [{}, {"vehicleIndex": 1}, {"vehicleIndex": 2}],
            "metrics": {
                "skippedMandatoryShipmentCount": 2,
                "costs": {"model.shipments.penalty_cost": 20000},
                "totalCost": 20000,
            },
            "skippedShipments": [
                {"index": 0, "label": "S0001"},
                {"index": 1, "label": "S0002"},
                {"index": 2, "label": "S0003"},
                {"index": 3, "label": "S0004"},
            ],
        },
    )

  def test_integrate_pickup_delivery(self):
    reduced_response: cfr_json.OptimizeToursResponse = testdata.json(
        "evaluate_solution/reduced_response.json"
    )
    expected_output_response: cfr_json.OptimizeToursResponse = testdata.json(
        "evaluate_solution/expected_output_response.json"
    )
    new_shipment_for_old_shipment = {0: 0, 1: 1}
    skipped_shipments = {
        2: self._input_request["model"]["shipments"][2],
        3: self._input_request["model"]["shipments"][3],
    }
    output_response = evaluate_solution.integrate_skipped_shipments(
        reduced_response, new_shipment_for_old_shipment, skipped_shipments
    )
    self.assertEqual(output_response, expected_output_response)


class EvaluateSolutionTest(unittest.TestCase):
  """Tests for evaluate_solution.main()."""

  maxDiff = None

  def setUp(self):
    super().setUp()
    self._input_request: cfr_json.OptimizeToursRequest = testdata.json(
        "evaluate_solution/input_request.json"
    )
    self._input_response: cfr_json.OptimizeToursResponse = testdata.json(
        "evaluate_solution/input_response.json"
    )
    self._expected_reduced_request: cfr_json.OptimizeToursRequest = (
        testdata.json("evaluate_solution/expected_reduced_request.json")
    )
    self._reduced_response: cfr_json.OptimizeToursResponse = testdata.json(
        "evaluate_solution/reduced_response.json"
    )
    self._expected_output_response: cfr_json.OptimizeToursResponse = (
        testdata.json("evaluate_solution/expected_output_response.json")
    )

  def run_end_to_end(
      self,
      input_request: cfr_json.OptimizeToursRequest,
      input_response: cfr_json.OptimizeToursResponse,
      reduced_response: cfr_json.OptimizeToursResponse,
      write_reduced_request: bool,
      write_reduced_response: bool,
  ) -> tuple[
      cfr_json.OptimizeToursResponse,
      cfr_json.OptimizeToursRequest | None,
      cfr_json.OptimizeToursResponse | None,
  ]:
    with tempfile.TemporaryDirectory() as tmp_dir, mock.patch.object(
        cfr_api, "optimize_tours", return_value=reduced_response
    ):
      input_request_file = path.join(tmp_dir, "request.json")
      io_utils.write_json_to_file(input_request_file, input_request)

      input_response_file = path.join(tmp_dir, "response.json")
      io_utils.write_json_to_file(input_response_file, input_response)

      output_response_file = path.join(tmp_dir, "output_response.json")
      reduced_request_file = path.join(tmp_dir, "reduced_request.json")
      reduced_response_file = path.join(tmp_dir, "reduced_response.json")

      args = [
          "--project=mock",
          "--token=toktoktok",
          "--input_request",
          input_request_file,
          "--input_response",
          input_response_file,
          "--output_response",
          output_response_file,
      ]
      if write_reduced_request:
        args.append("--reduced_request")
        args.append(reduced_request_file)
      if write_reduced_response:
        args.append("--reduced_response")
        args.append(reduced_response_file)
      evaluate_solution.main(args)

      output_response: cfr_json.OptimizeToursResponse = (
          io_utils.read_json_from_file(output_response_file)
      )
      reduced_request: cfr_json.OptimizeToursRequest | None = None
      if write_reduced_request:
        reduced_request = io_utils.read_json_from_file(reduced_request_file)
      reduced_response: cfr_json.OptimizeToursResponse | None = None
      if write_reduced_response:
        reduced_response = io_utils.read_json_from_file(reduced_response_file)

      return output_response, reduced_request, reduced_response

  def test_end_to_end(self):
    output_response, _, _ = self.run_end_to_end(
        self._input_request,
        self._input_response,
        self._reduced_response,
        False,
        False,
    )
    self.assertEqual(output_response, self._expected_output_response)

  def test_end_to_end_with_reduced_files(self):
    output_response, reduced_request, reduced_response = self.run_end_to_end(
        self._input_request,
        self._input_response,
        self._reduced_response,
        True,
        True,
    )
    self.assertEqual(output_response, self._expected_output_response)
    self.assertEqual(reduced_request, self._expected_reduced_request)
    self.assertEqual(reduced_response, self._reduced_response)


if __name__ == "__main__":
  unittest.main()
