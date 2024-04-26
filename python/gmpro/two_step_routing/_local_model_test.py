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
import copy
import datetime
import logging
import unittest

from ..json import cfr_json
from . import _local_model
from . import _parking


class GetLocalModelRouteStartTimeWindowsTest(unittest.TestCase):
  """Tests for get_route_start_time_windows."""

  maxDiff = None

  _MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-10-25T00:00:00Z",
      "globalEndTime": "2023-10-25T23:59:59Z",
      "shipments": [
          {
              "deliveries": [{
                  "timeWindows": [{
                      "startTime": "2023-10-25T09:00:00Z",
                      "endTime": "2023-10-25T12:00:00Z",
                  }]
              }],
              "label": "S001",
          },
          {
              "deliveries": [{
                  "timeWindows": [{
                      "startTime": "2023-10-25T09:00:00Z",
                      "endTime": "2023-10-25T12:00:00Z",
                  }]
              }],
              "label": "S002",
          },
          {
              "deliveries": [{
                  "timeWindows": [{
                      "startTime": "2023-10-25T14:00:00Z",
                      "endTime": "2023-10-25T16:00:00Z",
                  }]
              }],
              "label": "S003",
          },
          {
              "deliveries": [{
                  "timeWindows": [{
                      "startTime": "2023-10-25T12:00:00Z",
                      "endTime": "2023-10-25T15:00:00Z",
                  }]
              }],
              "label": "S004",
          },
          {
              "deliveries": [{}],
              "label": "S005",
          },
          {
              "deliveries": [{}],
              "label": "S006",
          },
          {
              "label": "S007",
              "pickups": [{
                  "timeWindows": [{
                      "startTime": "2023-10-25T10:30:00Z",
                      "endTime": "2023-10-25T12:00:00Z",
                  }]
              }],
          },
      ],
  }

  def test_empty_route(self):
    self.assertIsNone(_local_model.get_route_start_time_windows({}, {}))

  def test_with_invalid_route(self):
    local_route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-25T11:00:00Z",
        "vehicleLabel": "P001 []",
        "visits": [
            {
                "startTime": "2023-10-25T11:10:00Z",
                "shipmentIndex": 3,
                "shipmentLabel": "0: S001",
            },
            {
                "startTime": "2023-10-25T11:20:00Z",
                "shipmentIndex": 1,
                "shipmentLabel": "2: S004",
            },
        ],
    }
    with self.assertRaisesRegex(ValueError, "incompatible time windows"):
      _local_model.get_route_start_time_windows(self._MODEL, local_route)

  def test_with_some_delivery_shipments(self):
    local_route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-25T11:00:00Z",
        "vehicleLabel": "P001 []",
        "visits": [
            {
                "startTime": "2023-10-25T11:10:00Z",
                "shipmentIndex": 3,
                "shipmentLabel": "0: S001",
            },
            {
                "startTime": "2023-10-25T11:20:00Z",
                "shipmentIndex": 1,
                "shipmentLabel": "4: S005",
            },
            {
                "startTime": "2023-10-25T11:45:00Z",
                "shipmentIndex": 2,
                "shipmentLabel": "1: S002",
            },
            {
                "startTime": "2023-10-25T12:50:00Z",
                "shipmentIndex": 0,
                "shipmentLabel": "3: S004",
            },
        ],
    }
    self.assertSequenceEqual(
        _local_model.get_route_start_time_windows(self._MODEL, local_route),
        [{
            "startTime": "2023-10-25T10:10:00Z",
            "endTime": "2023-10-25T11:15:00Z",
        }],
    )

  def test_pickup_and_delivery_local_model(self):
    local_route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-25T11:00:00Z",
        "vehicleLabel": "P001 []",
        "visits": [
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 3,
                "shipmentLabel": "0: S001",
            },
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 1,
                "shipmentLabel": "4: S005",
            },
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 2,
                "shipmentLabel": "1: S002",
            },
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 0,
                "shipmentLabel": "3: S004",
            },
            {
                "startTime": "2023-10-25T11:10:00Z",
                "shipmentIndex": 3,
                "shipmentLabel": "0: S001",
            },
            {
                "startTime": "2023-10-25T11:20:00Z",
                "shipmentIndex": 1,
                "shipmentLabel": "4: S005",
            },
            {
                "startTime": "2023-10-25T11:45:00Z",
                "shipmentIndex": 2,
                "shipmentLabel": "1: S002",
            },
            {
                "startTime": "2023-10-25T12:50:00Z",
                "shipmentIndex": 0,
                "shipmentLabel": "3: S004",
            },
        ],
    }
    self.assertSequenceEqual(
        _local_model.get_route_start_time_windows(self._MODEL, local_route),
        [{
            "startTime": "2023-10-25T10:10:00Z",
            "endTime": "2023-10-25T11:15:00Z",
        }],
    )

  def test_pickup_and_delivery_shipments(self):
    local_route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-25T11:00:00Z",
        "vehicleLabel": "P001 []",
        "visits": [
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 1,
                "shipmentLabel": "4: S005",
            },
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 2,
                "shipmentLabel": "1: S002",
            },
            {
                "startTime": "2023-10-25T11:00:00Z",
                "isPickup": True,
                "shipmentIndex": 0,
                "shipmentLabel": "3: S004",
            },
            {
                "startTime": "2023-10-25T11:10:00Z",
                "shipmentIndex": 5,
                "shipmentLabel": "6: S007",
                "isPickup": True,
            },
            {
                "startTime": "2023-10-25T11:20:00Z",
                "shipmentIndex": 1,
                "shipmentLabel": "4: S005",
            },
            {
                "startTime": "2023-10-25T11:45:00Z",
                "shipmentIndex": 2,
                "shipmentLabel": "1: S002",
            },
            {
                "startTime": "2023-10-25T12:50:00Z",
                "shipmentIndex": 0,
                "shipmentLabel": "3: S004",
            },
            {
                "startTime": "2023-10-25T13:02:00Z",
                "shipmentIndex": 5,
                "shipmentLabel": "6: S007",
            },
        ],
    }
    self.assertSequenceEqual(
        _local_model.get_route_start_time_windows(self._MODEL, local_route),
        [{
            "startTime": "2023-10-25T10:20:00Z",
            "endTime": "2023-10-25T11:15:00Z",
        }],
    )


