# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

import copy
import datetime
from typing import Sequence
import unittest

from . import cfr_json
from ..testdata import testdata


class MakeShipmentTest(unittest.TestCase):
  """Tests for make_shipment."""

  maxDiff = None

  def test_simple_delivery(self):
    self.assertEqual(
        cfr_json.make_shipment(
            "S001",
            delivery_latlng=(48.86593, 2.34886),
        ),
        {
            "deliveries": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {
                            "latitude": 48.86593,
                            "longitude": 2.34886,
                        },
                    },
                },
            }],
            "label": "S001",
        },
    )
    self.assertEqual(
        cfr_json.make_shipment(
            "S0002",
            delivery_latlng=(48.86471, 2.34901),
            delivery_duration="45s",
            delivery_tags=("foo", "bar"),
        ),
        {
            "label": "S0002",
            "deliveries": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {
                            "latitude": 48.86471,
                            "longitude": 2.34901,
                        },
                    },
                },
                "duration": "45s",
                "tags": ["foo", "bar"],
            }],
        },
    )

  def test_inconsistent_delivery_args(self):
    with self.assertRaisesRegex(ValueError, "Delivery args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          delivery_duration="120s",
      )
    with self.assertRaisesRegex(ValueError, "Delivery args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          delivery_start="2023-09-14T12:45:32Z",
      )
    with self.assertRaisesRegex(ValueError, "Delivery args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          delivery_end="2023-09-14T12:45:32Z",
      )

  def test_simple_pickup(self):
    self.assertEqual(
        cfr_json.make_shipment(
            "S001",
            pickup_latlng=(48.86593, 2.34886),
        ),
        {
            "pickups": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {
                            "latitude": 48.86593,
                            "longitude": 2.34886,
                        },
                    },
                },
            }],
            "label": "S001",
        },
    )
    self.assertEqual(
        cfr_json.make_shipment(
            "S0002",
            pickup_latlng=(48.86471, 2.34901),
            pickup_duration="45s",
        ),
        {
            "label": "S0002",
            "pickups": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {
                            "latitude": 48.86471,
                            "longitude": 2.34901,
                        },
                    },
                },
                "duration": "45s",
            }],
        },
    )

  def test_inconsistent_pickup_args(self):
    with self.assertRaisesRegex(ValueError, "Pickup args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          pickup_duration="120s",
      )
    with self.assertRaisesRegex(ValueError, "Pickup args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          pickup_start="2023-09-14T12:45:32Z",
      )
    with self.assertRaisesRegex(ValueError, "Pickup args are inconsistent"):
      cfr_json.make_shipment(
          "S001",
          pickup_end="2023-09-14T12:45:32Z",
      )

  def test_pickup_and_delivery(self):
    self.assertEqual(
        cfr_json.make_shipment(
            "S0001",
            pickup_latlng=(48.86595, 2.34888),
            pickup_duration="180s",
            pickup_start="2023-09-14T09:00:00Z",
            delivery_latlng=(48.86471, 2.34901),
            delivery_duration="0s",
            delivery_end="2023-09-14T15:00:00Z",
            pickup_tags=("tag1", "tag2"),
        ),
        {
            "deliveries": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {"latitude": 48.86471, "longitude": 2.34901}
                    }
                },
                "duration": "0s",
                "timeWindows": [{"endTime": "2023-09-14T15:00:00Z"}],
            }],
            "label": "S0001",
            "pickups": [{
                "arrivalWaypoint": {
                    "location": {
                        "latLng": {"latitude": 48.86595, "longitude": 2.34888}
                    }
                },
                "duration": "180s",
                "tags": ["tag1", "tag2"],
                "timeWindows": [{"startTime": "2023-09-14T09:00:00Z"}],
            }],
        },
    )

  def test_allowed_vehicle_indices(self):
    self.assertEqual(
        cfr_json.make_shipment("S0001", allowed_vehicle_indices=(1, 2, 3, 4)),
        {"label": "S0001", "allowedVehicleIndices": [1, 2, 3, 4]},
    )

  def test_load_demands(self):
    self.assertEqual(
        cfr_json.make_shipment("S0001", load_demands={"ore": 3, "wheat": 5}),
        {
            "label": "S0001",
            "loadDemands": {"ore": {"amount": "3"}, "wheat": {"amount": "5"}},
        },
    )

  def test_cost_per_vehicle(self):
    self.assertEqual(
        cfr_json.make_shipment(
            "S0001", cost_per_vehicle={1: 130, 2: 150, 5: 500}
        ),
        {
            "label": "S0001",
            "costsPerVehicle": [130, 150, 500],
            "costsPerVehicleIndices": [1, 2, 5],
        },
    )


class MakeVehicleTest(unittest.TestCase):
  """Tests for make_vehicle."""

  maxDiff = None

  def test_simple_vehicle(self):
    self.assertEqual(
        cfr_json.make_vehicle("V0001", depot_latlng=(48.86595, 2.34888)),
        {
            "label": "V0001",
            "startWaypoint": {
                "location": {
                    "latLng": {"latitude": 48.86595, "longitude": 2.34888}
                }
            },
            "endWaypoint": {
                "location": {
                    "latLng": {"latitude": 48.86595, "longitude": 2.34888}
                }
            },
            "travelDurationMultiple": 1,
            "travelMode": 1,
            "costPerHour": 60,
            "costPerKilometer": 1,
        },
    )

  def test_vehicle_with_time_windows(self):
    self.assertEqual(
        cfr_json.make_vehicle(
            "V0001",
            depot_latlng=(48.86595, 2.34888),
            start_time=("2023-09-14T08:00:00Z", None),
            end_time=(None, "2023-09-14T18:00:00Z"),
        ),
        {
            "label": "V0001",
            "startWaypoint": {
                "location": {
                    "latLng": {"latitude": 48.86595, "longitude": 2.34888}
                }
            },
            "endWaypoint": {
                "location": {
                    "latLng": {"latitude": 48.86595, "longitude": 2.34888}
                }
            },
            "travelDurationMultiple": 1,
            "travelMode": 1,
            "costPerHour": 60,
            "costPerKilometer": 1,
            "endTimeWindows": [{"endTime": "2023-09-14T18:00:00Z"}],
            "startTimeWindows": [{"startTime": "2023-09-14T08:00:00Z"}],
        },
    )


class GetAllVisitTagsTest(unittest.TestCase):
  """Tests for get_all_visit_tags."""

  maxDiff = None

  def test_no_tags(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002"},
            {"label": "S0003"},
        ],
        "vehicles": [
            {"label": "V0001"},
            {"label": "V0002"},
        ],
    }
    self.assertCountEqual(cfr_json.get_all_visit_tags(model), ())

  def test_with_some_tags(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            cfr_json.make_shipment(
                "S0001",
                pickup_latlng=(48.86595, 2.34888),
                pickup_tags=("foo", "bar"),
            ),
            cfr_json.make_shipment(
                "S0002",
                delivery_latlng=(48.86595, 2.34888),
                delivery_tags=("bar", "baz"),
            ),
            cfr_json.make_shipment("S0003"),
        ],
        "vehicles": [
            cfr_json.make_vehicle(
                "V0001", (48.86595, 2.34888), start_tags=("V0001_start",)
            ),
            cfr_json.make_vehicle(
                "V0002", (48.86595, 2.34888), end_tags=("V0002_end",)
            ),
        ],
    }
    self.assertCountEqual(
        cfr_json.get_all_visit_tags(model),
        ("foo", "bar", "baz", "V0001_start", "V0002_end"),
    )


