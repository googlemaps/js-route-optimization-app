# Copyright 2025 Google LLC
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

"""Tests for the shipment merging transformations."""

from collections.abc import Sequence
import copy
import datetime
from typing import TypeAlias
import unittest

from . import cfr_json
from . import transforms_merge

_VisitRequestToken: TypeAlias = transforms_merge._VisitRequestToken
_ShipmentToken: TypeAlias = transforms_merge._ShipmentToken


class VisitRequestTokenTest(unittest.TestCase):
  """Tests for _VisitRequestToken."""

  maxDiff = None

  def test_from_visit_request__empty(self):
    token = _VisitRequestToken.from_visit_request({})
    self.assertEqual(token.location_token, "")
    self.assertEqual(token.time_windows_token, "")
    self.assertIsNone(token.tags)
    self.assertIsNone(token.visit_types)
    self.assertEqual(token.avoid_u_turns, False)

  def test_from_visit_request__more_complex(self):
    token = _VisitRequestToken.from_visit_request({
        "arrivalLocation": {"latitude": 1.23, "longitude": -4.56},
        "timeWindows": [{
            "startTime": "2025-01-30T12:38:45Z",
            "endTime": "2025-01-30T15:05:01Z",
        }],
        "tags": ["foo", "bar"],
        "visitTypes": ["A", "B", "C"],
        "duration": "30s",
    })
    self.assertEqual(token.location_token, "1.23, -4.56")
    self.assertEqual(
        token.time_windows_token,
        "2025-01-30 12:38:45+00:00 - 2025-01-30 15:05:01+00:00",
    )
    self.assertCountEqual(token.tags, ("foo", "bar"))
    self.assertCountEqual(token.visit_types, ("A", "B", "C"))

  def test_from_visit_request__arrival_and_departure(self):
    token = _VisitRequestToken.from_visit_request({
        "arrivalLocation": {"latitude": 1.23, "longitude": -4.56},
        "departureLocation": {"latitude": 7.89, "longitude": 10.11},
        "cost": 1000000000,
    })
    self.assertEqual(token.location_token, "1.23, -4.56 -> 7.89, 10.11")

  def test_from_visit_request__waypoint_and_place_id(self):
    token = _VisitRequestToken.from_visit_request({
        "arrivalWaypoint": {
            "location": {"latLng": {"latitude": 2.34, "longitude": 5.67}}
        },
        "departureWaypoint": {"placeId": "ThisIsThePlace0123"},
    })
    self.assertEqual(token.location_token, "2.34, 5.67 -> ThisIsThePlace0123")

  def test_from_visit_request__side_of_road(self):
    token = _VisitRequestToken.from_visit_request({
        "arrivalWaypoint": {
            "placeId": "ThisIsThePlace0123",
            "sideOfRoad": True,
        }
    })
    self.assertEqual(token.location_token, "ThisIsThePlace0123, side=true")

  def test_add_multiple_times_to_set(self):
    # Check that the tokens have the expected behavior when added to a set.
    visit_request: cfr_json.VisitRequest = {
        "arrivalWaypoint": {
            "location": {"latLng": {"latitude": 2.34, "longitude": 5.67}}
        },
    }
    token_a = _VisitRequestToken.from_visit_request(visit_request)
    token_b = _VisitRequestToken.from_visit_request(visit_request)
    # The tokens are equivalent, but they are not the same object.
    self.assertEqual(token_a, token_b)
    self.assertIsNot(token_a, token_b)
    # When added to a set, only one of them is kept (because they are equivalent
    # for the set).
    self.assertEqual(len({token_a, token_b}), 1)


