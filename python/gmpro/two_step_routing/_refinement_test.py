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
from . import _parking
from . import _refinement


class GetConsecutiveParkingLocationVisits(unittest.TestCase):
  """Tests for _get_consecutive_parking_location_visits."""

  maxDiff = None

  def test_empty_route(self):
    local_response: cfr_json.OptimizeToursResponse = {}
    global_route: cfr_json.ShipmentRoute = {}
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (),
    )

  def test_only_shipments(self):
    local_response: cfr_json.OptimizeToursResponse = {}
    global_route: cfr_json.ShipmentRoute = {
        "visits": [
            {"shipmentLabel": "s:1 S002"},
            {"shipmentLabel": "s:5 SOO6"},
            {"shipmentLabel": "s:6 S007"},
        ],
        "transitions": [{}, {}, {}, {}],
    }
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (),
    )

  def test_different_parkings_and_shipments(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                ],
            },
        ],
    }
    global_route: cfr_json.ShipmentRoute = {
        "vehicleIndex": 1,
        "visits": [
            {"shipmentLabel": "s:0 S001"},
            {"shipmentLabel": "p:1 P001"},
            {"shipmentLabel": "p:2 P002"},
            {"shipmentLabel": "p:0 P001"},
        ],
        "transitions": [{}, {}, {}, {}, {}],
    }
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (),
    )

  def test_consecutive_visits(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
                    {"shipmentLabel": "9: S009"},
                    {"shipmentLabel": "10: S010"},
                ],
            },
        ],
    }
    global_route: cfr_json.ShipmentRoute = {
        "vehicleIndex": 2,
        "visits": [
            {"shipmentLabel": "s:0 S001"},
            {"shipmentLabel": "p:0 P001"},
            {"shipmentLabel": "p:1 P001"},
            {"shipmentLabel": "s:10 S011"},
            {"shipmentLabel": "p:3 P002"},
            {"shipmentLabel": "p:2 P002"},
            {"shipmentLabel": "p:4 P002"},
        ],
        "transitions": [{}, {}, {}, {}, {}, {}, {}, {}],
    }
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=3,
                local_route_indices=[3, 2, 4],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 9,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 10,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 9,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 10,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
        ),
    )

  def test_consecutive_visits_with_breaks(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
                    {"shipmentLabel": "9: S009"},
                    {"shipmentLabel": "10: S010"},
                ],
            },
        ],
    }
    global_route: cfr_json.ShipmentRoute = {
        "vehicleIndex": 2,
        "visits": [
            {"shipmentLabel": "s:0 S001"},
            {"shipmentLabel": "p:0 P001"},
            {"shipmentLabel": "p:1 P001"},
            {"shipmentLabel": "s:10 S011"},
            {"shipmentLabel": "p:3 P002"},
            {"shipmentLabel": "p:2 P002"},
            # There is a break between the visit above and the one below. This
            # breaks splits this sequence into two; the one above has
            # consecutive visits, the one below does not. Only the part above is
            # returned by _get_consecutive_parking_location_visits().
            {"shipmentLabel": "p:4 P002"},
        ],
        "transitions": [{}, {}, {}, {}, {}, {}, {"breakDuration": "600s"}, {}],
    }
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=2,
                local_route_indices=[3, 2],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
        ),
    )

  def test_only_parking(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
                    {"shipmentLabel": "9: S009"},
                    {"shipmentLabel": "10: S010"},
                ],
            },
        ],
    }
    global_route: cfr_json.ShipmentRoute = {
        "visits": [
            {"shipmentLabel": "p:4 P002"},
            {"shipmentLabel": "p:0 P001"},
            {"shipmentLabel": "p:1 P001"},
            {"shipmentLabel": "p:3 P002"},
            {"shipmentLabel": "p:2 P002"},
        ],
        "transitions": [{}, {}, {}, {}, {}, {}],
    }
    self.assertSequenceEqual(
        _refinement._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            _refinement._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=3,
                num_global_visits=2,
                local_route_indices=[3, 2],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
        ),
    )


class SplitRefinedLocalRouteTest(unittest.TestCase):
  """Tests for _split_refined_local_route."""

  maxDiff = None

  def test_empty_route(self):
    self.assertSequenceEqual(_refinement._split_refined_local_route({}), ())
    self.assertSequenceEqual(
        _refinement._split_refined_local_route(
            {"visits": [], "transitions": []}
        ),
        (),
    )

  def test_single_round(self):
    visits: list[cfr_json.Visit] = [
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": True},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": True},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": True},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": False},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": False},
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": False},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": False},
    ]
    transitions = [
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "30s"},
        {"totalDuration": "45s"},
        {"totalDuration": "60s"},
        {"totalDuration": "72s"},
        {"totalDuration": "18s"},
    ]
    travel_steps = [{} for _ in transitions]
    route: cfr_json.ShipmentRoute = {
        "visits": visits,
        "transitions": transitions,
        "travelSteps": travel_steps,
    }
    self.assertSequenceEqual(
        _refinement._split_refined_local_route(route),
        ((visits, transitions, travel_steps),),
    )

  def test_multiple_rounds(self):
    visits: list[cfr_json.Visit] = [
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": True},
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": False},
        {"shipmentIndex": 1, "shipmentLabel": "barrier P123", "isPickup": True},
        {
            "shipmentIndex": 1,
            "shipmentLabel": "barrier P123",
            "isPickup": False,
        },
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": False},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": False},
        {"shipmentIndex": 7, "shipmentLabel": "barrier P123", "isPickup": True},
        {
            "shipmentIndex": 7,
            "shipmentLabel": "barrier P123",
            "isPickup": False,
        },
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": True},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": False},
    ]
    transitions = [
        {"totalDuration": "0s"},
        {"totalDuration": "14s"},
        {"totalDuration": "16s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "32s"},
        {"totalDuration": "45s"},
        {"totalDuration": "27s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "72s"},
        {"totalDuration": "18s"},
    ]
    travel_steps = [{} for _ in transitions]
    route: cfr_json.ShipmentRoute = {
        "visits": visits,
        "transitions": transitions,
        "travelSteps": travel_steps,
    }
    expected_splits = (
        (visits[0:2], transitions[0:3], travel_steps[0:3]),
        (visits[4:8], transitions[4:9], travel_steps[4:9]),
        (visits[10:], transitions[10:], travel_steps[10:]),
    )
    self.assertSequenceEqual(
        _refinement._split_refined_local_route(route),
        expected_splits,
    )


class ParseRefinementVehicleLabelTest(unittest.TestCase):
  """Tests for _parse_refinement_vehicle_label."""

  def test_empty_label(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid vehicle label in refinement model"
    ):
      _refinement._parse_refinement_vehicle_label("")

  def test_invalid_label(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid vehicle label in refinement model"
    ):
      _refinement._parse_refinement_vehicle_label(
          "global_route:foo start:1 size:2 PARKING:P001"
      )

  def test_valid_label(self):
    self.assertEqual(
        _refinement._parse_refinement_vehicle_label(
            "global_route:32 start:1 size:2 parking:P002"
        ),
        (32, 1, 2, "P002"),
    )


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