class CombinedCostsPerVehicleTest(unittest.TestCase):
  """Tests for combined_costs_per_vehicle."""

  def test_no_shipments(self):
    self.assertIsNone(cfr_json.combined_costs_per_vehicle([]))

  def test_no_costs_per_vehicle(self):
    self.assertIsNone(cfr_json.combined_costs_per_vehicle([{}, {}, {}]))

  def test_some_costs(self):
    shipments = [
        {
            "costsPerVehicle": [1000, 2000, 3000],
            "costsPerVehicleIndices": [0, 2, 5],
        },
        {
            "costsPerVehicle": [10, 20, 30, 40],
            "costsPerVehicleIndices": [1, 3, 5, 6],
        },
        {},
        {
            "costsPerVehicle": [2, 3],
            "costsPerVehicleIndices": [5, 6],
        },
    ]
    expected_costs = [1000, 10, 2000, 20, 3000, 40]
    expected_vehicle_indices = [0, 1, 2, 3, 5, 6]
    self.assertEqual(
        cfr_json.combined_costs_per_vehicle(shipments),
        (expected_vehicle_indices, expected_costs),
    )


class CombinedPenaltyCostTest(unittest.TestCase):
  """Tests for combined_penalty_cost."""

  def test_no_shipments(self):
    self.assertEqual(cfr_json.combined_penalty_cost(()), 0)

  def test_no_mandatory_shipments(self):
    shipments = [
        {"penaltyCost": 100},
        {"penaltyCost": 1_000},
        {"penaltyCost": 10_000},
    ]
    self.assertEqual(cfr_json.combined_penalty_cost(shipments), 11100)

  def test_some_mandatory_shipments(self):
    shipments = [{"penaltyCost": 100}, {}, {"penaltyCost": 10000}]
    self.assertIsNone(cfr_json.combined_penalty_cost(shipments))

  def test_all_mandatory_shipments(self):
    shipments = [{}, {}, {}]
    self.assertIsNone(cfr_json.combined_penalty_cost(shipments))


class CombinedLoadDemandsTest(unittest.TestCase):
  """Tests for combined_load_demands."""

  def test_no_shipments(self):
    self.assertEqual(cfr_json.combined_load_demands(()), {})

  def test_some_shipments(self):
    shipments = [
        cfr_json.make_shipment(
            "S001",
            delivery_latlng=(48.86471, 2.34901),
            delivery_duration="120s",
            load_demands={"wheat": 3, "wood": 1},
        ),
        cfr_json.make_shipment(
            "S002",
            delivery_latlng=(48.86471, 2.34901),
            delivery_duration="120s",
            load_demands={"wood": 5, "ore": 2},
        ),
        cfr_json.make_shipment(
            "S002",
            delivery_latlng=(48.86471, 2.34901),
            delivery_duration="120s",
        ),
    ]
    self.assertEqual(
        cfr_json.combined_load_demands(shipments),
        {
            "wheat": {"amount": "3"},
            "wood": {"amount": "6"},
            "ore": {"amount": "2"},
        },
    )


class GetShipmentsTest(unittest.TestCase):
  """Tests for get_shipments."""

  def test_no_shipments(self):
    self.assertSequenceEqual(cfr_json.get_shipments({}), ())

  def test_empty_shipments(self):
    self.assertSequenceEqual(cfr_json.get_shipments({"shipments": []}), ())

  def test_some_shipments(self):
    shipments = ({"label": "S001"}, {"label": "S002"}, {"label": "S003"})
    model: cfr_json.ShipmentModel = {
        "shipments": list(shipments),
    }
    self.assertSequenceEqual(cfr_json.get_shipments(model), shipments)


class GetRoutesTest(unittest.TestCase):
  """Tests for get_routes."""

  def test_no_routes(self):
    self.assertSequenceEqual(cfr_json.get_routes({}), ())

  def test_empty_routes(self):
    self.assertSequenceEqual(cfr_json.get_routes({"routes": []}), ())

  def test_some_routes(self):
    routes = ({"vehicleIndex": 0}, {"vehicleIndex": 1})
    self.assertSequenceEqual(
        cfr_json.get_routes({
            "routes": list(routes),
        }),
        routes,
    )


class GetVehiclesTest(unittest.TestCase):
  """Tests for get_vehicles."""

  def test_no_vehicles(self):
    return self.assertSequenceEqual(cfr_json.get_vehicles({}), ())

  def test_empty_vehicles(self):
    return self.assertSequenceEqual(cfr_json.get_vehicles({"vehicles": []}), ())

  def test_some_vehicles(self):
    vehicles = ({"label": "V001"}, {"label": "V002"})
    self.assertSequenceEqual(
        cfr_json.get_vehicles({"vehicles": list(vehicles)}), vehicles
    )


class GetVisitsTest(unittest.TestCase):
  """Tests for get_visits."""

  def test_no_route(self):
    self.assertSequenceEqual(cfr_json.get_visits({}), ())

  def test_empty_visits(self):
    self.assertSequenceEqual(cfr_json.get_visits({"visits": []}), ())

  def test_some_visits(self):
    visits = ({"shipmentIndex": 0}, {"shipmentIndex": 1})
    self.assertSequenceEqual(
        cfr_json.get_visits({"visits": list(visits)}), visits
    )


class GetTransitionsTest(unittest.TestCase):
  """Tests for get_transitions."""

  def test_no_route(self):
    self.assertSequenceEqual(cfr_json.get_transitions({}), ())

  def test_empty_transitions(self):
    self.assertSequenceEqual(cfr_json.get_transitions({"transitions": []}), ())

  def test_some_transitions(self):
    transitions = (
        {"startTime": "2023-10-20T12:00:00Z"},
        {"startTime": "2023-10-20T14:00:01Z"},
    )
    self.assertSequenceEqual(
        cfr_json.get_transitions({"transitions": list(transitions)}),
        transitions,
    )


class GetBreakPropertiesTest(unittest.TestCase):
  """Tests for accessor functions for BreakRequest."""

  _BREAK_REQUEST: cfr_json.BreakRequest = {
      "earliestStartTime": "2023-10-31T11:23:45Z",
      "latestStartTime": "2023-10-31T15:10:00Z",
      "minDuration": "180s",
  }

  def test_get_earliest_start(self):
    self.assertEqual(
        cfr_json.get_break_earliest_start_time(self._BREAK_REQUEST),
        _datetime_utc(2023, 10, 31, 11, 23, 45),
    )

  def test_get_latest_start(self):
    self.assertEqual(
        cfr_json.get_break_latest_start_time(self._BREAK_REQUEST),
        _datetime_utc(2023, 10, 31, 15, 10, 00),
    )

  def test_get_min_duration(self):
    self.assertEqual(
        cfr_json.get_break_min_duration(self._BREAK_REQUEST),
        datetime.timedelta(minutes=3),
    )


class GetTransitionPropertiesTest(unittest.TestCase):
  """Tests for accessor functions for Transition."""

  def test_get_break_duration_no_break(self):
    self.assertEqual(
        cfr_json.get_transition_break_duration(
            {"travelDuration": "32s", "totalDuration": "32s"}
        ),
        datetime.timedelta(),
    )

  def test_get_break_duration_with_break(self):
    self.assertEqual(
        cfr_json.get_transition_break_duration({
            "travelDuration": "16s",
            "breakDuration": "3600s",
            "totalDuration": "3616s",
        }),
        datetime.timedelta(hours=1),
    )