class ShipmentTokenTest(unittest.TestCase):
  """Tests for _ShipmentTokenTest."""

  maxDiff = None

  def test_from_shipment__empty(self):
    token = _ShipmentToken.from_shipment({})
    self.assertEqual(token.pickup_tokens, ())
    self.assertEqual(token.delivery_tokens, ())
    self.assertEqual(token.allowed_vehicle_indices, ())
    self.assertTrue(token.is_mandatory)
    self.assertIsNone(token.shipment_type)
    self.assertEqual(token.costs_per_vehicle, ())

  def test_from_shipment__pickup_and_deliveries(self):
    token = _ShipmentToken.from_shipment({
        "pickups": [{"arrivalLocation": {"latitude": 1.23, "longitude": 4.56}}],
        "deliveries": [
            {"arrivalWaypoint": {"placeId": "foo"}},
            {"arrivalWaypoint": {"placeId": "bar"}},
        ],
        "allowedVehicleIndices": [9, 8, 7],
        "penaltyCost": 200,
        "shipmentType": "ship",
        "costsPerVehicle": [100, 200],
        "costsPerVehicleIndices": [7, 8],
    })
    self.assertEqual(
        token.pickup_tokens,
        (
            _VisitRequestToken(
                location_token="1.23, 4.56",
                time_windows_token="",
                tags=None,
                visit_types=None,
                avoid_u_turns=False,
            ),
        ),
    )
    self.assertEqual(
        token.delivery_tokens,
        (
            _VisitRequestToken(
                location_token="foo",
                time_windows_token="",
                tags=None,
                visit_types=None,
                avoid_u_turns=False,
            ),
            _VisitRequestToken(
                location_token="bar",
                time_windows_token="",
                tags=None,
                visit_types=None,
                avoid_u_turns=False,
            ),
        ),
    )
    self.assertCountEqual(token.allowed_vehicle_indices, (7, 8, 9))
    self.assertFalse(token.is_mandatory)
    self.assertEqual(token.shipment_type, "ship")
    self.assertCountEqual(token.costs_per_vehicle, ((7, 100), (8, 200)))

  def test_add_multiple_times_to_set(self):
    shipment: cfr_json.Shipment = {
        "pickups": [{"arrivalLocation": {"latitude": 1.23, "longitude": 4.56}}],
        "deliveries": [
            {"arrivalWaypoint": {"placeId": "foo"}},
            {"arrivalWaypoint": {"placeId": "bar"}},
        ],
        "allowedVehicleIndices": [9, 8, 7],
        "penaltyCost": 200,
    }
    token_a = _ShipmentToken.from_shipment(shipment)
    token_b = _ShipmentToken.from_shipment(shipment)
    self.assertEqual(token_a, token_b)
    self.assertIsNot(token_a, token_b)
    self.assertEqual(len({token_a, token_b}), 1)


class MergeVisitRequestsTest(unittest.TestCase):
  """Tests for _merge_visit_requests."""

  maxDiff = None

  def test_empty_sequence(self):
    with self.assertRaises(ValueError):
      transforms_merge._merge_visit_requests(())

  def test_merge_just_one(self):
    source: cfr_json.VisitRequest = {
        "arrivalLocation": {"latitude": 1.23, "longitude": 4.56},
        "timeWindows": [{
            "startTime": "2025-01-30T08:00:00Z",
            "endTime": "2025-01-30T16:00:00Z",
        }],
        "departureWaypoint": {"placeId": "foobar"},
        "tags": ["A", "B"],
        "visitTypes": ["1"],
        "avoidUTurns": True,
        "duration": "300s",
        "label": "visit",
        "cost": 23,
        "loadDemands": {
            "coal": {"amount": "3"},
        },
    }
    merged = transforms_merge._merge_visit_requests((source,))
    self.assertIsNot(merged, source)
    self.assertEqual(merged, source)

  def test_merge_costs(self):
    sources: Sequence[cfr_json.VisitRequest] = (
        {
            "cost": 100,
        },
        {"cost": 20},
        {"cost": 5},
    )
    merged = transforms_merge._merge_visit_requests(sources)
    self.assertEqual(merged, {"cost": 125})

  def test_merge_durations(self):
    sources: Sequence[cfr_json.VisitRequest] = (
        {"duration": "10s"},
        {"duration": "35s"},
        {"duration": "200s"},
        {"duration": "1000s"},
    )
    merged = transforms_merge._merge_visit_requests(sources)
    self.assertEqual(merged, {"duration": "1245s"})

  def test_merge_load_demands(self):
    sources: Sequence[cfr_json.VisitRequest] = (
        {"loadDemands": {"ore": {"amount": "2"}, "wood": {"amount": "3"}}},
        {"loadDemands": {"rock": {"amount": "1"}, "wood": {"amount": "1"}}},
        {"loadDemands": {"ore": {"amount": "1"}}},
    )
    merged = transforms_merge._merge_visit_requests(sources)
    self.assertEqual(
        merged,
        {
            "loadDemands": {
                "ore": {"amount": "3"},
                "wood": {"amount": "4"},
                "rock": {"amount": "1"},
            }
        },
    )


