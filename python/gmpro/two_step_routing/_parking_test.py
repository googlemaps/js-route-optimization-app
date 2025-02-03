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


class ParkingLocationTest(unittest.TestCase):
  """Tests for ParkingLocation."""

  maxDiff = None

  def test_initialize_from_waypoint(self):
    parking = _parking.ParkingLocation(
        tag="P002",
        waypoint={
            "sideOfRoad": True,
            "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",  # Google Paris.
        },
    )
    self.assertEqual(
        parking.waypoint,
        {
            "sideOfRoad": True,
            "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",  # Google Paris.
        },
    )

  def test_initialize_from_local_waypoint(self):
    parking = _parking.ParkingLocation(
        tag="P002",
        waypoint={
            "sideOfRoad": True,
            "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",  # Google Paris.
        },
        local_waypoint={
            "placeId": (
                "ChIJGfDN4Htv5kcRUdraIqjw9cM"
            ),  # Google Cloud Space France.
        },
    )
    self.assertEqual(
        parking.waypoint,
        {
            "sideOfRoad": True,
            "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",  # Google Paris.
        },
    )
    self.assertEqual(
        parking.local_waypoint,
        {
            "placeId": (
                "ChIJGfDN4Htv5kcRUdraIqjw9cM"
            ),  # Google Cloud Space France.
        },
    )

  def test_initialize_from_coordinates(self):
    parking = _parking.ParkingLocation(
        tag="P002",
        coordinates={
            "latitude": 48.87739500192329,
            "longitude": 2.3299770592243916,
        },
    )
    self.assertEqual(
        parking.waypoint,
        {
            "location": {
                "latLng": {
                    "latitude": 48.87739500192329,
                    "longitude": 2.3299770592243916,
                }
            }
        },
    )

  def test_initialize_from_waypoint_and_coordinates(self):
    with self.assertRaisesRegex(ValueError, "`waypoint` and `coordinates`"):
      _parking.ParkingLocation(
          tag="P003",
          waypoint={
              "sideOfRoad": True,
              "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",  # Google Paris.
          },
          coordinates={
              "latitude": 48.87739500192329,
              "longitude": 2.3299770592243916,
          },
      )

  def test_initialize_from_nothing(self):
    with self.assertRaisesRegex(ValueError, "`waypoint` and `coordinates`"):
      _parking.ParkingLocation(
          tag="P003",
      )

  def test_avoid_indoor_valid_travel_mode(self):
    for travel_mode, avoid_indoor in ((2, True), (2, False), (1, False)):
      with self.subTest(travel_mode=travel_mode, avoid_indoor=avoid_indoor):
        parking = _parking.ParkingLocation(
            tag="P002",
            coordinates={"latitude": 48.877, "longitude": 2.3299},
            travel_mode=travel_mode,
            avoid_indoor=avoid_indoor,
        )
        self.assertEqual(parking.travel_mode, travel_mode)
        self.assertEqual(parking.avoid_indoor, avoid_indoor)

  def test_avoid_indoor_invalid_travel_mode(self):
    with self.assertRaisesRegex(ValueError, "travel_mode"):
      _parking.ParkingLocation(
          tag="P002",
          coordinates={"latitude": 48.877, "longitude": 2.3299},
          travel_mode=1,
          avoid_indoor=True,
      )