class GetUnavoidableBreaksTest(unittest.TestCase):
  """Tests for get_unavoidable_breaks."""

  _BREAKS: Sequence[cfr_json.BreakRequest] = (
      {
          "earliestStartTime": "2023-10-31T08:00:00Z",
          "latestStartTime": "2023-10-31T21:00:00Z",
          "minDuration": "3600s",
      },
      {
          "earliestStartTime": "2023-10-31T08:00:00Z",
          "latestStartTime": "2023-10-31T21:00:00Z",
          "minDuration": "3600s",
      },
      {
          "earliestStartTime": "2023-10-31T08:00:00Z",
          "latestStartTime": "2023-10-31T21:00:00Z",
          "minDuration": "1800s",
      },
      {
          "earliestStartTime": "2023-10-31T08:00:00Z",
          "latestStartTime": "2023-10-31T21:00:00Z",
          "minDuration": "1800s",
      },
  )

  def test_empty_breaks(self):
    self.assertIsNone(
        cfr_json.get_unavoidable_breaks(
            (),
            _datetime_utc(2023, 10, 31, 12, 0, 0),
            _datetime_utc(2023, 10, 31, 16, 0, 0),
        )
    )

  def test_all_pushed_before(self):
    # Case 1: there is a safety buffer between the end of the last break and the
    # start time.
    self.assertIsNone(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 14, 0, 0),
            _datetime_utc(2023, 10, 31, 23, 0, 0),
        )
    )
    # Case 2: the start time is right at the end of the second break.
    self.assertIsNone(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 11, 0, 0),
            _datetime_utc(2023, 10, 31, 22, 0, 0),
        )
    )

  def test_some_pushed_before_some_pushed_after(self):
    # Case 1: there is a safety buffer between the end of the last break and the
    # start time.
    self.assertIsNone(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 12, 0, 0),
            _datetime_utc(2023, 10, 31, 20, 0, 0),
        )
    )
    # Case 2: the start time is right at the end of the second break.
    self.assertIsNone(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 10, 0, 0),
            _datetime_utc(2023, 10, 31, 20, 0, 0),
        )
    )

  def test_all_are_unavoidable(self):
    self.assertEqual(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 5, 0, 0),
            _datetime_utc(2023, 10, 31, 23, 0, 0),
        ),
        (0, 3),
    )
    self.assertEqual(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 8, 0, 0),
            _datetime_utc(2023, 10, 31, 22, 0, 0),
        ),
        (0, 3),
    )

  def test_some_avoidable_some_not(self):
    # No overlap: _BREAKS[0] ends right before the start time, _BREAKS[3] starts
    # right after the end time.
    self.assertEqual(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 9, 0, 0),
            _datetime_utc(2023, 10, 31, 21, 0, 0),
        ),
        (1, 2),
    )
    # Small overlap. _BREAKS[1] can't end entirely before the start time, and
    # _BREAKS[2] can't end entirely after the end time, even though there is
    # some slack.
    self.assertEqual(
        cfr_json.get_unavoidable_breaks(
            self._BREAKS,
            _datetime_utc(2023, 10, 31, 9, 30, 0),
            _datetime_utc(2023, 10, 31, 20, 45, 0),
        ),
        (1, 2),
    )


class GetVisitRequestTest(unittest.TestCase):
  """Tests for get_visit_request."""

  def test_default_everything(self):
    visit_request: cfr_json.VisitRequest = {}
    model: cfr_json.ShipmentModel = {
        "shipments": [{"deliveries": [visit_request]}]
    }
    visit: cfr_json.Visit = {}
    self.assertIs(cfr_json.get_visit_request(model, visit), visit_request)

  def test_multiple_pickups(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [{"pickups": [{"duration": "30s"}, {"duration": "123s"}]}]
    }
    visit: cfr_json.Visit = {
        "shipmentIndex": 0,
        "isPickup": True,
        "visitRequestIndex": 1,
    }
    self.assertEqual(
        cfr_json.get_visit_request(model, visit),
        {"duration": "123s"},
    )

  def test_multiple_deliveries(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S001"},
            {
                "label": "S002",
                "deliveries": [{"duration": "10s"}, {"duration": "30s"}],
            },
        ]
    }
    visit: cfr_json.Visit = {
        "shipmentIndex": 1,
        "isPickup": False,
    }
    self.assertEqual(
        cfr_json.get_visit_request(model, visit),
        {"duration": "10s"},
    )


class GetVisitRequestDurationTest(unittest.TestCase):
  """Tests for get_visit_request_duration."""

  def test_no_duration(self):
    self.assertEqual(
        cfr_json.get_visit_request_duration({}), datetime.timedelta(0)
    )

  def test_some_duration(self):
    self.assertEqual(
        cfr_json.get_visit_request_duration({"duration": "123s"}),
        datetime.timedelta(seconds=123),
    )


class GetGlobalStartTimeTest(unittest.TestCase):
  """Tests for get_global_start_time."""

  def test_default_global_start_time(self):
    self.assertEqual(
        cfr_json.get_global_start_time({}),
        datetime.datetime.fromtimestamp(0, tz=datetime.timezone.utc),
    )

  def test_explicit_global_start_time(self):
    self.assertEqual(
        cfr_json.get_global_start_time(
            {"globalStartTime": "2023-09-26T09:00:00Z"}
        ),
        _datetime_utc(2023, 9, 26, 9, 0, 0),
    )


class GetGlobalEndTimeTest(unittest.TestCase):
  """Tests for get_global_end_time."""

  def test_default_global_end_time(self):
    self.assertEqual(
        cfr_json.get_global_end_time({}),
        datetime.datetime.fromtimestamp(31536000, tz=datetime.timezone.utc),
    )

  def test_explicit_global_end_time(self):
    self.assertEqual(
        cfr_json.get_global_end_time({"globalEndTime": "2023-09-26T18:00:00Z"}),
        _datetime_utc(2023, 9, 26, 18, 0, 0),
    )


class GetTimeWindowsStart(unittest.TestCase):
  """Tests for get_time_windows_start."""

  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-09-30T08:00:00Z",
      "globalEndTime": "2023-09-30T18:00:00Z",
  }

  def test_none(self):
    self.assertEqual(
        cfr_json.get_time_windows_start(self._SHIPMENT_MODEL, None),
        _datetime_utc(2023, 9, 30, 8, 0, 0),
    )

  def test_no_time_windows(self):
    self.assertEqual(
        cfr_json.get_time_windows_start(self._SHIPMENT_MODEL, ()),
        _datetime_utc(2023, 9, 30, 8, 0, 0),
    )

  def test_no_start_time(self):
    time_windows = (
        {
            "softStartTime": "2023-09-30T10:00:00Z",
            "endTime": "2023-09-30T15:00:00Z",
            "costPerHourBeforeSoftStartTime": 10,
        },
        {
            "startTime": "2023-09-30T16:00:00Z",
            "endTime": "2023-09-30T16:00:00Z",
        },
    )
    self.assertEqual(
        cfr_json.get_time_windows_start(self._SHIPMENT_MODEL, time_windows),
        _datetime_utc(2023, 9, 30, 8, 0, 0),
    )

  def test_start_time(self):
    time_windows = (
        {
            "startTime": "2023-09-30T10:00:00Z",
            "endTime": "2023-09-30T15:00:00Z",
        },
        {
            "startTime": "2023-09-30T16:00:00Z",
            "endTime": "2023-09-30T16:00:00Z",
        },
    )
    self.assertEqual(
        cfr_json.get_time_windows_start(self._SHIPMENT_MODEL, time_windows),
        _datetime_utc(2023, 9, 30, 10, 0, 0),
    )


