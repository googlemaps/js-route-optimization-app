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

import logging
import unittest

from ..json import cfr_json
from . import _global_model
from . import _parking


class ParseGlobalShipmentLabelTest(unittest.TestCase):
  """Tests for parse_shipment_label."""

  def test_empty_label(self):
    with self.assertRaises(ValueError):
      _global_model.parse_shipment_label("")

  def test_invalid_label(self):
    with self.assertRaises(ValueError):
      _global_model.parse_shipment_label("foobar")

  def test_shipment_label(self):
    visit_type, index = _global_model.parse_shipment_label("s:1 S003")
    self.assertEqual(visit_type, "s")
    self.assertEqual(index, 1)

  def test_parking_label(self):
    visit_type, index = _global_model.parse_shipment_label("p:3 S003,S004,S007")
    self.assertEqual(visit_type, "p")
    self.assertEqual(index, 3)


class TestAssertGlobalModelRoutesHandleSameShipments(unittest.TestCase):
  """Tests for assert_routes_handle_same_shipments."""

  def test_no_routes(self):
    _global_model.assert_routes_handle_same_shipments({}, {})

  def test_empty_routes(self):
    response_a: cfr_json.OptimizeToursResponse = {"routes": []}
    response_b: cfr_json.OptimizeToursResponse = {"routes": []}
    _global_model.assert_routes_handle_same_shipments(response_a, response_b)

  def test_different_number_of_routes(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [{"visits": []}, {"vehicleIndex": 1, "visits": []}]
    }
    response_b: cfr_json.OptimizeToursResponse = {"routes": [{"visits": []}]}
    with self.assertRaisesRegex(
        AssertionError, "The number of routes is different"
    ):
      _global_model.assert_routes_handle_same_shipments(response_a, response_b)

  def test_multiple_routes_same_shipments(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ]
            },
        ]
    }
    _global_model.assert_routes_handle_same_shipments(response_a, response_b)

  def test_multiple_routes_same_shipments_different_vehicles(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ],
            },
            {
                "vehicleIndex": 0,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
        ]
    }
    with self.assertRaisesRegex(
        AssertionError, "Shipment label counts for vehicle 0 are different"
    ):
      _global_model.assert_routes_handle_same_shipments(response_a, response_b)

  def test_multiple_routes_different_shipments(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008,S009"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
        ]
    }
    with self.assertRaisesRegex(AssertionError, ""):
      _global_model.assert_routes_handle_same_shipments(response_a, response_b)


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