class LoadParkingFromJsonTest(unittest.TestCase):
  """Tests for load_parking_from_json."""

  maxDiff = None

  def test_no_data_at_all(self):
    with self.assertRaisesRegex(ValueError, "doesn't have the key"):
      _parking.load_parking_from_json({})

  def test_no_parking_locations(self):
    with self.assertRaisesRegex(ValueError, "doesn't have the key"):
      _parking.load_parking_from_json({"parking_for_shipment": {}})

  def test_invalid_parking_for_shipment_format(self):
    with self.assertRaisesRegex(ValueError, "foo"):
      _parking.load_parking_from_json(
          {"parking_locations": [], "parking_for_shipment": {"foo": "123"}}
      )

  def test_invalid_parking_location_definition(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid parking location specification"
    ):
      _parking.load_parking_from_json({
          "parking_locations": [{
              "tag": "P001",
          }],
          "parking_for_shipment": {},
      })

  def test_parse(self):
    parking_json = {
        "parking_locations": [
            {
                "coordinates": {"latitude": 48.86482, "longitude": 2.34932},
                "tag": "P002",
                "travel_mode": 2,
                "delivery_load_limits": {"ore": 2},
                "arrival_duration": "180s",
                "departure_duration": "180s",
                "reload_duration": "60s",
                "arrival_cost": 1000,
            },
            {
                "waypoint": {
                    "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",
                    "sideOfRoad": True,
                },
                "local_waypoint": {
                    "location": {
                        "latLng": {
                            "latitude": 48.9,
                            "longitude": 2.4,
                        }
                    }
                },
                "tag": "P007",
                "travel_mode": 2,
            },
        ],
        "parking_for_shipment": {"6": "P002", "7": "P002"},
    }
    parkings, parking_for_shipment = _parking.load_parking_from_json(
        parking_json
    )
    self.assertSequenceEqual(
        parkings,
        (
            _parking.ParkingLocation(
                coordinates={"latitude": 48.86482, "longitude": 2.34932},
                tag="P002",
                travel_mode=2,
                delivery_load_limits={"ore": 2},
                arrival_duration="180s",
                departure_duration="180s",
                reload_duration="60s",
                arrival_cost=1000,
            ),
            _parking.ParkingLocation(
                waypoint={
                    "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",
                    "sideOfRoad": True,
                },
                local_waypoint={
                    "location": {
                        "latLng": {
                            "latitude": 48.9,
                            "longitude": 2.4,
                        }
                    }
                },
                tag="P007",
                travel_mode=2,
            ),
        ),
    )
    self.assertDictEqual(parking_for_shipment, {6: "P002", 7: "P002"})


class InitialLocalModelGroupingTest(unittest.TestCase):
  """Tests for InitialLocalModelGrouping."""

  def test_from_string_no_options(self):
    local_grouping = _parking.InitialLocalModelGrouping.from_string("")
    self.assertFalse(local_grouping.time_windows)
    self.assertIs(
        local_grouping.get_penalty_cost_group,
        _parking._no_penalty_cost_grouping,
    )

  def test_from_string_time_windows(self):
    local_grouping = _parking.InitialLocalModelGrouping.from_string(
        "time_windows"
    )
    self.assertTrue(local_grouping.time_windows)
    self.assertIs(
        local_grouping.get_penalty_cost_group,
        _parking._no_penalty_cost_grouping,
    )

  def test_from_string_penalty_cost_per_item(self):
    local_grouping = _parking.InitialLocalModelGrouping.from_string(
        "penalty_cost_per_item"
    )
    self.assertFalse(local_grouping.time_windows)
    self.assertIs(
        local_grouping.get_penalty_cost_group,
        _parking._penalty_cost_per_item,
    )

  def test_from_string_time_windows_penalty_cost_per_itme(self):
    for test_input in (
        "time_windows,penalty_cost_per_item",
        "penalty_cost_per_item,time_windows",
    ):
      with self.subTest(test_input=test_input):
        local_grouping = _parking.InitialLocalModelGrouping.from_string(
            test_input
        )
        self.assertTrue(local_grouping.time_windows)
        self.assertIs(
            local_grouping.get_penalty_cost_group,
            _parking._penalty_cost_per_item,
        )