class GetTimeWindowsEnd(unittest.TestCase):
  """Tests for get_time_windows_end."""

  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-09-30T08:00:00Z",
      "globalEndTime": "2023-09-30T18:00:00Z",
  }

  def test_none(self):
    self.assertEqual(
        cfr_json.get_time_windows_end(self._SHIPMENT_MODEL, None),
        _datetime_utc(2023, 9, 30, 18, 0, 0),
    )

  def test_no_time_windows(self):
    self.assertEqual(
        cfr_json.get_time_windows_end(self._SHIPMENT_MODEL, ()),
        _datetime_utc(2023, 9, 30, 18, 0, 0),
    )

  def test_no_end_time(self):
    time_windows = (
        {
            "startTime": "2023-09-30T10:00:00Z",
            "endTime": "2023-09-30T12:00:00Z",
        },
        {
            "startTime": "2023-09-30T15:00:00Z",
            "softEndTime": "2023-09-30T17:00:00Z",
            "costPerHourAfterSoftEndTime": 30,
        },
    )
    self.assertEqual(
        cfr_json.get_time_windows_end(self._SHIPMENT_MODEL, time_windows),
        _datetime_utc(2023, 9, 30, 18, 0, 0),
    )

  def test_end_time(self):
    time_windows = (
        {
            "startTime": "2023-09-30T10:00:00Z",
            "endTime": "2023-09-30T12:00:00Z",
        },
        {
            "startTime": "2023-09-30T15:00:00Z",
            "endTime": "2023-09-30T17:00:00Z",
        },
    )
    self.assertEqual(
        cfr_json.get_time_windows_end(self._SHIPMENT_MODEL, time_windows),
        _datetime_utc(2023, 9, 30, 17, 0, 0),
    )


class GetShipmentEarliestPickup(unittest.TestCase):
  """Tests for get_shipment_earliest_pickup."""

  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-10-01T07:00:00Z",
      "globalEndTime": "2023-10-01T19:00:00Z",
  }

  def test_no_pickup(self):
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(self._SHIPMENT_MODEL, {}),
        _datetime_utc(2023, 10, 1, 7, 0, 0),
    )
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(
            self._SHIPMENT_MODEL, {}, include_duration=True
        ),
        _datetime_utc(2023, 10, 1, 7, 0, 0),
    )

  def test_pickup_no_time_windows(self):
    shipment: cfr_json.Shipment = {
        "pickups": [{
            "duration": "30s",
        }]
    }
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(self._SHIPMENT_MODEL, shipment),
        _datetime_utc(2023, 10, 1, 7, 0, 0),
    )
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(
            self._SHIPMENT_MODEL, shipment, include_duration=True
        ),
        _datetime_utc(2023, 10, 1, 7, 0, 30),
    )

  def test_pickup_with_time_window_no_start_time(self):
    shipment: cfr_json.Shipment = {
        "pickups": [{
            "timeWindows": [{"endTime": "2023-10-01T15:00:00Z"}],
            "duration": "45s",
        }]
    }
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(self._SHIPMENT_MODEL, shipment),
        _datetime_utc(2023, 10, 1, 7, 0, 0),
    )
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(
            self._SHIPMENT_MODEL, shipment, include_duration=True
        ),
        _datetime_utc(2023, 10, 1, 7, 0, 45),
    )

  def test_pickup_with_time_window_start_time(self):
    shipment: cfr_json.Shipment = {
        "pickups": [{
            "timeWindows": [{"startTime": "2023-10-01T09:01:00Z"}],
            "duration": "15s",
        }]
    }
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(self._SHIPMENT_MODEL, shipment),
        _datetime_utc(2023, 10, 1, 9, 1, 0),
    )
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(
            self._SHIPMENT_MODEL, shipment, include_duration=True
        ),
        _datetime_utc(2023, 10, 1, 9, 1, 15),
    )

  def test_pickup_multiple_pickups(self):
    shipment: cfr_json.Shipment = {
        "pickups": [
            {
                "timeWindows": [{"startTime": "2023-10-01T10:30:00Z"}],
                "duration": "7200s",
            },
            {
                "timeWindows": [{"startTime": "2023-10-01T11:00:00Z"}],
                "duration": "120s",
            },
        ]
    }
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(self._SHIPMENT_MODEL, shipment),
        _datetime_utc(2023, 10, 1, 10, 30, 0),
    )
    self.assertEqual(
        cfr_json.get_shipment_earliest_pickup(
            self._SHIPMENT_MODEL, shipment, include_duration=True
        ),
        _datetime_utc(2023, 10, 1, 11, 2, 0),
    )


class GetShipmentLoadDemandTest(unittest.TestCase):
  """Tests for get_shipment_load_demand."""

  def test_no_demands(self):
    shipment: cfr_json.Shipment = {}
    self.assertEqual(
        cfr_json.get_shipment_load_demand(shipment, "num_items"), 0
    )
    self.assertEqual(cfr_json.get_shipment_load_demand(shipment, "wheat"), 0)

  def test_with_demands(self):
    shipment: cfr_json.Shipment = {
        "loadDemands": {
            "num_items": {"amount": "10"},
            "ore": {"amount": "5"},
        }
    }
    self.assertEqual(
        cfr_json.get_shipment_load_demand(shipment, "num_items"), 10
    )
    self.assertEqual(cfr_json.get_shipment_load_demand(shipment, "ore"), 5)
    self.assertEqual(cfr_json.get_shipment_load_demand(shipment, "wheat"), 0)


class GetVehicleEarliestStartTest(unittest.TestCase):
  """Tests for get_vehicle_earliest_start."""

  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-09-26T00:00:00Z",
      "globalEndTime": "2023-09-26T23:59:59Z",
      "vehicles": [
          {
              "label": "no start time windows",
          },
          {
              "label": "start time window with start time",
              "startTimeWindows": [
                  {
                      "startTime": "2023-09-26T08:00:00Z",
                      "endTime": "2023-09-26T08:10:00Z",
                  },
                  {
                      "startTime": "2023-09-26T09:00:00Z",
                      "endTime": "2023-09-26T09:10:00Z",
                  },
              ],
          },
          {
              "label": "start time window without start time",
              "startTimeWindows": [{
                  "endTime": "2023-09-26T10:00:00Z",
              }],
          },
          {
              "label": "soft start time",
              "startTimeWindows": [{
                  "startTime": "2023-09-26T07:00:00Z",
                  "softStartTime": "2023-09-26T08:15:00Z",
                  "endTime": "2023-09-26T10:00:00Z",
              }],
          },
      ],
  }
  _VEHICLES = _SHIPMENT_MODEL["vehicles"]

  def test_no_time_window_no_global_start(self):
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start({}, {}),
        datetime.datetime.fromtimestamp(0, tz=datetime.timezone.utc),
    )

  def test_no_time_windows(self):
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[0]
        ),
        _datetime_utc(2023, 9, 26, 0, 0, 0),
    )

  def test_with_start_window_start(self):
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[1]
        ),
        _datetime_utc(2023, 9, 26, 8, 0, 0),
    )

  def test_with_start_window_but_without_start(self):
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[2]
        ),
        _datetime_utc(2023, 9, 26, 0, 0, 0),
    )

  def test_with_soft_start_time(self):
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[3], soft_limit=True
        ),
        _datetime_utc(2023, 9, 26, 8, 15, 0),
    )
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[3], soft_limit=False
        ),
        _datetime_utc(2023, 9, 26, 7, 0, 0),
    )
    self.assertEqual(
        cfr_json.get_vehicle_earliest_start(
            self._SHIPMENT_MODEL, self._VEHICLES[3]
        ),
        _datetime_utc(2023, 9, 26, 7, 0, 0),
    )


