# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

import copy
import dataclasses
import datetime
from importlib import resources
import json
import unittest

from ..json import cfr_json
from . import two_step_routing


# Provides easy access to files under `./testdata`. See `_json()` below for
# example use.
_TESTDATA = resources.files(__package__).joinpath("testdata")


def _json(path: str):
  """Parses a JSON file at `path` and returns it as a dict/list structure.

  Args:
    path: The path of the JSON file, relative to `./testdata`.

  Returns:
    The JSON data structure.
  """
  return json.loads(_TESTDATA.joinpath(path).read_bytes())


class ParkingLocationTest(unittest.TestCase):
  """Tests for ParkingLocation."""

  maxDiff = None

  def test_initialize_from_waypoint(self):
    parking = two_step_routing.ParkingLocation(
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

  def test_initialize_from_coordinates(self):
    parking = two_step_routing.ParkingLocation(
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
      two_step_routing.ParkingLocation(
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
      two_step_routing.ParkingLocation(
          tag="P003",
      )


class LoadParkingFromJsonTest(unittest.TestCase):
  """Tests for load_parking_from_json."""

  maxDiff = None

  def test_no_data_at_all(self):
    with self.assertRaisesRegex(ValueError, "doesn't have the key"):
      two_step_routing.load_parking_from_json({})

  def test_no_parking_locations(self):
    with self.assertRaisesRegex(ValueError, "doesn't have the key"):
      two_step_routing.load_parking_from_json({"parking_for_shipment": {}})

  def test_invalid_parking_for_shipment_format(self):
    with self.assertRaisesRegex(ValueError, "foo"):
      two_step_routing.load_parking_from_json(
          {"parking_locations": [], "parking_for_shipment": {"foo": "123"}}
      )

  def test_invalid_parking_location_definition(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid parking location specification"
    ):
      two_step_routing.load_parking_from_json({
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
                "tag": "P007",
                "travel_mode": 2,
            },
        ],
        "parking_for_shipment": {"6": "P002", "7": "P002"},
    }
    parkings, parking_for_shipment = two_step_routing.load_parking_from_json(
        parking_json
    )
    self.assertSequenceEqual(
        parkings,
        (
            two_step_routing.ParkingLocation(
                coordinates={"latitude": 48.86482, "longitude": 2.34932},
                tag="P002",
                travel_mode=2,
                delivery_load_limits={"ore": 2},
                arrival_duration="180s",
                departure_duration="180s",
                reload_duration="60s",
                arrival_cost=1000,
            ),
            two_step_routing.ParkingLocation(
                waypoint={
                    "placeId": "ChIJixLu7DBu5kcRQnIpA2tErS8",
                    "sideOfRoad": True,
                },
                tag="P007",
                travel_mode=2,
            ),
        ),
    )
    self.assertDictEqual(parking_for_shipment, {6: "P002", 7: "P002"})


class PlannerTest(unittest.TestCase):
  """Tests for the Planner class."""

  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=10000,
      min_average_shipments_per_round=2,
  )
  _OPTIONS_GROUP_BY_PARKING = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      local_model_grouping=two_step_routing.LocalModelGrouping.PARKING,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = _json("small/request.json")
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(_json("small/parking.json"))
  )

  # The expected local model request created by the two-step planner for the
  # base request defined above.
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "small/expected_local_request.json"
  )

  # An example response from the CFR solver for _EXPECTED_LOCAL_REQUEST_JSON.
  # Fields that are not needed by the two-step solver were removed from the
  # response to make it shorter.
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "small/local_response.json"
  )

  _EXPECTED_LOCAL_REQUEST_GROUP_BY_PARKING_JSON: (
      cfr_json.OptimizeToursRequest
  ) = _json("small/expected_local_request_group_by_parking.json")

  # The expected global model request created by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST_JSON as the
  # solution of the local model.
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "small/expected_global_request.json"
  )

  # An example response from the CFR solver for _EXPECTED_GLOBAL_REQUEST_JSON.
  # Fields that are not needed by the two-step solver were removed from the
  # response to make it shorter.
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "small/global_response.json"
  )

  # The expected merged model request created by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST and
  # _EXPECTED_GLOBAL_REQUEST as the solutions of the local and global models.
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "small/expected_merged_request.json"
  )

  # The expected merged model response creatd by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST and
  # _EXPECTED_GLOBAL_REQUEST as the solutions of the local and global models.
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "small/expected_merged_response.json"
  )

  def validate_response(
      self,
      request: cfr_json.OptimizeToursRequest,
      response: cfr_json.OptimizeToursResponse,
  ):
    """Validates basic properties of the merged response."""
    vehicles = request["model"]["vehicles"]
    shipments = request["model"]["shipments"]
    num_vehicles = len(vehicles)
    num_shipments = len(shipments)
    routes = response["routes"]
    self.assertEqual(num_vehicles, len(routes))

    picked_up_shipments = set()
    delivered_shipments = set()

    for vehicle_index in range(num_vehicles):
      with self.subTest(vehicle_index=vehicle_index):
        route = routes[vehicle_index]
        vehicle = vehicles[vehicle_index]
        self.assertEqual(route["vehicleLabel"], vehicle["label"])
        self.assertEqual(route.get("vehicleIndex", 0), vehicle_index)

        if "visits" not in route:
          self.assertNotIn("transitions", route)
          continue

        visits = route["visits"]
        transitions = route["transitions"]
        self.assertEqual(len(visits) + 1, len(transitions))

        total_duration = datetime.timedelta()
        current_time = cfr_json.parse_time_string(route["vehicleStartTime"])
        for visit_index, visit in enumerate(visits):
          with self.subTest(visit_index=visit_index):
            shipment_index = visit.get("shipmentIndex", 0)
            # Make sure that each shipment is delivered at most once, and that
            # if a shipment has a pickup and a delivery, it is picked up before
            # it is delivered.
            self.assertNotIn(shipment_index, delivered_shipments)

            is_pickup = visit.get("isPickup", False)
            if is_pickup:
              self.assertNotIn(
                  shipment_index,
                  picked_up_shipments,
                  "Shipment was already picked up",
              )
              picked_up_shipments.add(shipment_index)
            else:
              delivered_shipments.add(shipment_index)

            shipment = shipments[shipment_index]
            transition = transitions[visit_index]
            self.assertEqual(
                current_time,
                cfr_json.parse_time_string(transition["startTime"]),
            )
            transition_duration = cfr_json.parse_duration_string(
                transition["totalDuration"]
            )
            visit_duration = cfr_json.parse_duration_string(
                shipment["deliveries"][0]["duration"]
            )
            total_duration += transition_duration
            current_time += transition_duration
            self.assertEqual(
                current_time,
                cfr_json.parse_time_string(visit["startTime"]),
            )
            total_duration += visit_duration
            current_time += visit_duration
        total_duration += cfr_json.parse_duration_string(
            transitions[-1]["totalDuration"]
        )
        self.assertEqual(
            total_duration,
            cfr_json.parse_time_string(route["vehicleEndTime"])
            - cfr_json.parse_time_string(route["vehicleStartTime"]),
        )

    # Collect skipped shipment indices.
    skipped_shipments = set()
    for skipped_shipment in response.get("skippedShipments", ()):
      skipped_shipments.add(skipped_shipment["index"])

    # A skipped shipment should not be picked up or delivered.
    self.assertEqual(set(), skipped_shipments.intersection(picked_up_shipments))
    self.assertEqual(set(), skipped_shipments.intersection(delivered_shipments))

    # Check that each shipment is picked up, delivered, or skipped.
    picked_up_delivered_and_skipped_shipments = delivered_shipments.union(
        picked_up_shipments, skipped_shipments
    )
    self.assertCountEqual(
        tuple(range(num_shipments)), picked_up_delivered_and_skipped_shipments
    )

  def test_validate_request(self):
    self.assertIsNone(
        two_step_routing.validate_request(
            self._REQUEST_JSON, self._PARKING_FOR_SHIPMENT
        )
    )

  def test_local_request_and_response(self):
    self.validate_response(
        self._EXPECTED_LOCAL_REQUEST_JSON, self._LOCAL_RESPONSE_JSON
    )

  def test_global_request_and_response(self):
    self.validate_response(
        self._EXPECTED_GLOBAL_REQUEST_JSON, self._GLOBAL_RESPONSE_JSON
    )

  def test_merged_request_and_response(self):
    self.validate_response(
        self._EXPECTED_MERGED_REQUEST_JSON, self._EXPECTED_MERGED_RESPONSE_JSON
    )


