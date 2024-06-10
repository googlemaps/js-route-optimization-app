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

import copy
import datetime
import unittest

from . import analysis
from ..json import cfr_json
from ..testdata import testdata


_SCENARIO: cfr_json.OptimizeToursRequest = testdata.json(
    "moderate/scenario.merged_request.60s.180s.json"
)
_SOLUTION: cfr_json.OptimizeToursResponse = testdata.json(
    "moderate/scenario.merged_response.60s.180s.json"
)
_PARKING_JSON = testdata.json("moderate/parking.json")


class GroupGlobalVisits(unittest.TestCase):
  """Tests for group_global_visits."""

  def setUp(self):
    super().setUp()
    self._scenario = analysis.Scenario(
        name="moderate",
        scenario=_SCENARIO,
        solution=_SOLUTION,
        parking_json=_PARKING_JSON,
    )

  def test_grouped_shipments_no_breaks(self):
    groups = analysis.group_global_visits(
        self._scenario, vehicle_index=0, split_by_breaks=False
    )
    expected_groups = (
        (
            (None, 1, 1),
            ("P0002", 1, 19),
            (None, 1, 1),
            (None, 1, 1),
            ("P0012", 2, 20),
        )
        + ((None, 1, 1),) * 6
        + (("P0001", 1, 1),)
        + ((None, 1, 1),) * 5
        + (("P0001", 1, 1),)
        + ((None, 1, 1),) * 5
        + (("P0012", 1, 14),)
        + ((None, 1, 1),) * 4
        + (
            ("P0007", 2, 8),
            ("P0009", 1, 12),
            (None, 1, 1),
            ("P0014", 1, 2),
        )
    )
    for group, expected_group in zip(groups, expected_groups, strict=True):
      (
          tag,
          num_rounds,
          shipments,
          arrival_visit_index,
          departure_visit_index,
      ) = group

      visits = cfr_json.get_visits(self._scenario.routes[0])
      if tag is not None:
        self.assertEqual(
            visits[arrival_visit_index]["shipmentLabel"], f"{tag} arrival"
        )
        self.assertEqual(
            visits[departure_visit_index]["shipmentLabel"], f"{tag} departure"
        )

      expected_tag, expected_num_rounds, expected_num_shipments = expected_group
      with self.subTest(f"group {expected_group!r}"):
        self.assertEqual(tag, expected_tag)
        self.assertEqual(num_rounds, expected_num_rounds)
        self.assertEqual(len(shipments), expected_num_shipments)

  def test_grouped_shipments_with_breaks(self):
    groups = analysis.group_global_visits(
        self._scenario, vehicle_index=0, split_by_breaks=True
    )
    expected_groups = (
        (
            (None, 1, 1),
            ("P0002", 1, 19),
            (None, 1, 1),
            (None, 1, 1),
            ("P0012", 2, 20),
        )
        + ((None, 1, 1),) * 6
        + (("P0001", 1, 1),)
        + ((None, 1, 1),) * 5
        + (("P0001", 1, 1),)
        + ((None, 1, 1),) * 5
        + (("P0012", 1, 14),)
        + ((None, 1, 1),) * 4
        + (
            ("P0007", 1, 2),
            ("P0007", 1, 6),
            ("P0009", 1, 12),
            (None, 1, 1),
            ("P0014", 1, 2),
        )
    )
    for group, expected_group in zip(groups, expected_groups, strict=True):
      tag, num_rounds, shipments, arrival_visit_index, departure_visit_index = (
          group
      )

      visits = cfr_json.get_visits(self._scenario.routes[0])
      if tag is not None:
        self.assertEqual(
            visits[arrival_visit_index]["shipmentLabel"], f"{tag} arrival"
        )
        self.assertEqual(
            visits[departure_visit_index]["shipmentLabel"], f"{tag} departure"
        )

      expected_tag, expected_num_rounds, expected_num_shipments = expected_group
      with self.subTest(f"group {expected_group!r}"):
        self.assertEqual(tag, expected_tag)
        self.assertEqual(num_rounds, expected_num_rounds)
        self.assertEqual(len(shipments), expected_num_shipments)