class GetLatestVehicleEndTest(unittest.TestCase):
  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-09-26T00:00:00Z",
      "globalEndTime": "2023-09-26T23:59:59Z",
      "vehicles": [
          {
              "label": "no end time windows",
          },
          {
              "label": "end time window with end time",
              "endTimeWindows": [
                  {
                      "startTime": "2023-09-26T18:00:00Z",
                      "endTime": "2023-09-26T18:10:00Z",
                  },
                  {
                      "startTime": "2023-09-26T19:00:00Z",
                      "endTime": "2023-09-26T19:10:00Z",
                  },
              ],
          },
          {
              "label": "end time window without end time",
              "endTimeWindows": [{
                  "startTime": "2023-09-26T18:00:00Z",
              }],
          },
          {
              "label": "soft end time",
              "endTimeWindows": [{
                  "startTime": "2023-09-26T18:00:00Z",
                  "softEndTime": "2023-09-26T19:30:00Z",
                  "endTime": "2023-09-26T21:00:00Z",
              }],
          },
      ],
  }
  _VEHICLES = _SHIPMENT_MODEL["vehicles"]

  def test_no_time_window_no_global_end(self):
    self.assertEqual(
        cfr_json.get_vehicle_latest_end({}, {}),
        datetime.datetime.fromtimestamp(31536000, tz=datetime.timezone.utc),
    )

  def test_no_time_window(self):
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[0]
        ),
        datetime.datetime(
            2023, 9, 26, 23, 59, 59, tzinfo=datetime.timezone.utc
        ),
    )

  def test_with_end_window_end(self):
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[1]
        ),
        _datetime_utc(2023, 9, 26, 19, 10, 0),
    )

  def test_with_end_window_but_without_end(self):
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[2]
        ),
        datetime.datetime(
            2023, 9, 26, 23, 59, 59, tzinfo=datetime.timezone.utc
        ),
    )

  def test_with_soft_end_time(self):
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[3], soft_limit=True
        ),
        _datetime_utc(2023, 9, 26, 19, 30, 0),
    )
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[3], soft_limit=False
        ),
        _datetime_utc(2023, 9, 26, 21, 0, 0),
    )
    self.assertEqual(
        cfr_json.get_vehicle_latest_end(
            self._SHIPMENT_MODEL, self._VEHICLES[3]
        ),
        _datetime_utc(2023, 9, 26, 21, 0, 0),
    )


class GetVehicleMaxWorkingHoursTest(unittest.TestCase):
  """Tests for get_vehicle_max_working_hours."""

  _SHIPMENT_MODEL: cfr_json.ShipmentModel = {
      "globalStartTime": "2023-10-04T08:00:00Z",
      "globalEndTime": "2023-10-04T18:00:00Z",
  }

  def test_no_breaks_no_start_and_end(self):
    vehicle: cfr_json.Vehicle = {}
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=10),
    )

  def test_no_breaks_explicit_start_and_end(self):
    vehicle: cfr_json.Vehicle = {
        "startTimeWindows": [{
            "startTime": "2023-10-04T10:00:00Z",
            "endTime": "2023-10-04T11:00:00Z",
        }],
        "endTimeWindows": [{
            "startTime": "2023-10-04T14:00:00Z",
            "endTime": "2023-10-04T15:00:00Z",
        }],
    }
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=5),
    )

  def test_with_breaks(self):
    vehicle: cfr_json.Vehicle = {
        "breakRule": {
            "breakRequests": [
                {
                    "earliestStartTime": "2023-10-04T10:00:00Z",
                    "latestStartTime": "2023-10-04T12:00:00Z",
                    "minDuration": "600s",
                },
                {
                    "minDuration": "1800s",
                    "earliestStartTime": "2023-10-04T15:00:00Z",
                    "latestStartTime": "2023-10-04T16:00:00Z",
                },
            ]
        }
    }
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=9, minutes=20),
    )

  def test_with_avoidable_breaks(self):
    vehicle: cfr_json.Vehicle = {
        "startTimeWindows": [{
            "startTime": "2023-10-04T12:00:00Z",
        }],
        "breakRule": {
            "breakRequests": [{
                "earliestStartTime": "2023-10-04T10:00:00Z",
                "latestStartTime": "2023-10-04T12:00:00Z",
                "minDuration": "600s",
            }]
        },
    }
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=6),
    )

  def test_with_breaks_overlaping_start(self):
    vehicle: cfr_json.Vehicle = {
        "startTimeWindows": [{
            "startTime": "2023-10-04T11:00:00Z",
        }],
        "breakRule": {
            "breakRequests": [{
                "earliestStartTime": "2023-10-04T10:00:00Z",
                "latestStartTime": "2023-10-04T12:00:00Z",
                "minDuration": "7200s",
            }]
        },
    }
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=5),
    )

  def test_with_soft_time_limit(self):
    vehicle: cfr_json.Vehicle = {
        "startTimeWindows": [{
            "startTime": "2023-10-04T08:00:00Z",
            "softStartTime": "2023-10-04T09:00:00Z",
        }],
        "endTimeWindows": [{
            "softEndTime": "2023-10-04T16:00:00Z",
            "endTime": "2023-10-04T17:30:00Z",
        }],
    }
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(
            self._SHIPMENT_MODEL, vehicle, soft_limit=True
        ),
        datetime.timedelta(hours=7),
    )
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(
            self._SHIPMENT_MODEL, vehicle, soft_limit=False
        ),
        datetime.timedelta(hours=9, minutes=30),
    )
    self.assertEqual(
        cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle),
        datetime.timedelta(hours=9, minutes=30),
    )


class GetVehicleActualWorkingHoursTest(unittest.TestCase):
  """Tests for get_vehicle_actual_working_hours."""

  def test_empty_route(self):
    self.assertEqual(
        cfr_json.get_vehicle_actual_working_hours({}), datetime.timedelta()
    )

  def test_route_no_breaks(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-04T10:00:00Z",
        "vehicleEndTime": "2023-10-04T13:00:00Z",
        "visits": [{"startTime": "2023-10-04T10:00:05Z"}],
    }
    self.assertEqual(
        cfr_json.get_vehicle_actual_working_hours(route),
        datetime.timedelta(hours=3),
    )

  def test_route_with_breaks(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-04T10:00:00Z",
        "vehicleEndTime": "2023-10-04T13:00:00Z",
        "visits": [{"startTime": "2023-10-04T12:00:00Z"}],
        "breaks": [
            {"startTime": "2023-10-04T07:00:00Z", "duration": "3600s"},
            {"startTime": "2023-10-04T09:30:00Z", "duration": "1800s"},
            {"startTime": "2023-10-04T10:00:00Z", "duration": "600s"},
            {"startTime": "2023-10-04T12:45:00Z", "duration": "900s"},
            {"startTime": "2023-10-04T13:00:00Z", "duration": "30s"},
        ],
    }
    self.assertEqual(
        cfr_json.get_vehicle_actual_working_hours(route),
        datetime.timedelta(hours=2, minutes=35),
    )