class PlannerTestLocalModel(PlannerTest):
  """Tests for Planner.make_local_request()."""

  def test_make_local_model_time_windows(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    self.assertCountEqual(planner._direct_shipments, [8])
    self.assertEqual(
        planner.make_local_request(),
        self._EXPECTED_LOCAL_REQUEST_JSON,
    )

  def test_make_local_model_group_by_parking(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS_GROUP_BY_PARKING,
    )
    self.assertEqual(
        planner.make_local_request(),
        self._EXPECTED_LOCAL_REQUEST_GROUP_BY_PARKING_JSON,
    )


class PlannerTestGlobalModel(PlannerTest):
  """Tests for Planner.make_global_request()."""

  def test_make_global_request(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    global_request = planner.make_global_request(self._LOCAL_RESPONSE_JSON)
    self.assertEqual(global_request, self._EXPECTED_GLOBAL_REQUEST_JSON)

  def test_make_global_request_with_traffic_override(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    global_request = planner.make_global_request(
        self._LOCAL_RESPONSE_JSON, consider_road_traffic_override=False
    )
    expected_request = copy.deepcopy(self._EXPECTED_GLOBAL_REQUEST_JSON)
    expected_request["considerRoadTraffic"] = False
    self.assertEqual(global_request, expected_request)


class PlannerTestMergedModel(PlannerTest):
  """Tests for Planner.merge_local_and_global_result()."""

  _LOCAL_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON: (
      cfr_json.OptimizeToursResponse
  ) = _json("small/local_response_with_skipped_shipments.json")
  _GLOBAL_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON: (
      cfr_json.OptimizeToursResponse
  ) = _json("small/global_response_with_skipped_shipments.json")
  _EXPECTED_MERGED_REQUEST_WITH_SKIPPED_SHIPMENTS_JSON: (
      cfr_json.OptimizeToursRequest
  ) = _json("small/expected_merged_request_with_skipped_shipments.json")
  _EXPECTED_MERGED_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON = _json(
      "small/expected_merged_response_with_skipped_shipments.json"
  )

  def test_make_merged_request_and_response(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    merged_request, merged_response = planner.merge_local_and_global_result(
        self._LOCAL_RESPONSE_JSON,
        self._GLOBAL_RESPONSE_JSON,
        # TODO(ondrasej): Earlier during development, we removed some of the
        # durations from the local and global responses for brevity, and now the
        # timing in the responses is not self-consistent. Regenerate the test
        # data with all timing information and enable the consistency checks in
        # the tests.
        check_consistency=False,
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(merged_response, self._EXPECTED_MERGED_RESPONSE_JSON)

  def test_make_merged_request_and_response_with_skipped_shipments(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    merged_request, merged_response = planner.merge_local_and_global_result(
        self._LOCAL_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON,
        self._GLOBAL_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON,
        # TODO(ondrasej): Earlier during development, we removed some of the
        # durations from the local and global responses for brevity, and now the
        # timing in the responses is not self-consistent. Regenerate the test
        # data with all timing information and enable the consistency checks in
        # the tests.
        check_consistency=False,
    )
    self.assertEqual(
        merged_request,
        self._EXPECTED_MERGED_REQUEST_WITH_SKIPPED_SHIPMENTS_JSON,
    )
    self.assertEqual(
        merged_response,
        self._EXPECTED_MERGED_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON,
    )


class PlannerTestRefinedLocalModel(PlannerTest):
  _EXPECTED_LOCAL_REFINEMENT_REQUEST: cfr_json.OptimizeToursRequest = _json(
      "small/expected_local_refinement_request.json"
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_WITH_RELOAD_COST: (
      cfr_json.OptimizeToursRequest
  ) = _json("small/expected_local_refinement_request_with_reload_costs.json")

  def test_local_refinement_model(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    local_refinement_request = planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request, self._EXPECTED_LOCAL_REFINEMENT_REQUEST
    )

  def test_local_refinement_model_with_reload_cost(self):
    parking_locations = [
        dataclasses.replace(parking, reload_cost=20)
        for parking in self._PARKING_LOCATIONS
    ]
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=parking_locations,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    local_refinement_request = planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request,
        self._EXPECTED_LOCAL_REFINEMENT_REQUEST_WITH_RELOAD_COST,
    )


class PlannerTestIntegratedModels(PlannerTest):
  _LOCAL_REFINEMENT_RESPONSE: cfr_json.OptimizeToursResponse = _json(
      "small/local_refinement_response.json"
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = _json(
      "small/expected_integrated_local_request.json"
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = _json(
      "small/expected_integrated_local_response.json"
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = _json(
      "small/expected_integrated_global_request.json"
  )

  def test_integrated_models(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
    ) = planner.integrate_local_refinement(
        local_request=self._EXPECTED_LOCAL_REQUEST_JSON,
        local_response=self._LOCAL_RESPONSE_JSON,
        global_request=self._EXPECTED_GLOBAL_REQUEST_JSON,
        global_response=self._GLOBAL_RESPONSE_JSON,
        refinement_response=self._LOCAL_REFINEMENT_RESPONSE,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    self.assertEqual(
        integrated_global_request, self._EXPECTED_INTEGRATED_GLOBAL_REQUEST
    )


class PlannerTestWithPlaceId(unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=10000,
      min_average_shipments_per_round=1,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = _json("place_id/scenario.json")
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(_json("place_id/parking.json"))
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursResponse = _json(
      "place_id/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "place_id/scenario.local_response.60s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "place_id/scenario.global_request.60s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "place_id/scenario.global_response.60s.60s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "place_id/scenario.merged_request.60s.60s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "place_id/scenario.merged_response.60s.60s.json"
  )

  def test_local_model(self):
    planner = two_step_routing.Planner(
        options=self._OPTIONS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )
    self.assertEqual(
        planner.make_local_request(), self._EXPECTED_LOCAL_REQUEST_JSON
    )

  def test_global_model(self):
    planner = two_step_routing.Planner(
        options=self._OPTIONS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )
    self.assertEqual(
        planner.make_global_request(self._LOCAL_RESPONSE_JSON),
        self._EXPECTED_GLOBAL_REQUEST_JSON,
    )

  def test_merged_request(self):
    planner = two_step_routing.Planner(
        options=self._OPTIONS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )
    merged_request, merged_response = planner.merge_local_and_global_result(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(merged_response, self._EXPECTED_MERGED_RESPONSE_JSON)


class PlannerTestWithBreaks(unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=10000,
      min_average_shipments_per_round=1,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = _json("breaks/scenario.json")
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(_json("breaks/parking.json"))
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "breaks/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "breaks/scenario.local_response.120s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "breaks/scenario.global_request.120s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "breaks/scenario.global_response.120s.240s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = _json(
      "breaks/scenario.merged_request.120s.240s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "breaks/scenario.merged_response.120s.240s.json"
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON: cfr_json.OptimizeToursRequest = (
      _json("breaks/scenario.refined_1.local_request.120s.240s.120s.120s.json")
  )
  _LOCAL_REFINEMENT_RESPONSE_JSON: cfr_json.OptimizeToursResponse = _json(
      "breaks/scenario.refined_1.local_response.120s.240s.120s.120s.json"
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = _json(
      "breaks/scenario.refined_1.integrated_local_request.120s.240s.120s.120s.json"
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = _json(
      "breaks/scenario.refined_1.integrated_local_response.120s.240s.120s.120s.json"
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = _json(
      "breaks/scenario.refined_1.integrated_global_request.120s.240s.120s.120s.json"
  )

  def setUp(self):
    super().setUp()
    self._planner = two_step_routing.Planner(
        options=self._OPTIONS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )

  def test_local_model(self):
    self.assertEqual(
        self._planner.make_local_request(), self._EXPECTED_LOCAL_REQUEST_JSON
    )

  def test_global_model(self):
    self.assertEqual(
        self._planner.make_global_request(
            self._LOCAL_RESPONSE_JSON, consider_road_traffic_override=False
        ),
        self._EXPECTED_GLOBAL_REQUEST_JSON,
    )

  def test_merged_request(self):
    merged_request, merged_response = (
        self._planner.merge_local_and_global_result(
            self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
        )
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(merged_response, self._EXPECTED_MERGED_RESPONSE_JSON)

  def test_local_refinement_model(self):
    local_refinement_request = self._planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request, self._EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON
    )

  def test_global_refinement_model(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    self.assertEqual(
        integrated_global_request, self._EXPECTED_INTEGRATED_GLOBAL_REQUEST
    )


class GetLocalModelRouteStartTimeWindowsTest(unittest.TestCase):
  """Tests for _get_local_model_route_start_time_windows."""

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
      ],
  }

  def test_empty_route(self):
    self.assertIsNone(
        two_step_routing._get_local_model_route_start_time_windows({}, {})
    )

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
      two_step_routing._get_local_model_route_start_time_windows(
          self._MODEL, local_route
      )

  def test_with_some_shipments(self):
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
        two_step_routing._get_local_model_route_start_time_windows(
            self._MODEL, local_route
        ),
        [{
            "startTime": "2023-10-25T10:10:00Z",
            "endTime": "2023-10-25T11:15:00Z",
        }],
    )


class GetConsecutiveParkingLocationVisits(unittest.TestCase):
  """Tests for _get_consecutive_parking_location_visits."""

  maxDiff = None

  def test_empty_route(self):
    local_response: cfr_json.OptimizeToursResponse = {}
    global_route: cfr_json.ShipmentRoute = {}
    self.assertSequenceEqual(
        two_step_routing._get_consecutive_parking_location_visits(
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
        two_step_routing._get_consecutive_parking_location_visits(
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
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
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
        two_step_routing._get_consecutive_parking_location_visits(
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
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
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
        two_step_routing._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                shipment_indices=[[3, 5], [1, 12]],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=3,
                local_route_indices=[3, 2, 4],
                shipment_indices=[[4, 6], [2, 8, 0], [9, 10]],
            ),
        ),
    )

  def test_consecutive_visits_with_breaks(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
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
        two_step_routing._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                shipment_indices=[[3, 5], [1, 12]],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=2,
                local_route_indices=[3, 2],
                shipment_indices=[[4, 6], [2, 8, 0]],
            ),
        ),
    )

  def test_only_parking(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
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
        two_step_routing._get_consecutive_parking_location_visits(
            local_response, global_route
        ),
        (
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P001",
                global_route=global_route,
                first_global_visit_index=1,
                num_global_visits=2,
                local_route_indices=[0, 1],
                shipment_indices=[[3, 5], [1, 12]],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=3,
                num_global_visits=2,
                local_route_indices=[3, 2],
                shipment_indices=[[4, 6], [2, 8, 0]],
            ),
        ),
    )


class SplitRefinedLocalRouteTest(unittest.TestCase):
  """Tests for _split_refined_local_route."""

  maxDiff = None

  def test_empty_route(self):
    self.assertSequenceEqual(
        two_step_routing._split_refined_local_route({}), ()
    )
    self.assertSequenceEqual(
        two_step_routing._split_refined_local_route(
            {"visits": [], "transitions": []}
        ),
        (),
    )

  def test_single_round(self):
    visits: list[cfr_json.Visit] = [
        {"shipmentIndex": 0, "isPickup": True},
        {"shipmentIndex": 2, "isPickup": True},
        {"shipmentIndex": 8, "isPickup": True},
        {"shipmentIndex": 5, "isPickup": True},
        {"shipmentIndex": 2, "isPickup": False},
        {"shipmentIndex": 5, "isPickup": False},
        {"shipmentIndex": 0, "isPickup": False},
        {"shipmentIndex": 8, "isPickup": False},
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
        two_step_routing._split_refined_local_route(route),
        ((visits[4:], transitions[4:], travel_steps[4:]),),
    )

  def test_multiple_rounds(self):
    visits: list[cfr_json.Visit] = [
        {"shipmentIndex": 0, "isPickup": True},
        {"shipmentIndex": 2, "isPickup": False},
        {"shipmentIndex": 2, "isPickup": True},
        {"shipmentIndex": 8, "isPickup": True},
        {"shipmentIndex": 5, "isPickup": False},
        {"shipmentIndex": 0, "isPickup": False},
        {"shipmentIndex": 5, "isPickup": True},
        {"shipmentIndex": 8, "isPickup": False},
    ]
    transitions = [
        {"totalDuration": "0s"},
        {"totalDuration": "14s"},
        {"totalDuration": "16s"},
        {"totalDuration": "0s"},
        {"totalDuration": "32s"},
        {"totalDuration": "45s"},
        {"totalDuration": "27s"},
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
        two_step_routing._split_refined_local_route(route),
        (
            (visits[1:2], transitions[1:3], travel_steps[1:3]),
            (visits[4:6], transitions[4:7], travel_steps[4:7]),
            (visits[7:], transitions[7:], travel_steps[7:]),
        ),
    )


class ParseRefinementVehicleLabelTest(unittest.TestCase):
  """Tests for _parse_refinement_vehicle_label."""

  def test_empty_label(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid vehicle label in refinement model"
    ):
      two_step_routing._parse_refinement_vehicle_label("")

  def test_invalid_label(self):
    with self.assertRaisesRegex(
        ValueError, "Invalid vehicle label in refinement model"
    ):
      two_step_routing._parse_refinement_vehicle_label(
          "global_route:foo start:1 size:2 PARKING:P001"
      )

  def test_valid_label(self):
    self.assertEqual(
        two_step_routing._parse_refinement_vehicle_label(
            "global_route:32 start:1 size:2 parking:P002"
        ),
        (32, 1, 2, "P002"),
    )


class ParseGlobalShipmentLabelTest(unittest.TestCase):
  """Tests for _parse_global_shipment_label."""

  def test_empty_label(self):
    with self.assertRaises(ValueError):
      two_step_routing._parse_global_shipment_label("")

  def test_invalid_label(self):
    with self.assertRaises(ValueError):
      two_step_routing._parse_global_shipment_label("foobar")

  def test_shipment_label(self):
    visit_type, index = two_step_routing._parse_global_shipment_label(
        "s:1 S003"
    )
    self.assertEqual(visit_type, "s")
    self.assertEqual(index, 1)

  def test_parking_label(self):
    visit_type, index = two_step_routing._parse_global_shipment_label(
        "p:3 S003,S004,S007"
    )
    self.assertEqual(visit_type, "p")
    self.assertEqual(index, 3)


class GetParkingTagFromLocalRouteTest(unittest.TestCase):
  """Tests for _get_parking_tag_from_local_route."""

  def test_empty_string(self):
    with self.assertRaises(ValueError):
      two_step_routing._get_parking_tag_from_local_route({"vehicleLabel": ""})

  def test_no_timestamp(self):
    self.assertEqual(
        two_step_routing._get_parking_tag_from_local_route(
            {"vehicleLabel": "P002 []/1"}
        ),
        "P002",
    )

  def test_with_timestamp(self):
    self.assertEqual(
        two_step_routing._get_parking_tag_from_local_route(
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
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey("P123")
        ),
        "P123 []",
    )

  def test_parking_tag_and_start_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey(
                "P123", "2023-08-11T00:00:00.000Z"
            )
        ),
        "P123 [start=2023-08-11T00:00:00.000Z]",
    )

  def test_parking_tag_and_end_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey(
                "P123", None, "2023-08-11T00:00:00.000Z"
            )
        ),
        "P123 [end=2023-08-11T00:00:00.000Z]",
    )

  def test_parking_tag_and_start_and_end_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey(
                "P123", "2023-08-11T00:00:00.000Z", "2023-08-11T08:00:00.000Z"
            )
        ),
        "P123 [start=2023-08-11T00:00:00.000Z end=2023-08-11T08:00:00.000Z]",
    )

  def test_parking_tag_and_allowed_vehicles(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey("P123", None, None, (0, 1, 2))
        ),
        "P123 [vehicles=(0, 1, 2)]",
    )

  def test_parking_tag_times_and_allowed_vehicles(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            two_step_routing._ParkingGroupKey(
                "P123",
                "2023-08-11T00:00:00.000Z",
                "2023-08-11T08:00:00.000Z",
                (0, 1, 2),
            )
        ),
        "P123 [start=2023-08-11T00:00:00.000Z end=2023-08-11T08:00:00.000Z"
        " vehicles=(0, 1, 2)]",
    )


class ParkingDeliveryGroupTest(unittest.TestCase):
  """Tests for _parking_delivery_group_key."""

  maxDiff = None

  _OPTIONS_GROUP_BY_PARKING_AND_TIME = two_step_routing.Options(
      local_model_grouping=two_step_routing.LocalModelGrouping.PARKING_AND_TIME
  )
  _OPTIONS_GROUP_BY_PARKING = two_step_routing.Options(
      local_model_grouping=two_step_routing.LocalModelGrouping.PARKING
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

  _PARKING_LOCATION = two_step_routing.ParkingLocation(
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
          two_step_routing._parking_delivery_group_key(
              self._OPTIONS_GROUP_BY_PARKING_AND_TIME, shipment, None
          ),
          two_step_routing._ParkingGroupKey(),
      )
      self.assertEqual(
          two_step_routing._parking_delivery_group_key(
              self._OPTIONS_GROUP_BY_PARKING, shipment, None
          ),
          two_step_routing._ParkingGroupKey(),
      )

  def test_with_parking_and_no_time_window(self):
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_NO_TIME_WINDOW,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234"),
    )
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING,
            self._SHIPMENT_NO_TIME_WINDOW,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234"),
    )

  def test_with_parking_and_time_window_start(self):
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_START,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234", self._START_TIME, None),
    )
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_START,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234", None, None),
    )

  def test_with_parking_and_time_window_end(self):
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_END,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234", None, self._END_TIME),
    )
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_END,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234", None, None),
    )

  def test_with_parking_and_time_window_start_end(self):
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_TIME_WINDOW_START_END,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey(
            "P1234", self._START_TIME, self._END_TIME
        ),
    )
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING,
            self._SHIPMENT_TIME_WINDOW_START_END,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey("P1234", None, None),
    )

  def test_with_allowed_vehicles(self):
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING_AND_TIME,
            self._SHIPMENT_ALLOWED_VEHICLES,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey(
            "P1234",
            None,
            None,
            (0, 2, 5),
        ),
    )
    self.assertEqual(
        two_step_routing._parking_delivery_group_key(
            self._OPTIONS_GROUP_BY_PARKING,
            self._SHIPMENT_ALLOWED_VEHICLES,
            self._PARKING_LOCATION,
        ),
        two_step_routing._ParkingGroupKey(
            "P1234",
            None,
            None,
            (0, 2, 5),
        ),
    )