class GetNumPingPongsTest(unittest.TestCase):
  """Tests for get_num_ping_pongs."""

  def setUp(self):
    super().setUp()
    self._scenario = analysis.Scenario(
        name="moderate",
        scenario=_SCENARIO,
        solution=_SOLUTION,
        parking_json=_PARKING_JSON,
    )

  def test_with_breaks_vehicle_0(self):
    num_ping_pongs, bad_ping_pong_tags = analysis.get_num_ping_pongs(
        self._scenario, vehicle_index=0, split_by_breaks=True
    )
    self.assertEqual(num_ping_pongs, 1)
    self.assertSequenceEqual(bad_ping_pong_tags, ("P0012",))

  def test_without_breaks_vehicle_0(self):
    # Vehicle 0 uses breaks, and one of them is in the middle of a bad parking
    # ping-pong.
    num_ping_pongs, bad_ping_pong_tags = analysis.get_num_ping_pongs(
        self._scenario, vehicle_index=0, split_by_breaks=False
    )
    self.assertEqual(num_ping_pongs, 2)
    self.assertSequenceEqual(bad_ping_pong_tags, ("P0012", "P0007"))

  def test_with_breaks_vehicle_1(self):
    num_ping_pongs, bad_ping_pong_tags = analysis.get_num_ping_pongs(
        self._scenario, vehicle_index=1, split_by_breaks=True
    )
    self.assertEqual(num_ping_pongs, 2)
    self.assertSequenceEqual(bad_ping_pong_tags, ("P0004",))

  def test_without_breaks_vehicle_1(self):
    # Vehicle 1 does not use breaks.
    num_ping_pongs, bad_ping_pong_tags = analysis.get_num_ping_pongs(
        self._scenario, vehicle_index=1, split_by_breaks=False
    )
    self.assertEqual(num_ping_pongs, 2)
    self.assertSequenceEqual(bad_ping_pong_tags, ("P0004",))


class GetNumSandwichesTest(unittest.TestCase):
  """Tests for get_num_sandwiches."""

  def setUp(self):
    super().setUp()
    self._scenario = analysis.Scenario(
        name="moderate",
        scenario=_SCENARIO,
        solution=_SOLUTION,
        parking_json=_PARKING_JSON,
    )

  def test_bad_sandwiches_v0001(self):
    num_sandwiches, bad_sandwich_tags = analysis.get_num_sandwiches(
        self._scenario, 0
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, ("P0001",))

  def test_bad_sandwiches_v0008(self):
    num_sandwiches, bad_sandwich_tags = analysis.get_num_sandwiches(
        self._scenario, 7
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, ("P0005",))


class AnalyseBadSandwichesTest(unittest.TestCase):
  """Tests for get_num_sandwiches."""

  def setUp(self):
    super().setUp()
    self._scenario = analysis.Scenario(
        name="moderate",
        scenario=_SCENARIO,
        solution=_SOLUTION,
        parking_json=_PARKING_JSON,
    )

  def test_bad_sandwiches_v0001(self):
    num_sandwiches, bad_sandwich_tags = analysis.analyse_bad_sandwiches(
        self._scenario, 0
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, ())

  def test_bad_sandwiches_v0001_after_removing_time_windows(self):
    updated_scenario = copy.deepcopy(self._scenario)
    shipments = updated_scenario.model["shipments"]
    for shipment in shipments:
      pickups = shipment.get("pickups", ())
      for pickup in pickups:
        pickup["timeWindows"] = []

      deliveries = shipment.get("deliveries", ())
      for delivery in deliveries:
        delivery["timeWindows"] = []

    num_sandwiches, bad_sandwich_tags = analysis.analyse_bad_sandwiches(
        updated_scenario, 0
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, ["P0001", "P0012"])

  def test_bad_sandwiches_v0008(self):
    num_sandwiches, bad_sandwich_tags = analysis.analyse_bad_sandwiches(
        self._scenario, 7
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, [])

  def test_bad_sandwiches_v0008_after_removing_time_windows(self):
    updated_scenario = copy.deepcopy(self._scenario)
    shipments = updated_scenario.model["shipments"]
    for shipment in shipments:
      pickups = shipment.get("pickups", ())
      for pickup in pickups:
        pickup["timeWindows"] = []

      deliveries = shipment.get("deliveries", ())
      for delivery in deliveries:
        delivery["timeWindows"] = []

    num_sandwiches, bad_sandwich_tags = analysis.analyse_bad_sandwiches(
        updated_scenario, 7
    )
    self.assertEqual(num_sandwiches, 2)
    self.assertSequenceEqual(bad_sandwich_tags, ["P0005", "P0002"])