class GetNumDecreasingVisitTimesTest(unittest.TestCase):
  """Tests for get_num_decreasing_visit_times."""

  _MODEL: cfr_json.ShipmentModel = {
      "shipments": [
          {"deliveries": [{"duration": "120s"}]},
          {
              "deliveries": [{"duration": "600s"}, {"duration": "30s"}],
              "pickups": [{"duration": "150s"}, {}],
          },
          {"pickups": [{"duration": "30s"}]},
      ]
  }

  def test_empty_route(self):
    self.assertEqual(cfr_json.get_num_decreasing_visit_times({}, {}, False), 0)
    self.assertEqual(cfr_json.get_num_decreasing_visit_times({}, {}, True), 0)

  def test_only_start_and_end_non_decreasing(self):
    # NOTE(ondrasej): The case when the end time is before the start time can't
    # happen in a valid CFR response.
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False),
        0,
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True),
        0,
    )

  def test_non_decreasing_visit_times(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T11:02:00Z"},
            {
                "shipmentIndex": 2,
                "isPickup": True,
                "startTime": "2023-10-10T11:04:00Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": True,
                "visitRequestIndex": 1,
                "startTime": "2023-10-10T11:06:00Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": False,
                "visitRequestIndex": 1,
                "startTime": "2023-10-10T11:07:00Z",
            },
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 0
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 0
    )

  def test_decreasing_relative_to_vehicle_start(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T10:59:00Z"},
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 1
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 1
    )

  def test_decreasing_relative_to_vehicle_end(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T12:15:00Z"},
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 1
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 1
    )

  def test_decreasing_relative_to_vehicle_end_only_with_duration(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T11:59:00Z"},
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 1
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 0
    )

  def test_decreasing_only_with_duration(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T11:02:00Z"},
            {
                "shipmentIndex": 2,
                "isPickup": True,
                "startTime": "2023-10-10T11:04:00Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": True,
                "visitRequestIndex": 0,
                "startTime": "2023-10-10T11:06:00Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": False,
                "visitRequestIndex": 1,
                "startTime": "2023-10-10T11:07:00Z",
            },
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 1
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 0
    )

  def test_decreasing_multiple_times(self):
    route: cfr_json.ShipmentRoute = {
        "vehicleStartTime": "2023-10-10T11:00:00Z",
        "vehicleEndTime": "2023-10-10T12:00:00Z",
        "visits": [
            {"shipmentIndex": 0, "startTime": "2023-10-10T10:59:59Z"},
            {
                "shipmentIndex": 2,
                "isPickup": True,
                "startTime": "2023-10-10T11:00:10Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": True,
                "visitRequestIndex": 0,
                "startTime": "2023-10-10T11:00:00Z",
            },
            {
                "shipmentIndex": 1,
                "isPickup": False,
                "visitRequestIndex": 1,
                "startTime": "2023-10-10T11:07:00Z",
            },
        ],
    }
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, True), 3
    )
    self.assertEqual(
        cfr_json.get_num_decreasing_visit_times(self._MODEL, route, False), 2
    )