class LocalRouteVisitIsToParking(unittest.TestCase):
  """Tests for visit_is_to_parking."""

  maxDiff = None

  _SHIPMENTS: Sequence[cfr_json.Shipment] = (
      {
          "deliveries": [{"arrivalWaypoint": {"placeId": "place1"}}],
          "label": "S001",
      },
      {
          "pickups": [{"arrivalWaypoint": {"placeId": "place2"}}],
          "label": "S002",
      },
  )

  def test_with_shipment(self):
    test_cases: Sequence[tuple[cfr_json.Visit, int, bool]] = (
        ({"isPickup": True}, 0, True),
        ({}, 0, False),
        ({"isPickup": False}, 0, False),
        ({"isPickup": False}, 1, True),
        ({}, 1, True),
        ({"isPickup": True}, 1, False),
    )
    for visit, shipment_index, expected_is_to_parking in test_cases:
      shipment = self._SHIPMENTS[shipment_index]
      with self.subTest(
          local_visit=visit,
          shipment_index=shipment_index,
          expected_is_to_parking=expected_is_to_parking,
      ):
        self.assertEqual(
            _local_model.visit_is_to_parking(visit, shipment=shipment),
            expected_is_to_parking,
        )

  def test_with_shipments(self):
    test_cases: Sequence[tuple[cfr_json.Visit, bool]] = (
        ({"shipmentLabel": "0: S001", "isPickup": True}, True),
        ({"shipmentLabel": "0: S001"}, False),
        ({"shipmentLabel": "0: S001", "isPickup": False}, False),
        ({"shipmentLabel": "1: S002", "isPickup": False}, True),
        ({"shipmentLabel": "1: S002"}, True),
        ({"shipmentLabel": "1: S002", "isPickup": True}, False),
    )

    for visit, expected_is_to_parking in test_cases:
      with self.subTest(
          local_visit=visit, expected_is_to_parking=expected_is_to_parking
      ):
        self.assertEqual(
            _local_model.visit_is_to_parking(visit, shipments=self._SHIPMENTS),
            expected_is_to_parking,
        )


