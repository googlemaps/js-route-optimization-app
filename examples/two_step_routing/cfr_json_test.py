# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

import copy
import datetime
import unittest

from . import cfr_json


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

  def test_with_unsupported_breaks(self):
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
    with self.assertRaisesRegex(ValueError, "Unsupported case"):
      cfr_json.get_vehicle_max_working_hours(self._SHIPMENT_MODEL, vehicle)


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


class MakeAllShipmentsOptional(unittest.TestCase):
  """Tests for make_all_shipments_optional."""

  maxDiff = None

  def test_no_shipments(self):
    model: cfr_json.ShipmentModel = {}
    cfr_json.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(model, {})

  def test_default_num_items(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002"},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    cfr_json.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 1000},
                {"label": "S0003,S0004,S0005", "penaltyCost": 1000},
            ]
        },
    )

  def test_with_num_elements_in_label(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002"},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    cfr_json.make_all_shipments_optional(
        model, cost=1000, get_num_items=cfr_json.get_num_elements_in_label
    )
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 1000},
                {"label": "S0003,S0004,S0005", "penaltyCost": 3000},
            ]
        },
    )

  def test_with_existing_optional_shipments(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S0001"},
            {"label": "S0002", "penaltyCost": 12345},
            {"label": "S0003,S0004,S0005"},
        ],
    }
    cfr_json.make_all_shipments_optional(model, cost=1000)
    self.assertEqual(
        model,
        {
            "shipments": [
                {"label": "S0001", "penaltyCost": 1000},
                {"label": "S0002", "penaltyCost": 12345},
                {"label": "S0003,S0004,S0005", "penaltyCost": 1000},
            ]
        },
    )


class RemoveLoadLimitstest(unittest.TestCase):
  """Tests for remove_load_limits."""

  def test_no_vehicles(self):
    model: cfr_json.ShipmentModel = {}
    cfr_json.remove_load_limits(model)
    self.assertEqual(model, {})

  def test_remove_load_limits(self):
    model: cfr_json.ShipmentModel = {
        "vehicles": [
            {
                "label": "V0001",
                "loadLimits": {
                    "ore": {"maxLoad": "32"},
                    "wheat": {"maxLoad": "12"},
                },
            },
            {
                "label": "V0002",
            },
        ]
    }
    cfr_json.remove_load_limits(model)
    self.assertEqual(
        model,
        {
            "vehicles": [
                {
                    "label": "V0001",
                },
                {
                    "label": "V0002",
                },
            ]
        },
    )


class RemovePickupsTest(unittest.TestCase):
  """Tests for remove_pickups."""

  maxDiff = None

  def test_no_pickup(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [
                {
                    "timeWindows": [
                        {
                            "startTime": "2023-10-03T08:30:00Z",
                            "endTime": "2023-10-03T08:30:00Z",
                        },
                        {
                            "startTime": "2023-10-03T12:00:00Z",
                            "endTime": "2023-10-03T14:00:00Z",
                        },
                    ]
                }
            ],
        }],
    }
    original_model = copy.deepcopy(model)
    cfr_json.remove_pickups(model)
    self.assertEqual(model, original_model)

  def test_no_deliveries(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [
            {
                "pickups": [
                    {
                        "timeWindows": [{
                            "startTime": "2023-10-03T09:00:00Z",
                            "endTime": "2023-10-03T12:00:00Z",
                        }]
                    }
                ]
            }
        ],
    }
    original_model = copy.deepcopy(model)
    cfr_json.remove_pickups(model)
    self.assertEqual(model, original_model)

  def test_no_delivery_time_windows(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [
            {
                "pickups": [{
                    "timeWindows": [{
                        "startTime": "2023-10-03T09:00:00Z",
                        "endTime": "2023-10-03T10:00:00Z",
                    }],
                    "duration": "600s",
                }],
                "deliveries": [{
                    "duration": "12s",
                }],
            },
        ],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [
            {
                "deliveries": [{
                    "duration": "12s",
                    "timeWindows": [{"startTime": "2023-10-03T09:10:00Z"}],
                }],
            },
        ],
    }
    cfr_json.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_delivery_time_windows(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [{
                "timeWindows": [
                    {
                        "startTime": "2023-10-03T08:44:00Z",
                        "endTime": "2023-10-03T09:00:00Z",
                    },
                    {
                        "startTime": "2023-10-03T11:00:00Z",
                    },
                ],
                "duration": "60s",
            }],
            "deliveries": [{
                "timeWindows": [
                    {
                        "endTime": "2023-10-03T08:10:00Z",
                    },
                    {
                        "startTime": "2023-10-03T08:15:00Z",
                        "softStartTime": "2023-10-03T08:30:00Z",
                        "softEndTime": "2023-10-03T08:40:00Z",
                        "endTime": "2023-10-03T14:00:00Z",
                        "costPerHourBeforeSoftStartTime": 6,
                        "costPerHourAfterSoftEndTime": 12,
                    },
                    {
                        "startTime": "2023-10-03T16:00:00Z",
                        "endTime": "2023-10-03T17:00:00Z",
                    },
                ],
                "duration": "120s",
            }],
        }],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [{
                "timeWindows": [
                    {
                        "startTime": "2023-10-03T08:45:00Z",
                        "softEndTime": "2023-10-03T08:45:00Z",
                        "endTime": "2023-10-03T14:00:00Z",
                        "costPerHourAfterSoftEndTime": 12,
                    },
                    {
                        "startTime": "2023-10-03T16:00:00Z",
                        "endTime": "2023-10-03T17:00:00Z",
                    },
                ],
                "duration": "120s",
            }],
        }],
    }
    cfr_json.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_delivery_time_windows_with_visit_cost(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [
                {
                    "timeWindows": [{"startTime": "2023-10-03T08:44:00Z"}],
                    "duration": "60s",
                    "cost": 5,
                },
                {
                    "timeWindows": [{"startTime": "2023-10-03T11:00:00Z"}],
                    "duration": "60s",
                    "cost": 3,
                },
            ],
            "deliveries": [{
                "timeWindows": [{
                    "softEndTime": "2023-10-03T08:40:00Z",
                    "endTime": "2023-10-03T14:00:00Z",
                    "costPerHourAfterSoftEndTime": 12,
                }],
                "cost": 10,
                "duration": "120s",
            }],
        }],
    }
    expected_model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "deliveries": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T08:45:00Z",
                    "softEndTime": "2023-10-03T08:45:00Z",
                    "endTime": "2023-10-03T14:00:00Z",
                    "costPerHourAfterSoftEndTime": 12,
                }],
                "duration": "120s",
                "cost": 14,
            }],
        }],
    }
    cfr_json.remove_pickups(model)
    self.assertEqual(model, expected_model)

  def test_infeasible_shipment(self):
    model: cfr_json.ShipmentModel = {
        "globalStartTime": "2023-10-03T08:00:00Z",
        "globalEndTime": "2023-10-03T18:00:00Z",
        "shipments": [{
            "pickups": [{
                "timeWindows": [{
                    "startTime": "2023-10-03T12:00:00Z",
                }],
                "duration": "7200s",
            }],
            "deliveries": [
                {
                    "timeWindows": [{
                        "startTime": "2023-10-03T13:00:00Z",
                        "endTime": "2023-10-03T13:30:00Z",
                    }]
                }
            ],
        }],
    }
    with self.assertRaisesRegex(ValueError, "is infeasible"):
      cfr_json.remove_pickups(model)