class ParseTimeStringTest(unittest.TestCase):
  """Tests for parse_time_string."""

  maxDiff = None

  def test_empty_string(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_time_string("")

  def test_date_only(self):
    timestamp = cfr_json.parse_time_string("2023-08-11")
    self.assertEqual(timestamp.year, 2023)
    self.assertEqual(timestamp.month, 8)
    self.assertIn(timestamp.day, (10, 11))

  def test_fractional_seconds(self):
    self.assertEqual(
        cfr_json.parse_time_string("2023-08-15T12:32:44.567Z"),
        datetime.datetime(
            year=2023,
            month=8,
            day=15,
            hour=12,
            minute=32,
            second=44,
            microsecond=567000,
            tzinfo=datetime.timezone.utc,
        ),
    )


class AsTimeStringTest(unittest.TestCase):
  """Tests for as_time_string."""

  maxDiff = None

  def test_no_timezone(self):
    naive_time = datetime.datetime(
        year=2023,
        month=8,
        day=15,
        hour=9,
        minute=21,
        second=32,
    )
    self.assertEqual(
        cfr_json.as_time_string(naive_time),
        # naive_time is assumed to be in the local time zone. We do not known in
        # which time zone this test runs, so we need to leave converting it to
        # UTC up to the system functions.
        naive_time.astimezone(datetime.timezone.utc).strftime(
            "%Y-%m-%dT%H:%M:%SZ"
        ),
    )

  def test_with_timezone(self):
    self.assertEqual(
        cfr_json.as_time_string(
            datetime.datetime(
                year=2023,
                month=8,
                day=15,
                hour=9,
                minute=21,
                second=32,
                tzinfo=datetime.timezone(datetime.timedelta(hours=+2)),
            )
        ),
        "2023-08-15T09:21:32+02:00",
    )


class UpdateRouteStartEndTimeFromTransitionsTest(unittest.TestCase):
  """Tests for update_route_start_end_time_from_transitions."""

  maxDiff = None

  def test_empty_route(self):
    with self.assertRaisesRegex(ValueError, "The route is empty"):
      cfr_json.update_route_start_end_time_from_transitions({}, None)
    with self.assertRaisesRegex(ValueError, "The route is empty"):
      cfr_json.update_route_start_end_time_from_transitions({}, "30s")

  def test_no_removed_delay(self):
    input_route: cfr_json.ShipmentRoute = {
        "transitions": [
            {"startTime": "2023-10-17T13:00:00Z", "totalDuration": "120s"},
            {"startTime": "2023-10-17T13:02:00Z", "totalDuration": "30s"},
            {"startTime": "2023-10-17T13:02:30Z", "totalDuration": "180s"},
        ]
    }
    route = copy.deepcopy(input_route)
    cfr_json.update_route_start_end_time_from_transitions(route, None)
    self.assertEqual(
        route,
        {
            "transitions": [
                {"startTime": "2023-10-17T13:00:00Z", "totalDuration": "120s"},
                {"startTime": "2023-10-17T13:02:00Z", "totalDuration": "30s"},
                {"startTime": "2023-10-17T13:02:30Z", "totalDuration": "180s"},
            ],
            "vehicleStartTime": "2023-10-17T13:00:00Z",
            "vehicleEndTime": "2023-10-17T13:05:30Z",
        },
    )

  def test_with_removed_delay(self):
    input_route: cfr_json.ShipmentRoute = {
        "transitions": [
            {"startTime": "2023-10-17T13:00:00Z", "totalDuration": "120s"},
            {"startTime": "2023-10-17T13:02:00Z", "totalDuration": "30s"},
            {
                "startTime": "2023-10-17T13:02:30Z",
                "totalDuration": "180s",
                "delayDuration": "60s",
            },
        ]
    }
    route = copy.deepcopy(input_route)
    cfr_json.update_route_start_end_time_from_transitions(route, "30s")
    self.assertEqual(
        route,
        {
            "transitions": [
                {"startTime": "2023-10-17T13:00:00Z", "totalDuration": "120s"},
                {"startTime": "2023-10-17T13:02:00Z", "totalDuration": "30s"},
                {
                    "startTime": "2023-10-17T13:02:30Z",
                    "totalDuration": "150s",
                    "delayDuration": "30s",
                },
            ],
            "vehicleStartTime": "2023-10-17T13:00:00Z",
            "vehicleEndTime": "2023-10-17T13:05:00Z",
        },
    )

  def test_not_enough_delay_to_remove(self):
    route: cfr_json.ShipmentRoute = {
        "transitions": [
            {"startTime": "2023-10-17T13:00:00Z", "totalDuration": "120s"},
            {"startTime": "2023-10-17T13:02:00Z", "totalDuration": "30s"},
            {"startTime": "2023-10-17T13:02:30Z", "totalDuration": "180s"},
        ]
    }
    with self.assertRaisesRegex(
        ValueError, "delay duration of the last transition"
    ):
      cfr_json.update_route_start_end_time_from_transitions(route, "30s")


class RecomputeRouteMetricsTest(unittest.TestCase):
  """Tests for recompute_route_metrics."""

  maxDiff = None

  _MODEL = {
      "shipments": [
          {
              "deliveries": [{"duration": "15s"}],
              "label": "S001",
          },
          {
              "deliveries": [
                  {"duration": "45s"},
                  {"duration": "5s"},
              ],
              "penaltyCost": 100,
              "label": "S002",
          },
          {
              "pickups": [{"duration": "300s"}],
              "deliveries": [{"duration": "120s"}],
              "label": "S003",
          },
          {
              "pickups": [{}],
              "label": "S004",
          },
      ],
      "vehicles": [{
          "label": "V001",
      }],
      "globalStartTime": "2023-10-19T22:00:00.000Z",
      "globalEndTime": "2023-10-20T22:00:00.000Z",
  }
  _ROUTE: cfr_json.ShipmentRoute = {
      "vehicleIndex": 0,
      "vehicleLabel": "V001",
      "vehicleStartTime": "2023-10-19T22:00:00.000Z",
      "vehicleEndTime": "2023-10-19T22:21:23.000Z",
      "visits": [
          {
              "shipmentIndex": 1,
              "isPickup": False,
              "visitRequestIndex": 1,
              "startTime": "2023-10-19T22:01:58.000Z",
              "detour": "0s",
              "shipmentLabel": "S002",
          },
          {
              "shipmentIndex": 0,
              "isPickup": False,
              "visitRequestIndex": 0,
              "startTime": "2023-10-19T22:02:19.000Z",
              "detour": "6s",
              "shipmentLabel": "S001",
          },
          {
              "shipmentIndex": 2,
              "isPickup": True,
              "visitRequestIndex": 0,
              "startTime": "2023-10-19T22:05:02.000Z",
              "detour": "21s",
              "shipmentLabel": "S003",
          },
          {
              "shipmentIndex": 3,
              "isPickup": True,
              "visitRequestIndex": 0,
              "startTime": "2023-10-19T22:12:37.000Z",
              "detour": "512s",
              "shipmentLabel": "S004",
          },
          {
              "shipmentIndex": 2,
              "isPickup": False,
              "visitRequestIndex": 0,
              "startTime": "2023-10-19T22:17:47.000Z",
              "detour": "0s",
              "shipmentLabel": "S003",
          },
      ],
      "transitions": [
          {
              "travelDuration": "118s",
              "travelDistanceMeters": 360,
              "waitDuration": "0s",
              "totalDuration": "118s",
              "startTime": "2023-10-19T22:00:00.000Z",
          },
          {
              "travelDuration": "16s",
              "travelDistanceMeters": 51,
              "waitDuration": "0s",
              "totalDuration": "16s",
              "startTime": "2023-10-19T22:02:03.000Z",
          },
          {
              "travelDuration": "148s",
              "travelDistanceMeters": 557,
              "waitDuration": "0s",
              "totalDuration": "148s",
              "startTime": "2023-10-19T22:02:34.000Z",
          },
          {
              "travelDuration": "155s",
              "travelDistanceMeters": 635,
              "waitDuration": "0s",
              "totalDuration": "155s",
              "startTime": "2023-10-19T22:10:02.000Z",
          },
          {
              "travelDuration": "310s",
              "travelDistanceMeters": 1079,
              "waitDuration": "0s",
              "totalDuration": "310s",
              "startTime": "2023-10-19T22:12:37.000Z",
          },
          {
              "travelDuration": "96s",
              "travelDistanceMeters": 353,
              "waitDuration": "0s",
              "totalDuration": "96s",
              "startTime": "2023-10-19T22:19:47.000Z",
          },
      ],
      "routeTotalCost": 24.418333333333333,
  }
  _EXPECTED_METRICS: cfr_json.AggregatedMetrics = {
      "performedShipmentCount": 4,
      "travelDuration": "843s",
      "waitDuration": "0s",
      "delayDuration": "0s",
      "breakDuration": "0s",
      "visitDuration": "440s",
      "totalDuration": "1283s",
      "travelDistanceMeters": 3035,
      "performedMandatoryShipmentCount": 3,
  }

  def test_empty_route(self):
    route = {}
    cfr_json.recompute_route_metrics(self._MODEL, route)
    self.assertEqual(route, {})

  def test_non_empty_route(self):
    route = copy.deepcopy(self._ROUTE)
    cfr_json.recompute_route_metrics(self._MODEL, route)
    self.assertEqual(route["metrics"], self._EXPECTED_METRICS)


class RecomputeTransitionStartsAndDurations(unittest.TestCase):
  """Tests for recompute_transition_starts_and_durations."""

  maxDiff = None

  def recompute_existing_solution(
      self,
      request: cfr_json.OptimizeToursRequest,
      response: cfr_json.OptimizeToursResponse,
  ) -> None:
    """Tests the function by restoring start time and durations on a route.

    Takes all routes from a response, removes start time and durations from them
    and uses `recompute_transition_starts_and_durations` to restore them. Checks
    that they have all been restored to the original state (which is the only
    possible).
    """
    model = request["model"]
    expected_routes = cfr_json.get_routes(response)

    # Get routes from the response, but remove transition start times and some
    # durations.
    routes = copy.deepcopy(cfr_json.get_routes(response))
    for route, expected_route in zip(routes, expected_routes):
      transitions = cfr_json.get_transitions(route)
      for transition in transitions:
        transition.pop("startTime", None)
        transition.pop("totalDuration", None)
        transition.pop("waitDuration", None)

      if transitions:
        self.assertNotEqual(route, expected_route)
      cfr_json.recompute_transition_starts_and_durations(model, route)
      self.assertEqual(route, expected_route)

  def test_moderate_local(self):
    self.recompute_existing_solution(
        testdata.json("moderate/scenario.local_request.json"),
        testdata.json("moderate/scenario.local_response.60s.json"),
    )

  def test_moderate_global(self):
    self.recompute_existing_solution(
        testdata.json("moderate/scenario.global_request.60s.json"),
        testdata.json("moderate/scenario.global_response.60s.180s.json"),
    )

  def test_insufficient_time(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [{"deliveries": [{"duration": "120s"}]}],
    }
    route: cfr_json.ShipmentRoute = {
        "vehicleIndex": 0,
        "vehicleStartTime": "2024-01-15T10:00:00Z",
        "vehicleEndTime": "2024-01-15T11:00:00z",
        "visits": [{
            "shipmentIndex": 0,
            "visitRequestIndex": 0,
            "isPickup": False,
            "startTime": "2024-01-15T10:10:00Z",
        }],
        "transitions": [
            {},
            {"breakDuration": "1800s", "travelDuration": "1200s"},
        ],
    }
    with self.assertRaisesRegex(ValueError, "minimal duration"):
      cfr_json.recompute_transition_starts_and_durations(model, route)


class UpdateTimeStringTest(unittest.TestCase):
  """Tests of update_time_string."""

  def test_invalid_time(self):
    with self.assertRaises(ValueError):
      cfr_json.update_time_string("foobar", datetime.timedelta(seconds=12))

  def test_update_some_time(self):
    self.assertEqual(
        cfr_json.update_time_string(
            "2023-08-15T12:32:44Z", datetime.timedelta(hours=-3)
        ),
        "2023-08-15T09:32:44Z",
    )


class ParseDurationStringTest(unittest.TestCase):
  """Tests for parse_duration_string."""

  def test_empty_string(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_duration_string("")

  def test_invalid_format(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_duration_string("foobar")

  def test_invalid_suffix(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_duration_string("2h")

  def test_invalid_amount(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_duration_string("ABCs")

  def test_valid_parse(self):
    self.assertEqual(
        cfr_json.parse_duration_string(None), datetime.timedelta(seconds=0)
    )
    self.assertEqual(
        cfr_json.parse_duration_string("0s"),
        datetime.timedelta(seconds=0),
    )
    self.assertEqual(
        cfr_json.parse_duration_string("1800s"),
        datetime.timedelta(minutes=30),
    )
    self.assertEqual(
        cfr_json.parse_duration_string("0.5s"),
        datetime.timedelta(seconds=0.5),
    )


class MakeDurationStringTest(unittest.TestCase):
  """Tests for _make_duration_string."""

  def test_seconds(self):
    self.assertEqual(
        cfr_json.as_duration_string(datetime.timedelta(seconds=29)),
        "29s",
    )

  def test_hours(self):
    self.assertEqual(
        cfr_json.as_duration_string(datetime.timedelta(hours=2)),
        "7200s",
    )

  def test_fractions(self):
    self.assertEqual(
        cfr_json.as_duration_string(datetime.timedelta(milliseconds=500)),
        "0.5s",
    )


class EncodePolylineTest(unittest.TestCase):
  """Tests for encode_polyline."""

  def test_empty(self):
    self.assertEqual(cfr_json.encode_polyline(()), "")

  def test_maps_doc_example(self):
    self.assertSequenceEqual(
        cfr_json.encode_polyline((
            {"latitude": 38.5, "longitude": -120.2},
            {"latitude": 40.7, "longitude": -120.95},
            {"latitude": 43.252, "longitude": -126.453},
        )),
        "_p~iF~ps|U_ulLnnqC_mqNvxq`@",
    )


class DecodePolylineTest(unittest.TestCase):
  """Tests of decode_polyline."""

  maxDiff = None

  def test_empty(self):
    self.assertSequenceEqual(cfr_json.decode_polyline(""), ())

  def test_maps_doc_example(self):
    self.assertSequenceEqual(
        cfr_json.decode_polyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@"),
        (
            {"latitude": 38.5, "longitude": -120.2},
            {"latitude": 40.7, "longitude": -120.95},
            {"latitude": 43.252, "longitude": -126.453},
        ),
    )

  def test_encode_and_decode(self):
    polyline = (
        {"latitude": 38.5, "longitude": -120.2},
        {"latitude": 40.7, "longitude": -120.95},
        {"latitude": 40.7, "longitude": -122.31},
        {"latitude": 40.4, "longitude": -122.31},
        {"latitude": 43.252, "longitude": -126.453},
    )
    encoded1 = cfr_json.encode_polyline(polyline)
    decoded1 = cfr_json.decode_polyline(encoded1)
    self.assertSequenceEqual(decoded1, polyline)
    encoded2 = cfr_json.encode_polyline(decoded1)
    self.assertEqual(encoded1, encoded2)

  def test_missing_lng(self):
    with self.assertRaisesRegex(ValueError, "Longitude is missing"):
      cfr_json.decode_polyline("_p~iF")

  def test_incomplete_varint(self):
    with self.assertRaisesRegex(ValueError, "Invalid varint encoding"):
      cfr_json.decode_polyline("_p~iF~ps")


class MergePolylinesFromTransitionsTest(unittest.TestCase):
  """Tests for merge_polylines_from_transitions."""

  maxDiff = None

  def test_no_transitions(self):
    self.assertIsNone(cfr_json.merge_polylines_from_transitions(()))

  def test_no_polylines(self):
    transitions: Sequence[cfr_json.Transition] = (
        {"travelDistanceMeters": 120},
        {"travelDistanceMeters": 50},
        {"travelDistanceMeters": 0},
        {"travelDistanceMeters": 32},
    )
    self.assertIsNone(cfr_json.merge_polylines_from_transitions(transitions))

  def test_with_some_polylines(self):
    points = (
        {"latitude": 38.5, "longitude": -120.2},
        {"latitude": 40.7, "longitude": -120.95},
        {"latitude": 40.7, "longitude": -122.31},
        {"latitude": 40.4, "longitude": -122.31},
        {"latitude": 43.252, "longitude": -126.453},
    )
    transitions: Sequence[cfr_json.Transition] = (
        {"routePolyline": {"points": cfr_json.encode_polyline(points[0:2])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[2:3])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[3:])}},
    )
    self.assertEqual(
        cfr_json.merge_polylines_from_transitions(transitions),
        {"points": cfr_json.encode_polyline(points)},
    )

  def test_with_some_polylines_and_zero_travel(self):
    points = (
        {"latitude": 38.5, "longitude": -120.2},
        {"latitude": 40.7, "longitude": -120.95},
        {"latitude": 40.7, "longitude": -122.31},
        {"latitude": 40.4, "longitude": -122.31},
        {"latitude": 43.252, "longitude": -126.453},
    )
    transitions: Sequence[cfr_json.Transition] = (
        {"routePolyline": {"points": cfr_json.encode_polyline(points[0:2])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[2:3])}},
        {"routePolyline": {}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[3:])}},
    )
    self.assertEqual(
        cfr_json.merge_polylines_from_transitions(transitions),
        {"points": cfr_json.encode_polyline(points)},
    )

  def test_with_some_polylines_but_not_all(self):
    points = (
        {"latitude": 38.5, "longitude": -120.2},
        {"latitude": 40.7, "longitude": -120.95},
        {"latitude": 40.7, "longitude": -122.31},
        {"latitude": 40.4, "longitude": -122.31},
        {"latitude": 43.252, "longitude": -126.453},
    )
    transitions: Sequence[cfr_json.Transition] = (
        {"routePolyline": {"points": cfr_json.encode_polyline(points[0:2])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[2:3])}},
        {"travelDistanceMeters": 123},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[3:])}},
    )
    with self.assertRaisesRegex(
        ValueError, "Either all transitions with non-zero traveled distance"
    ):
      cfr_json.merge_polylines_from_transitions(transitions)

  def test_with_some_polylines_and_duplicate_points(self):
    points = (
        {"latitude": 38.5, "longitude": -120.2},
        {"latitude": 40.7, "longitude": -120.95},
        {"latitude": 40.7, "longitude": -122.31},
        {"latitude": 40.4, "longitude": -122.31},
        {"latitude": 43.252, "longitude": -126.453},
    )
    transitions: Sequence[cfr_json.Transition] = (
        # NOTE(ondrasej): In the code below, the index ranges overlap and the
        # end of each transition polyline is the start of the following
        # transition polyline.
        {"routePolyline": {"points": cfr_json.encode_polyline(points[0:3])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[2:3])}},
        {"routePolyline": {"points": cfr_json.encode_polyline(points[2:])}},
    )
    self.assertEqual(
        cfr_json.merge_polylines_from_transitions(transitions),
        {"points": cfr_json.encode_polyline(points)},
    )


def _datetime_utc(year, month, day, hour, minute, second) -> datetime.datetime:
  """Returns the given datetime in the UTC time zone."""
  return datetime.datetime(
      year, month, day, hour, minute, second, tzinfo=datetime.timezone.utc
  )


if __name__ == "__main__":
  unittest.main()