class RemoveWaitTimeInLocalRouteUnloadTest(unittest.TestCase):
  """Tests for remove_wait_time_from_unload_transitions."""

  maxDiff = None

  _SHIPMENTS: Sequence[cfr_json.Shipment] = (
      {
          "label": "S001",
          "deliveries": [{"arrivalWaypoint": {}}],
      },
      {
          "label": "S002",
          "deliveries": [{"arrivalWaypoint": {}}],
      },
      {
          "label": "S003",
          "pickups": [{"arrivalWaypoint": {}}],
      },
  )

  def test_no_wait_time(self):
    visits: Sequence[cfr_json.Visit] = (
        {
            "startTime": "2024-03-29T09:00:00Z",
            "shipmentLabel": "0: S001",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:01:00Z",
            "shipmentLabel": "0: S001",
        },
    )
    transitions: Sequence[cfr_json.Transition] = (
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "60s",
            "totalDuration": "60s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:03:00Z",
            "travelDuration": "62s",
            "totalDuration": "62s",
            "waitDuration": "0s",
        },
    )
    expected_visits = copy.deepcopy(visits)
    expected_transitions = copy.deepcopy(transitions)
    _local_model.remove_wait_time_from_unload_transitions(
        visits, transitions, self._SHIPMENTS
    )
    self.assertEqual(visits, expected_visits)
    self.assertEqual(transitions, expected_transitions)

  def test_wait_time_between_customer_visits(self):
    visits: Sequence[cfr_json.Visit] = (
        {
            "startTime": "2024-03-29T09:00:00Z",
            "shipmentLabel": "0: S001",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:00:00Z",
            "shipmentLabel": "1: S002",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:02:00Z",
            "shipmentLabel": "2: S003",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:05:00Z",
            "shipmentLabel": "1: S002",
        },
        {
            "startTime": "2024-03-29T09:09:00Z",
            "shipmentLabel": "0: S001",
        },
        {
            "startTime": "2024-03-29T09:11:00Z",
            "shipmentLabel": "2: S003",
        },
    )
    transitions: Sequence[cfr_json.Transition] = (
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "120s",
            "totalDuration": "120s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:03:00Z",
            "travelDuration": "60s",
            "totalDuration": "60s",
            "waitDuration": "60s",
        },
        {
            "startTime": "2024-03-29T09:07:00Z",
            "travelDuration": "120s",
            "totalDuration": "60s",
            "waitDuration": "60s",
        },
        {
            "startTime": "2024-03-29T09:10:00Z",
            "travelDuration": "60s",
            "totalDuration": "60s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:11:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
    )
    expected_visits = copy.deepcopy(visits)
    expected_transitions = copy.deepcopy(transitions)
    _local_model.remove_wait_time_from_unload_transitions(
        visits, transitions, self._SHIPMENTS
    )
    self.assertEqual(visits, expected_visits)
    self.assertEqual(transitions, expected_transitions)

  def test_wait_time_between_parking_visits(self):
    visits: Sequence[cfr_json.Visit] = (
        {
            "startTime": "2024-03-29T09:01:00Z",
            "shipmentLabel": "0: S001",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:03:00Z",
            "shipmentLabel": "1: S002",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:06:00Z",
            "shipmentLabel": "1: S002",
        },
        {
            "startTime": "2024-03-29T09:13:00Z",
            "shipmentLabel": "0: S001",
        },
    )
    transitions: Sequence[cfr_json.Transition] = (
        {
            "startTime": "2024-03-29T09:00:00Z",
            "travelDuration": "0s",
            "totalDuration": "60s",
            "waitDuration": "60s",
        },
        {
            "startTime": "2024-03-29T09:01:00Z",
            "travelDuration": "0s",
            "totalDuration": "120s",
            "waitDuration": "120s",
        },
        {
            "startTime": "2024-03-29T09:03:00Z",
            "travelDuration": "120s",
            "totalDuration": "180s",
            "waitDuration": "60s",
        },
        {
            "startTime": "2024-03-29T09:08:00Z",
            "travelDuration": "300s",
            "totalDuration": "60s",
            "waitDuration": "240s",
        },
        {
            "startTime": "2024-03-29T09:15:00Z",
            "travelDuration": "60s",
            "totalDuration": "60s",
            "waitDuration": "0s",
        },
    )
    expected_visits: Sequence[cfr_json.Visit] = (
        {
            "startTime": "2024-03-29T09:04:00Z",
            "shipmentLabel": "0: S001",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:04:00Z",
            "shipmentLabel": "1: S002",
            "isPickup": True,
        },
        {
            "startTime": "2024-03-29T09:06:00Z",
            "shipmentLabel": "1: S002",
        },
        {
            "startTime": "2024-03-29T09:13:00Z",
            "shipmentLabel": "0: S001",
        },
    )
    expected_transitions: Sequence[cfr_json.Transition] = (
        {
            "startTime": "2024-03-29T09:04:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:04:00Z",
            "travelDuration": "0s",
            "totalDuration": "0s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:04:00Z",
            "travelDuration": "120s",
            "totalDuration": "120s",
            "waitDuration": "0s",
        },
        {
            "startTime": "2024-03-29T09:08:00Z",
            "travelDuration": "300s",
            "totalDuration": "60s",
            "waitDuration": "240s",
        },
        {
            "startTime": "2024-03-29T09:15:00Z",
            "travelDuration": "60s",
            "totalDuration": "60s",
            "waitDuration": "0s",
        },
    )
    _local_model.remove_wait_time_from_unload_transitions(
        visits, transitions, self._SHIPMENTS
    )
    self.assertEqual(visits, expected_visits)
    self.assertEqual(transitions, expected_transitions)