class TestIntervalIntersection(unittest.TestCase):
  maxDiff = None

  def test_both_empty(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection((), ()), ()
    )

  def test_left_empty(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection((), ((0, 1), (2, 3), (4, 5))),
        (),
    )

  def test_right_empty(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(((0, 1), (2, 3), (4, 5)), ()),
        (),
    )

  def test_overlap(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(((0, 10),), ((5, 20),)),
        ((5, 10),),
    )

  def test_double_overlap(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(
            ((0, 10), (20, 30)), ((5, 25),)
        ),
        ((5, 10), (20, 25)),
    )

  def test_singular_overlap(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(((0, 10),), ((10, 20),)),
        ((10, 10),),
    )

  def test_many_singular_overlaps(self):
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(
            ((0, 1), (2, 3), (4, 5), (6, 7)), ((1, 2), (3, 4), (5, 6), (7, 8))
        ),
        ((1, 1), (2, 2), (3, 3), (4, 4), (5, 5), (6, 6), (7, 7)),
    )

  def test_with_datetime(self):
    dt = datetime.datetime.fromtimestamp
    self.assertSequenceEqual(
        two_step_routing._interval_intersection(
            ((dt(0), dt(7200)),), ((dt(3600), dt(10000)),)
        ),
        ((dt(3600), dt(7200)),),
    )
    pass