class MergeVisitRequestListsTest(unittest.TestCase):
  """Tests for _merge_visit_request_lists."""

  maxDiff = None

  def test_empty_sequence(self):
    self.assertEqual(transforms_merge._merge_visit_request_lists(()), [])

  def test_merge_empty_sequences(self):
    self.assertEqual(
        transforms_merge._merge_visit_request_lists(((), (), ())), []
    )

  def test_merge_some_visit_requests(self):
    sources: Sequence[Sequence[cfr_json.VisitRequest]] = (
        (
            {"duration": "20s"},
            {"cost": 100},
            {"loadDemands": {"ore": {"amount": "4"}}},
        ),
        (
            {"duration": "30s", "cost": 20},
            {"loadDemands": {"wood": {"amount": "23"}}},
            {"cost": 12},
        ),
        (
            {"duration": "100s"},
            {"duration": "3600s"},
            {"loadDemands": {"ore": {"amount": "3"}}},
        ),
    )
    expected_merged = [
        {
            "duration": "150s",
            "cost": 20,
        },
        {
            "cost": 100,
            "loadDemands": {"wood": {"amount": "23"}},
            "duration": "3600s",
        },
        {
            "cost": 12,
            "loadDemands": {"ore": {"amount": "7"}},
        },
    ]
    self.assertEqual(
        transforms_merge._merge_visit_request_lists(sources), expected_merged
    )


class AddDurationsElementwiseInPlaceTest(unittest.TestCase):
  """Tests for _add_visit_request_durations_in_place."""

  maxDiff = None

  def test_empty_list(self):
    accs = []
    transforms_merge._add_durations_elementwise_in_place(accs, [])
    self.assertEqual(accs, [])

  def test_size_mismatch(self):
    accs = [datetime.timedelta(0), datetime.timedelta(0)]
    with self.assertRaises(ValueError):
      transforms_merge._add_durations_elementwise_in_place(
          accs, (datetime.timedelta(seconds=1),)
      )

  def test_add_to_empty_accumulators(self):
    accs = []
    added_values = (
        datetime.timedelta(seconds=10),
        datetime.timedelta(seconds=4),
    )
    transforms_merge._add_durations_elementwise_in_place(accs, added_values)
    self.assertSequenceEqual(accs, added_values)

  def test_add_elementwise(self):
    accs = [datetime.timedelta(seconds=1), datetime.timedelta(seconds=10)]
    transforms_merge._add_durations_elementwise_in_place(
        accs, (datetime.timedelta(seconds=8), datetime.timedelta(seconds=5))
    )
    self.assertEqual(
        accs, [datetime.timedelta(seconds=9), datetime.timedelta(seconds=15)]
    )

  def test_add_from_generator(self):
    accs = [datetime.timedelta(seconds=1), datetime.timedelta(seconds=5)]
    added_values = (datetime.timedelta(seconds=i) for i in range(2))
    transforms_merge._add_durations_elementwise_in_place(accs, added_values)
    self.assertEqual(
        accs, [datetime.timedelta(seconds=1), datetime.timedelta(seconds=6)]
    )