class GetParkingTagFromLocalRouteTest(unittest.TestCase):
  """Tests for get_parking_tag_from_route."""

  def test_empty_string(self):
    with self.assertRaises(ValueError):
      _local_model.get_parking_tag_from_route({"vehicleLabel": ""})

  def test_no_timestamp(self):
    self.assertEqual(
        _local_model.get_parking_tag_from_route({"vehicleLabel": "P002 []/1"}),
        "P002",
    )

  def test_with_timestamp(self):
    self.assertEqual(
        _local_model.get_parking_tag_from_route(
            {
                "vehicleLabel": (
                    "P001 [start=2023-08-11T14:00:00.000Z"
                    " end=2023-08-11T16:00:00.000Z]/0"
                )
            },
        ),
        "P001",
    )


class MakeLocalModelVehicleLabelTest(unittest.TestCase):
  """Tests for _make_local_delivery_model_vehicle_label."""

  maxDiff = None

  def test_parking_tag_only(self):
    self.assertEqual(
        _local_model.make_vehicle_label(_parking.GroupKey("P123")),
        "P123 []",
    )

  def test_parking_tag_and_start_time(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey("P123", (("2023-08-11T00:00:00.000Z", None),))
        ),
        "P123 [time_windows=(start=2023-08-11T00:00:00.000Z)]",
    )

  def test_parking_tag_and_end_time(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey("P123", ((None, "2023-08-11T00:00:00.000Z"),))
        ),
        "P123 [time_windows=(end=2023-08-11T00:00:00.000Z)]",
    )

  def test_parking_tag_and_start_and_end_time(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey(
                "P123",
                (("2023-08-11T00:00:00.000Z", "2023-08-11T08:00:00.000Z"),),
            )
        ),
        "P123 [time_windows=(start=2023-08-11T00:00:00.000Z"
        " end=2023-08-11T08:00:00.000Z)]",
    )

  def test_parking_tag_and_allowed_vehicles(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey("P123", (), (0, 1, 2))
        ),
        "P123 [vehicles=(0, 1, 2)]",
    )

  def test_parking_tag_times_and_allowed_vehicles(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey(
                "P123",
                (("2023-08-11T00:00:00.000Z", "2023-08-11T08:00:00.000Z"),),
                (0, 1, 2),
            )
        ),
        "P123 [time_windows=(start=2023-08-11T00:00:00.000Z"
        " end=2023-08-11T08:00:00.000Z) vehicles=(0, 1, 2)]",
    )

  def test_parking_tag_multiple_time_windows(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey(
                "P123",
                (
                    (None, "2024-01-25T10:00:00.000Z"),
                    ("2024-09-25T14:00:00Z", None),
                ),
            )
        ),
        "P123 [time_windows=(end=2024-01-25T10:00:00.000Z)"
        "(start=2024-09-25T14:00:00Z)]",
    )

  def test_parking_tag_time_windows_penalty_cost(self):
    self.assertEqual(
        _local_model.make_vehicle_label(
            _parking.GroupKey(
                "P123",
                (("2024-02-13T16:00:00Z", None),),
                None,
                "150",
            )
        ),
        "P123 [time_windows=(start=2024-02-13T16:00:00Z) penalty_cost=150]",
    )


class TestIntervalIntersection(unittest.TestCase):
  maxDiff = None

  def test_both_empty(self):
    self.assertSequenceEqual(_local_model._interval_intersection((), ()), ())

  def test_left_empty(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection((), ((0, 1), (2, 3), (4, 5))),
        (),
    )

  def test_right_empty(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection(((0, 1), (2, 3), (4, 5)), ()),
        (),
    )

  def test_overlap(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection(((0, 10),), ((5, 20),)),
        ((5, 10),),
    )

  def test_double_overlap(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection(((0, 10), (20, 30)), ((5, 25),)),
        ((5, 10), (20, 25)),
    )

  def test_singular_overlap(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection(((0, 10),), ((10, 20),)),
        ((10, 10),),
    )

  def test_many_singular_overlaps(self):
    self.assertSequenceEqual(
        _local_model._interval_intersection(
            ((0, 1), (2, 3), (4, 5), (6, 7)), ((1, 2), (3, 4), (5, 6), (7, 8))
        ),
        ((1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7)),
    )

  def test_with_datetime(self):
    dt = datetime.datetime.fromtimestamp
    self.assertSequenceEqual(
        _local_model._interval_intersection(
            ((dt(0), dt(7200)),), ((dt(3600), dt(10000)),)
        ),
        ((dt(3600), dt(7200)),),
    )
    pass


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
