# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

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


class ParseTimeStringTest(unittest.TestCase):
  """Tests for parse_time_string."""

  maxDiff = None

  def test_empty_string(self):
    with self.assertRaises(ValueError):
      cfr_json.parse_time_string("")

  def test_date_only(self):
    self.assertEqual(
        cfr_json.parse_time_string("2023-08-11"),
        datetime.datetime(year=2023, month=8, day=11),
    )

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
        ),
    )


class AsTimeStringTest(unittest.TestCase):
  """Tests for as_time_string."""

  maxDiff = None

  def test_no_timezone(self):
    self.assertEqual(
        cfr_json.as_time_string(
            datetime.datetime(
                year=2023,
                month=8,
                day=15,
                hour=9,
                minute=21,
                second=32,
            )
        ),
        "2023-08-15T09:21:32Z",
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


if __name__ == "__main__":
  unittest.main()