class TestAssertGlobalModelRoutesHandleSameShipments(unittest.TestCase):
  """Tests for _assert_global_model_routes_handle_same_shipments."""

  def test_no_routes(self):
    two_step_routing._assert_global_model_routes_handle_same_shipments({}, {})

  def test_empty_routes(self):
    response_a: cfr_json.OptimizeToursResponse = {"routes": []}
    response_b: cfr_json.OptimizeToursResponse = {"routes": []}
    two_step_routing._assert_global_model_routes_handle_same_shipments(
        response_a, response_b
    )

  def test_different_number_of_routes(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [{"visits": []}, {"vehicleIndex": 1, "visits": []}]
    }
    response_b: cfr_json.OptimizeToursResponse = {"routes": [{"visits": []}]}
    with self.assertRaisesRegex(
        AssertionError, "The number of routes is different"
    ):
      two_step_routing._assert_global_model_routes_handle_same_shipments(
          response_a, response_b
      )

  def test_multiple_routes_same_shipments(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ]
            },
        ]
    }
    two_step_routing._assert_global_model_routes_handle_same_shipments(
        response_a, response_b
    )

  def test_multiple_routes_same_shipments_different_vehicles(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ],
            },
            {
                "vehicleIndex": 0,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
        ]
    }
    with self.assertRaisesRegex(
        AssertionError, "Shipment label counts for vehicle 0 are different"
    ):
      two_step_routing._assert_global_model_routes_handle_same_shipments(
          response_a, response_b
      )

  def test_multiple_routes_different_shipments(self):
    response_a: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:0 S002,S003,S007"},
                    {"shipmentLabel": "p:3 S004,S117,S231"},
                    {"shipmentLabel": "p:12 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:11 S008,S009"},
                    {"shipmentLabel": "p:3 S006,S011"},
                ],
            },
        ]
    }
    response_b: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "visits": [
                    {"shipmentLabel": "s:32 S001"},
                    {"shipmentLabel": "p:2 S002,S003,S007,S004,S117,S231"},
                    {"shipmentLabel": "p:0 S032,S078"},
                ]
            },
            {
                "vehicleIndex": 1,
                "visits": [
                    {"shipmentLabel": "s:12 S005"},
                    {"shipmentLabel": "p:1 S008,S006,S011"},
                ],
            },
        ]
    }
    with self.assertRaisesRegex(AssertionError, ""):
      two_step_routing._assert_global_model_routes_handle_same_shipments(
          response_a, response_b
      )


if __name__ == "__main__":
  unittest.main()
