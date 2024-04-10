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

import unittest

from . import cfr_json
from . import human_readable

class LatLngTest(unittest.TestCase):
  """Tests for lat_lng."""

  def test_lat_lng(self):
    self.assertEqual(
        human_readable.lat_lng({"latitude": 12.34, "longitude": -56.78}),
        "12.34, -56.78",
    )


class TimeWindowTest(unittest.TestCase):
  """Tests for time_window."""

  def test_none(self):
    self.assertEqual(human_readable.time_window(None), "")

  def test_start_and_end(self):
    self.assertEqual(
        human_readable.time_window({
            "startTime": "2023-11-21T12:00:32Z",
            "endTime": "2023-11-21T17:00:00Z",
        }),
        "2023-11-21 12:00:32+00:00 - 2023-11-21 17:00:00+00:00",
    )

  def test_start_only(self):
    self.assertEqual(
        human_readable.time_window({"startTime": "2023-11-21T08:00:00Z"}),
        "2023-11-21 08:00:00+00:00 - ...",
    )

  def test_end_only(self):
    self.assertEqual(
        human_readable.time_window({"endTime": "2023-11-21T18:15:00Z"}),
        "... - 2023-11-21 18:15:00+00:00",
    )

  def test_soft_start_end(self):
    self.assertEqual(
        human_readable.time_window({
            "softStartTime": "2023-11-21T12:00:32Z",
            "softEndTime": "2023-11-21T17:00:00Z",
        }),
        "soft: 2023-11-21 12:00:32+00:00 - 2023-11-21 17:00:00+00:00",
    )

  def test_soft_start_only(self):
    self.assertEqual(
        human_readable.time_window({
            "softStartTime": "2023-11-21T12:00:32Z",
        }),
        "soft: 2023-11-21 12:00:32+00:00 - ...",
    )

  def test_soft_end_only(self):
    self.assertEqual(
        human_readable.time_window({
            "softEndTime": "2023-11-21T21:00:00Z",
        }),
        "soft: ... - 2023-11-21 21:00:00+00:00",
    )

  def test_hard_and_soft(self):
    self.assertEqual(
        human_readable.time_window({
            "startTime": "2023-11-21T08:00:00Z",
            "endTime": "2023-11-21T22:00:00Z",
            "softStartTime": "2023-11-21T12:00:32Z",
            "softEndTime": "2023-11-21T19:00:00Z",
        }),
        "2023-11-21 08:00:00+00:00 - 2023-11-21 22:00:00+00:00"
        " soft: 2023-11-21 12:00:32+00:00 - 2023-11-21 19:00:00+00:00",
    )


class TimeWindowsTest(unittest.TestCase):
  """Tests for time_windows."""

  def test_none(self):
    self.assertEqual(human_readable.time_windows(None), "")

  def test_empty(self):
    self.assertEqual(human_readable.time_windows(()), "")

  def test_one_time_window(self):
    self.assertEqual(
        human_readable.time_windows(({"startTime": "2023-11-21T08:00:00Z"},)),
        "2023-11-21 08:00:00+00:00 - ...",
    )

  def test_multiple_time_windows(self):
    self.assertEqual(
        human_readable.time_windows((
            {
                "startTime": "2023-11-21T12:00:32Z",
                "endTime": "2023-11-21T17:00:00Z",
            },
            {
                "softStartTime": "2023-11-21T12:00:32Z",
            },
        )),
        "2023-11-21 12:00:32+00:00 - 2023-11-21 17:00:00+00:00"
        " | soft: 2023-11-21 12:00:32+00:00 - ...",
    )

  def test_non_default_separator(self):
    self.assertEqual(
        human_readable.time_windows(
            (
                {
                    "startTime": "2023-11-21T12:00:32Z",
                    "endTime": "2023-11-21T17:00:00Z",
                },
                {
                    "softStartTime": "2023-11-21T12:00:32Z",
                },
            ),
            separator="\n",
        ),
        "2023-11-21 12:00:32+00:00 - 2023-11-21 17:00:00+00:00"
        "\nsoft: 2023-11-21 12:00:32+00:00 - ...",
    )


class TimeStringOrDefault(unittest.TestCase):

  def test_default(self):
    self.assertEqual(human_readable.timestring_or_default(None, "..."), "...")

  def test_not_default(self):
    self.assertEqual(
        human_readable.timestring_or_default("2023-12-21T16:32:00Z", "..."),
        "2023-12-21 16:32:00+00:00",
    )


class TransitionDurationTest(unittest.TestCase):
  """Tests for transition_duration."""

  def test_no_duration(self):
    self.assertEqual(human_readable.transition_duration({}), "0s")

  def test_travel_duration(self):
    self.assertEqual(
        human_readable.transition_duration({"travelDuration": "123s"}),
        "travel: 123s",
    )

  def test_delay_duration(self):
    self.assertEqual(
        human_readable.transition_duration({"delayDuration": "456s"}),
        "delay: 456s",
    )

  def test_wait_duration(self):
    self.assertEqual(
        human_readable.transition_duration({"waitDuration": "333s"}),
        "wait: 333s",
    )

  def test_combined(self):
    self.assertRegex(
        human_readable.transition_duration(
            {"travelDuration": "120s", "waitDuration": "32s"}
        ),
        "travel: 120s, wait: 32s",
    )