class ShipmentGroupTest(unittest.TestCase):
  """Tests for shipment_group_key."""

  maxDiff = None

  _GROUP_BY_PARKING_AND_TIME = _parking.InitialLocalModelGrouping(
      time_windows=True
  )

  _GROUP_BY_PARKING = _parking.InitialLocalModelGrouping(time_windows=False)
  _GROUP_BY_PARKING_AND_TIME_AND_PENALTY = _parking.InitialLocalModelGrouping(
      time_windows=True,
      get_penalty_cost_group=_parking._penalty_cost_per_item,
  )

  _START_TIME = "2023-08-09T12:12:00.000Z"
  _END_TIME = "2023-08-09T12:45:32.000Z"
  _SHIPMENT_NO_TIME_WINDOW: cfr_json.Shipment = {
      "deliveries": [{
          "arrivalWaypoint": {
              "location": {
                  "latLng": {"latitude": 35.7669, "longitude": 139.7286}
              }
          },
      }],
      "label": "2023081000001",
  }
  _SHIPMENT_TIME_WINDOW_START: cfr_json.Shipment = {
      "deliveries": [{
          "arrivalWaypoint": {
              "location": {
                  "latLng": {"latitude": 35.7669, "longitude": 139.7286}
              }
          },
          "timeWindows": [{"startTime": _START_TIME}],
      }],
  }
  _SHIPMENT_TIME_WINDOW_END: cfr_json.Shipment = {
      "deliveries": [{
          "arrivalWaypoint": {
              "location": {
                  "latLng": {"latitude": 35.7669, "longitude": 139.7286}
              }
          },
          "timeWindows": [{"endTime": _END_TIME}],
      }],
  }
  _SHIPMENT_TIME_WINDOW_START_END: cfr_json.Shipment = {
      "deliveries": [{
          "arrivalWaypoint": {
              "location": {
                  "latLng": {"latitude": 35.7669, "longitude": 139.7286}
              }
          },
          "timeWindows": [{
              "startTime": _START_TIME,
              "endTime": _END_TIME,
          }],
      }],
  }
  _SHIPMENT_ALLOWED_VEHICLES: cfr_json.Shipment = {
      "deliveries": [{
          "arrivalWaypoint": {
              "location": {
                  "latLng": {"latitude": 35.7669, "longitude": 139.7286}
              }
          },
      }],
      "label": "2023081000001",
      "allowedVehicleIndices": [0, 5, 2],
  }
  _SHIPMENT_MULTIPLE_TIME_WINDOWS: cfr_json.Shipment = {
      "deliveries": [
          {
              "timeWindows": [
                  {"endTime": "2024-09-25T11:00:00Z"},
                  {
                      "startTime": "2024-09-25T18:00:00Z",
                      "endTime": "2024-09-25T20:00:00Z",
                  },
              ]
          },
      ],
      "label": "2023081000001",
  }
  _SHIPMENT_TIME_WINDOW_AND_PENALTY: cfr_json.Shipment = {
      "deliveries": [
          {
              "timeWindows": [
                  {
                      "startTime": "2024-09-25T18:00:00Z",
                      "endTime": "2024-09-25T20:00:00Z",
                  },
              ]
          },
      ],
      "label": "2023081000001",
      "penaltyCost": 12345,
  }

  _PARKING_LOCATION = _parking.ParkingLocation(
      coordinates={"latitude": 35.7668, "longitude": 139.7285}, tag="P1234"
  )

  def test_with_no_parking(self):
    for shipment in (
        self._SHIPMENT_NO_TIME_WINDOW,
        self._SHIPMENT_TIME_WINDOW_START,
        self._SHIPMENT_TIME_WINDOW_END,
        self._SHIPMENT_TIME_WINDOW_START_END,
        self._SHIPMENT_ALLOWED_VEHICLES,
    ):
      self.assertEqual(
          _parking.shipment_group_key(
              self._GROUP_BY_PARKING_AND_TIME,
              shipment,
              None,
          ),
          _parking.GroupKey(),
      )
      self.assertEqual(
          _parking.shipment_group_key(
              self._GROUP_BY_PARKING,
              shipment,
              None,
          ),
          _parking.GroupKey(),
      )

  def test_with_parking_and_no_time_window(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_NO_TIME_WINDOW,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234"),
    )
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING,
            self._SHIPMENT_NO_TIME_WINDOW,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234"),
    )

  def test_with_parking_and_time_window_start(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_START,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234", ((self._START_TIME, None),)),
    )
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_START,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234"),
    )

  def test_with_parking_and_time_window_end(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_END,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234", ((None, self._END_TIME),)),
    )
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_END,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234"),
    )

  def test_with_parking_and_time_window_start_end(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_START_END,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey(
            "P1234",
            ((self._START_TIME, self._END_TIME),),
        ),
    )
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_START_END,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey("P1234"),
    )

  def test_with_allowed_vehicles(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_ALLOWED_VEHICLES,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey(
            "P1234",
            (),
            (0, 2, 5),
        ),
    )
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING,
            self._SHIPMENT_ALLOWED_VEHICLES,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey(
            "P1234",
            (),
            (0, 2, 5),
        ),
    )

  def test_with_multiple_time_windows(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_MULTIPLE_TIME_WINDOWS,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey(
            "P1234",
            (
                (None, "2024-09-25T11:00:00Z"),
                ("2024-09-25T18:00:00Z", "2024-09-25T20:00:00Z"),
            ),
        ),
    )

  def test_with_time_window_and_penalty_cost(self):
    self.assertEqual(
        _parking.shipment_group_key(
            self._GROUP_BY_PARKING_AND_TIME_AND_PENALTY,
            self._SHIPMENT_TIME_WINDOW_AND_PENALTY,
            self._PARKING_LOCATION,
        ),
        _parking.GroupKey(
            "P1234",
            (("2024-09-25T18:00:00Z", "2024-09-25T20:00:00Z"),),
            None,
            "12345.0",
        ),
    )


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