class SplitShipmentTest(unittest.TestCase):
  """Tests for split_shipment."""

  maxDiff = None

  def test_small_shipment_no_item_types(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6",
        "loadDemands": {
            "num_items": {"amount": "6"},
        },
    }
    # No splitting happens when the number of items is smaller than max_items.
    original_shipment = copy.deepcopy(shipment)
    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 10))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

    # No splitting happens also when the number of items is equal to max_items.
    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 6))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

  def test_small_shipment_with_item_types(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6",
        "loadDemands": {
            "num_items": {"amount": "6"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }
    # No splitting happens when the number of items is smaller than max_items.
    original_shipment = copy.deepcopy(shipment)
    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 10))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

    # No splitting happens also when the number of items is equal to max_items.
    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 6))
    self.assertEqual(shipment, original_shipment)
    self.assertSequenceEqual(new_shipments, ())

  def test_split_once(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6, S7, S8, S9",
        "allowedVehicleIndices": [1, 2, 3],
        "loadDemands": {
            "num_items": {"amount": "9"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }

    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 5))
    self.assertEqual(
        shipment,
        {
            "label": "S1, S2, S3, S4, S5",
            "allowedVehicleIndices": [1, 2, 3],
            "loadDemands": {
                "num_items": {"amount": "5"},
                "boxes": {"amount": "3"},
                "envelopes": {"amount": "2"},
            },
        },
    )
    self.assertSequenceEqual(
        new_shipments,
        (
            {
                "label": "S6, S7, S8, S9",
                "allowedVehicleIndices": [1, 2, 3],
                "loadDemands": {
                    "num_items": {"amount": "4"},
                    "envelopes": {"amount": "1"},
                },
            },
        ),
    )

  def test_split_many_times(self):
    shipment: cfr_json.Shipment = {
        "label": "S1, S2, S3, S4, S5, S6, S7, S8, S9",
        "loadDemands": {
            "num_items": {"amount": "9"},
            "boxes": {"amount": "3"},
            "envelopes": {"amount": "3"},
        },
    }

    new_shipments = list(cfr_json.split_shipment(shipment, "num_items", 3))
    self.assertEqual(
        shipment,
        {
            "label": "S1, S2, S3",
            "loadDemands": {
                "num_items": {"amount": "3"},
                "boxes": {"amount": "3"},
            },
        },
    )
    self.assertSequenceEqual(
        new_shipments,
        (
            {
                "label": "S4, S5, S6",
                "loadDemands": {
                    "num_items": {"amount": "3"},
                    "envelopes": {"amount": "3"},
                },
            },
            {
                "label": "S7, S8, S9",
                "loadDemands": {
                    "num_items": {"amount": "3"},
                },
            },
        ),
    )


def _datetime_utc(year, month, day, hour, minute, second) -> datetime.datetime:
  """Returns the given datetime in the UTC time zone."""
  return datetime.datetime(
      year, month, day, hour, minute, second, tzinfo=datetime.timezone.utc
  )


if __name__ == "__main__":
  unittest.main()
