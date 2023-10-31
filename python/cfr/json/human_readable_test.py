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
        human_readable.vehicle_end_location(
            {
                "endWaypoint": {
                    "location": {
                        "latLng": {"latitude": 1.23, "longitude": -4.56}
                    }
                }
            }
        ),
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
        human_readable.vehicle_start_location(
            {
                "startWaypoint": {
                    "location": {
                        "latLng": {"latitude": 1.23, "longitude": -4.56}
                    }
                }
            }
        ),
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
        human_readable.visit_request_location(
            {
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {"latitude": 1.23, "longitude": -4.56}
                    }
                }
            }
        ),
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
        human_readable.visit_request_location(
            {
                "departureWaypoint": {
                    "location": {
                        "latLng": {"latitude": 1.23, "longitude": 4.56}
                    }
                }
            }
        ),
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


if __name__ == "__main__":
  unittest.main()