class MergeShipmentsTest(unittest.TestCase):
  """Tests for merge_shipments."""

  maxDiff = None

  def test_no_shipments(self):
    model: cfr_json.ShipmentModel = {"shipments": []}
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, ())
    self.assertSequenceEqual(old_to_new, ())

  def test_with_transition_attributes(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [],
        "transitionAttributes": [{"srcTag": "foo", "dstTag": "bar"}],
    }
    with self.assertRaises(ValueError):
      transforms_merge.merge_shipments(model)

  def test_incompatible_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            # The shipments are incompatible: even though they have visits at
            # the same location, one is a pickup and the other is a delivery.
            {"pickups": [{"arrivalWaypoint": {"placeId": "foo"}}]},
            {"deliveries": [{"arrivalWaypoint": {"placeId": "foo"}}]},
        ],
        "transitionAttributes": [
            # Transition attributes list is present, but it is empty. This case
            # should be fine.
        ],
    }
    original_model = copy.deepcopy(model)
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, original_model["shipments"])
    self.assertSequenceEqual(old_to_new, (0, 1))

  def test_mandatory_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "300s"}
                ],
                "label": "S001",
            },
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "150s"}
                ],
                "label": "S002",
            },
        ]
    }
    expected_shipments = [{
        "pickups": [
            {"arrivalWaypoint": {"placeId": "foo"}, "duration": "450s"}
        ],
        "label": "S001, S002",
    }]
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 0))

  def test_optional_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "300s"}
                ],
                "label": "S001",
                "penaltyCost": 100,
            },
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "150s"}
                ],
                "label": "S002",
                "penaltyCost": 200,
            },
        ]
    }
    expected_shipments = [{
        "pickups": [
            {"arrivalWaypoint": {"placeId": "foo"}, "duration": "450s"}
        ],
        "label": "S001, S002",
        "penaltyCost": 300,
    }]
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 0))

  def test_mandatory_and_optional_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "300s"}
                ],
                "label": "S001",
                "penaltyCost": 100,
            },
            {
                "pickups": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "150s"}
                ],
                "label": "S002",
            },
        ]
    }
    expected_shipments = copy.deepcopy(model["shipments"])
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 1))

  def test_shipment_types(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S001",
                "shipmentType": "ship",
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S002",
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S003",
                "shipmentType": "ship",
            },
        ]
    }
    expected_shipments = [
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S001, S003",
            "shipmentType": "ship",
        },
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S002",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 1, 0))

  def test_allowed_vehicles(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S001",
                "allowedVehicleIndices": [0, 1],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S002",
                "allowedVehicleIndices": [0],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S003",
                "allowedVehicleIndices": [1, 0],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S004",
            },
        ]
    }
    expected_shipments = [
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S001, S003",
            "allowedVehicleIndices": [0, 1],
        },
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S002",
            "allowedVehicleIndices": [0],
        },
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S004",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 1, 0, 2))

  def test_costs_per_vehicle(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S001",
                "costsPerVehicle": [10, 10],
                "costsPerVehicleIndices": [3, 0],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S002",
                "costsPerVehicle": [10, 10],
                "costsPerVehicleIndices": [0, 3],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S003",
                "costsPerVehicle": [10, 10],
                "costsPerVehicleIndices": [1, 2],
            },
            {
                "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
                "label": "S004",
            },
        ]
    }
    expected_shipments = [
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S001, S002",
            "costsPerVehicle": [10, 10],
            "costsPerVehicleIndices": [0, 3],
        },
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S003",
            "costsPerVehicle": [10, 10],
            "costsPerVehicleIndices": [1, 2],
        },
        {
            "pickups": [{"arrivalWaypoint": {"placeId": "foo"}}],
            "label": "S004",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(model)
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 0, 1, 2))

  def test_with_duration_limit(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S001",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S002",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S003",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S004",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S005",
            },
        ]
    }
    expected_shipments = [
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "20s"}
            ],
            "label": "S001, S002",
        },
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "20s"}
            ],
            "label": "S003, S004",
        },
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
            ],
            "label": "S005",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(
        model, max_visit_duration=datetime.timedelta(seconds=20)
    )
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 0, 1, 1, 2))

  def test_with_duration_over_limit(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S001",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "30s"}
                ],
                "label": "S002",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "label": "S003",
            },
        ]
    }
    expected_shipments = [
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
            ],
            "label": "S001",
        },
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "30s"}
            ],
            "label": "S002",
        },
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
            ],
            "label": "S003",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(
        model, max_visit_duration=datetime.timedelta(seconds=20)
    )
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 1, 2))

  def test_with_load_limits(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "loadDemands": {
                    "ore": {"amount": "2"},
                    "wood": {"amount": "3"},
                },
                "label": "S001",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "20s"}
                ],
                "loadDemands": {
                    "wood": {"amount": "4"},
                    "ore": {"amount": "1000"},
                },
                "label": "S002",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "50s"}
                ],
                "loadDemands": {"wood": {"amount": "5"}},
                "label": "S003",
            },
        ]
    }
    expected_shipments = [
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "30s"}
            ],
            "loadDemands": {
                "ore": {"amount": "1002"},
                "wood": {"amount": "7"},
            },
            "label": "S001, S002",
        },
        {
            "deliveries": [
                {"arrivalWaypoint": {"placeId": "foo"}, "duration": "50s"}
            ],
            "loadDemands": {
                "wood": {"amount": "5"},
            },
            "label": "S003",
        },
    ]
    new_shipments, old_to_new = transforms_merge.merge_shipments(
        model, load_limits={"wood": 10}
    )
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 0, 1))

  def test_with_load_over_limit(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "10s"}
                ],
                "loadDemands": {
                    "ore": {"amount": "2"},
                    "wood": {"amount": "3"},
                },
                "label": "S001",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "20s"}
                ],
                "loadDemands": {
                    "wood": {"amount": "4"},
                    "ore": {"amount": "1000"},
                },
                "label": "S002",
            },
            {
                "deliveries": [
                    {"arrivalWaypoint": {"placeId": "foo"}, "duration": "50s"}
                ],
                "loadDemands": {"wood": {"amount": "5"}},
                "label": "S003",
            },
        ]
    }
    expected_shipments = copy.deepcopy(model["shipments"])
    new_shipments, old_to_new = transforms_merge.merge_shipments(
        model, load_limits={"ore": 100}
    )
    self.assertSequenceEqual(new_shipments, expected_shipments)
    self.assertSequenceEqual(old_to_new, (0, 1, 2))


if __name__ == "__main__":
  unittest.main()