class GetParkingPartyStats(unittest.TestCase):
  """Tests for get_parking_party_stats."""

  maxDiff = None

  def setUp(self):
    super().setUp()
    self._scenario = analysis.Scenario(
        name="moderate",
        scenario=_SCENARIO,
        solution=_SOLUTION,
        parking_json=_PARKING_JSON,
    )

  def test_get_parking_party_stats_no_buffer(self):
    party_stats = analysis.get_parking_party_stats(
        self._scenario, datetime.timedelta()
    )

    expected_party_stats = analysis.ParkingPartyStats(
        num_parkings_with_multiple_vehicles=19,
        num_party_visits=32,
        max_vehicles_at_parking_at_once=2,
        num_overlapping_visit_pairs=2,
        overlapping_visits=[
            analysis.OverlappingParkingVisit(
                parking_tag="P0013",
                start_time=datetime.datetime(
                    2023, 11, 17, 11, 57, 17, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 12, 40, 55, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({3, 5}),
            ),
            analysis.OverlappingParkingVisit(
                parking_tag="P0013",
                start_time=datetime.datetime(
                    2023, 11, 17, 14, 28, 28, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 14, 50, 42, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({1, 2}),
            ),
        ],
    )
    self.assertEqual(party_stats, expected_party_stats)

  def test_get_parking_party_stats_15m_buffer(self):
    party_stats = analysis.get_parking_party_stats(
        self._scenario, datetime.timedelta(minutes=15)
    )

    expected_party_stats = analysis.ParkingPartyStats(
        num_parkings_with_multiple_vehicles=19,
        num_party_visits=32,
        max_vehicles_at_parking_at_once=2,
        num_overlapping_visit_pairs=4,
        overlapping_visits=[
            analysis.OverlappingParkingVisit(
                parking_tag="P0012",
                start_time=datetime.datetime(
                    2023, 11, 17, 14, 43, 45, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 14, 47, 41, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({0, 5}),
            ),
            analysis.OverlappingParkingVisit(
                parking_tag="P0012",
                start_time=datetime.datetime(
                    2023, 11, 17, 16, 0, 9, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 16, 9, 21, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({5, 7}),
            ),
            analysis.OverlappingParkingVisit(
                parking_tag="P0013",
                start_time=datetime.datetime(
                    2023, 11, 17, 11, 42, 17, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 12, 55, 55, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({3, 5}),
            ),
            analysis.OverlappingParkingVisit(
                parking_tag="P0013",
                start_time=datetime.datetime(
                    2023, 11, 17, 14, 13, 28, tzinfo=datetime.timezone.utc
                ),
                end_time=datetime.datetime(
                    2023, 11, 17, 15, 5, 42, tzinfo=datetime.timezone.utc
                ),
                vehicles=frozenset({1, 2}),
            ),
        ],
    )
    self.assertEqual(party_stats, expected_party_stats)


class VehicleShipmentGroupsTest(unittest.TestCase):
  """Tests for get_vehicle_shipment_groups."""

  def test_without_allowed_vehicle_indices(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S001"},
            {"label": "S002"},
            {"label": "S003"},
            {"label": "S004"},
            {"label": "S005"},
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
        ],
    }
    self.assertSequenceEqual(
        analysis.get_vehicle_shipment_groups(model),
        (({0, 1}, {0, 1, 2, 3, 4}),),
    )

  def test_with_some_allowed_vehicle_indices(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S001", "allowedVehicleIndices": [0, 2]},
            {"label": "S002", "allowedVehicleIndices": [0, 2]},
            {"label": "S003", "allowedVehicleIndices": [1]},
            {"label": "S004", "allowedVehicleIndices": [1, 2, 3]},
            {"label": "S005"},
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
            {"label": "V003"},
            {"label": "V004"},
        ],
    }
    self.assertCountEqual(
        analysis.get_vehicle_shipment_groups(model),
        (({0, 2}, {0, 1}), ({1}, {2}), ({1, 2, 3}, {3}), ({0, 1, 2, 3}, {4})),
    )


if __name__ == "__main__":
  unittest.main()