class VehicleEndLocationTest(unittest.TestCase):
  """Tests for vehicle_end_location."""

  def test_no_end_location(self):
    self.assertEqual(human_readable.vehicle_end_location({}), "")

  def test_location(self):
    self.assertEqual(
        human_readable.vehicle_end_location(
            {"endLocation": {"latitude": 0.12, "longitude": 32.22}}
        ),
        "0.12, 32.22",
    )

  def test_waypoint(self):
    self.assertEqual(
        human_readable.vehicle_end_location({
            "endWaypoint": {
                "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
            }
        }),
        "1.23, -4.56",
    )

  def test_location_and_waypoint(self):
    with self.assertRaisesRegex(ValueError, "Only one of endLocation "):
      human_readable.vehicle_end_location({
          "endLocation": {"latitude": 0.12, "longitude": 32.22},
          "endWaypoint": {
              "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
          },
      })


class VehicleStartLocationTest(unittest.TestCase):
  """Tests for vehicle_start_location."""

  def test_no_start_location(self):
    self.assertEqual(human_readable.vehicle_start_location({}), "")

  def test_location(self):
    self.assertEqual(
        human_readable.vehicle_start_location(
            {"startLocation": {"latitude": 0.12, "longitude": 32.22}}
        ),
        "0.12, 32.22",
    )

  def test_waypoint(self):
    self.assertEqual(
        human_readable.vehicle_start_location({
            "startWaypoint": {
                "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
            }
        }),
        "1.23, -4.56",
    )

  def test_location_and_waypoint(self):
    with self.assertRaisesRegex(ValueError, "Only one of startLocation "):
      human_readable.vehicle_start_location({
          "startLocation": {"latitude": 0.12, "longitude": 32.22},
          "startWaypoint": {
              "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
          },
      })


class VisitRequestLocationTest(unittest.TestCase):
  """Tests for visit_request_location."""

  def test_no_location(self):
    self.assertEqual(human_readable.visit_request_location({}), "")

  def test_arrival_location(self):
    self.assertEqual(
        human_readable.visit_request_location({
            "arrivalLocation": {"latitude": 0.12, "longitude": 32.22},
        }),
        "0.12, 32.22",
    )

  def test_arrival_waypoint(self):
    self.assertEqual(
        human_readable.visit_request_location({
            "arrivalWaypoint": {
                "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
            }
        }),
        "1.23, -4.56",
    )

  def test_arrival_location_and_waypoint(self):
    with self.assertRaisesRegex(ValueError, "Only one of arrivalLocation"):
      human_readable.visit_request_location({
          "arrivalLocation": {"latitude": 0.12, "longitude": 32.22},
          "arrivalWaypoint": {
              "location": {"latLng": {"latitude": 1.23, "longitude": -4.56}}
          },
      })

  def test_departure_location(self):
    self.assertEqual(
        human_readable.visit_request_location({
            "departureLocation": {"latitude": 0.89, "longitude": 32.22},
        }),
        "0.89, 32.22",
    )

  def test_departure_waypoint(self):
    self.assertEqual(
        human_readable.visit_request_location({
            "departureWaypoint": {
                "location": {"latLng": {"latitude": 1.23, "longitude": 4.56}}
            }
        }),
        "1.23, 4.56",
    )

  def test_departure_location_and_waypoint(self):
    with self.assertRaisesRegex(ValueError, "Only one of departureLocation"):
      human_readable.visit_request_location({
          "departureLocation": {"latitude": 0.89, "longitude": 32.22},
          "departureWaypoint": {
              "location": {"latLng": {"latitude": 1.23, "longitude": 4.56}}
          },
      })

  def test_arrival_and_departure(self):
    for arrival_location in (True, False):
      for departure_location in (True, False):
        visit_request: cfr_json.VisitRequest = {}
        if arrival_location:
          visit_request["arrivalLocation"] = {
              "latitude": 0.12,
              "longitude": 32.22,
          }
        else:
          visit_request["arrivalWaypoint"] = {
              "location": {"latLng": {"latitude": 0.12, "longitude": 32.22}}
          }
        if departure_location:
          visit_request["departureLocation"] = {
              "latitude": 0.89,
              "longitude": 32.09,
          }
        else:
          visit_request["departureWaypoint"] = {
              "location": {"latLng": {"latitude": 0.89, "longitude": 32.09}}
          }
        self.assertEqual(
            human_readable.visit_request_location(visit_request),
            "0.12, 32.22 -> 0.89, 32.09",
        )


class WaypointTest(unittest.TestCase):
  """Tests for waypoint."""

  maxDiff = None

  def test_empty_waypoint(self):
    self.assertEqual(human_readable.waypoint({}), "")

  def test_waypoint_with_latlng(self):
    waypoint: cfr_json.Waypoint = {
        "location": {"latLng": {"latitude": 0.12, "longitude": 32.22}}
    }
    self.assertEqual(human_readable.waypoint(waypoint), "0.12, 32.22")

  def test_waypoint_with_placeid(self):
    waypoint: cfr_json.Waypoint = {"placeId": "helloworld"}
    self.assertEqual(human_readable.waypoint(waypoint), "helloworld")


if __name__ == "__main__":
  unittest.main()
