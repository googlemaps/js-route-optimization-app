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
import dataclasses
import datetime
import logging
import unittest

from ..testdata import testdata
from ..json import cfr_json
from . import _parking
from . import two_step_routing


class ValidateResponseMixin(unittest.TestCase):
  """A mixin that provides a method for validating a CFR request + response."""

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

            transition = transitions[visit_index]
            self.assertEqual(
                current_time,
                cfr_json.parse_time_string(transition["startTime"]),
            )
            transition_duration = cfr_json.parse_duration_string(
                transition["totalDuration"]
            )
            visit_request = cfr_json.get_visit_request(request["model"], visit)
            visit_duration = cfr_json.get_visit_request_duration(visit_request)
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


class PlannerTest(ValidateResponseMixin, unittest.TestCase):
  """Tests for the Planner class."""

  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
      local_model_vehicle_fixed_cost=10000,
      min_average_shipments_per_round=2,
  )
  _OPTIONS_NO_FIXED_COST = two_step_routing.Options(
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
      local_model_vehicle_fixed_cost=0,
  )
  _OPTIONS_GROUP_BY_PARKING = two_step_routing.Options(
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=False
      ),
      local_model_vehicle_fixed_cost=0,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "small/request.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("small/parking.json")
      )
  )

  # The expected local model request created by the two-step planner for the
  # base request defined above.
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "small/expected_local_request.json"
  )

  _EXPECTED_LOCAL_PICKUP_AND_DELIVERY_REQUEST_JSON: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json("small/expected_local_pickup_and_delivery_request.json")

  # An example response from the CFR solver for _EXPECTED_LOCAL_REQUEST_JSON.
  # Fields that are not needed by the two-step solver were removed from the
  # response to make it shorter.
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "small/local_response.json"
  )

  _LOCAL_PICKUP_AND_DELIVERY_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json("small/local_pickup_and_delivery_response.json")
  )

  _EXPECTED_LOCAL_REQUEST_GROUP_BY_PARKING_JSON: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json("small/expected_local_request_group_by_parking.json")

  # The expected global model request created by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST_JSON as the
  # solution of the local model.
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "small/expected_global_request.json"
  )

  _EXPECTED_GLOBAL_REQUEST_FOR_LOCAL_PICKUP_AND_DELIVERY: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json(
      "small/expected_global_request_for_local_pickup_and_delivery.json"
  )

  # An example response from the CFR solver for _EXPECTED_GLOBAL_REQUEST_JSON.
  # Fields that are not needed by the two-step solver were removed from the
  # response to make it shorter.
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "small/global_response.json"
  )

  # The expected merged model request created by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST and
  # _EXPECTED_GLOBAL_REQUEST as the solutions of the local and global models.
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "small/expected_merged_request.json"
  )

  # The expected merged model response creatd by the two-step planner for the
  # base request defined above, using _EXPECTED_LOCAL_REQUEST and
  # _EXPECTED_GLOBAL_REQUEST as the solutions of the local and global models.
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json("small/expected_merged_response.json")
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
    self.validate_response(
        self._EXPECTED_LOCAL_PICKUP_AND_DELIVERY_REQUEST_JSON,
        self._LOCAL_PICKUP_AND_DELIVERY_RESPONSE_JSON,
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

  def test_make_local_pickup_and_delivery_model(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS_NO_FIXED_COST,
    )
    self.assertCountEqual(planner._direct_shipments, [8])
    self.assertEqual(
        planner.make_local_request(),
        self._EXPECTED_LOCAL_PICKUP_AND_DELIVERY_REQUEST_JSON,
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

  def test_make_global_request_from_pickup_and_delivery_local_model(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS_NO_FIXED_COST,
    )
    global_request = planner.make_global_request(
        self._LOCAL_PICKUP_AND_DELIVERY_RESPONSE_JSON
    )
    self.assertEqual(
        global_request,
        self._EXPECTED_GLOBAL_REQUEST_FOR_LOCAL_PICKUP_AND_DELIVERY,
    )

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
  ) = testdata.json("small/local_response_with_skipped_shipments.json")
  _GLOBAL_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json("small/global_response_with_skipped_shipments.json")
  _EXPECTED_MERGED_REQUEST_WITH_SKIPPED_SHIPMENTS_JSON: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json("small/expected_merged_request_with_skipped_shipments.json")
  _EXPECTED_MERGED_RESPONSE_WITH_SKIPPED_SHIPMENTS_JSON = testdata.json(
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
  _EXPECTED_LOCAL_REFINEMENT_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json("small/expected_local_refinement_request.json")
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_WITH_RELOAD_COST: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json(
      "small/expected_local_refinement_request_with_reload_costs.json"
  )

  def test_local_refinement_model(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS_NO_FIXED_COST,
    )
    local_refinement_request = planner.make_local_refinement_request(
        self._LOCAL_PICKUP_AND_DELIVERY_RESPONSE_JSON,
        self._GLOBAL_RESPONSE_JSON,
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
        options=self._OPTIONS_NO_FIXED_COST,
    )
    local_refinement_request = planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request,
        self._EXPECTED_LOCAL_REFINEMENT_REQUEST_WITH_RELOAD_COST,
    )


class PlannerTestIntegratedModels(PlannerTest):
  _LOCAL_REFINEMENT_RESPONSE: cfr_json.OptimizeToursResponse = testdata.json(
      "small/local_refinement_response.json"
  )
  _GLOBAL_RESPONSE_WITH_TRAFFIC_INFEASIBILITY: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json("small/global_response_with_traffic_infeasibility.json")
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json("small/expected_integrated_local_request.json")
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json("small/expected_integrated_local_response.json")
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json("small/expected_integrated_global_request.json")
  )
  _EXPECTED_INTEGRATED_GLOBAL_RESPONSE = cfr_json.OptimizeToursResponse = (
      testdata.json("small/expected_integrated_global_response.json")
  )
  _EXPECTED_INTEGRATED_GLOBAL_RESPONSE_WITH_TRAFFIC_INFEASIBILITY: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json(
      "small/expected_integrated_global_response_with_traffic_infeasibility.json"
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
        integrated_global_response,
    ) = planner.integrate_local_refinement(
        local_request=self._EXPECTED_LOCAL_REQUEST_JSON,
        local_response=self._LOCAL_RESPONSE_JSON,
        global_request=self._EXPECTED_GLOBAL_REQUEST_JSON,
        global_response=self._GLOBAL_RESPONSE_JSON,
        refinement_response=self._LOCAL_REFINEMENT_RESPONSE,
        integration_mode=two_step_routing.IntegrationMode.VISITS_AND_START_TIMES,
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
    self.assertIsNone(integrated_global_response)

  def test_integrate_full_route(self):
    planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )
    global_request = copy.deepcopy(self._EXPECTED_GLOBAL_REQUEST_JSON)
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = planner.integrate_local_refinement(
        local_request=self._EXPECTED_LOCAL_REQUEST_JSON,
        local_response=self._LOCAL_RESPONSE_JSON,
        global_request=global_request,
        global_response=self._GLOBAL_RESPONSE_JSON,
        refinement_response=self._LOCAL_REFINEMENT_RESPONSE,
        integration_mode=two_step_routing.IntegrationMode.FULL_ROUTES,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    expected_integrated_global_request = copy.deepcopy(
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST
    )
    expected_integrated_global_request["injectedFirstSolutionRoutes"] = list(
        cfr_json.get_routes(self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE)
    )
    self.assertEqual(
        integrated_global_request, expected_integrated_global_request
    )
    self.assertEqual(
        integrated_global_response, self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE
    )

  def test_integrate_full_routes_with_traffic_infeasibility(self):
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
        integrated_global_response,
    ) = planner.integrate_local_refinement(
        local_request=self._EXPECTED_LOCAL_REQUEST_JSON,
        local_response=self._LOCAL_RESPONSE_JSON,
        global_request=self._EXPECTED_GLOBAL_REQUEST_JSON,
        global_response=self._GLOBAL_RESPONSE_WITH_TRAFFIC_INFEASIBILITY,
        refinement_response=self._LOCAL_REFINEMENT_RESPONSE,
        integration_mode=two_step_routing.IntegrationMode.FULL_ROUTES,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    expected_integrated_global_request = copy.deepcopy(
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST
    )
    expected_integrated_global_request["injectedFirstSolutionRoutes"] = list(
        cfr_json.get_routes(
            self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE_WITH_TRAFFIC_INFEASIBILITY
        )
    )
    self.assertEqual(
        integrated_global_request, expected_integrated_global_request
    )
    self.assertEqual(
        integrated_global_response,
        self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE_WITH_TRAFFIC_INFEASIBILITY,
    )


class PlannerTestWithPlaceId(ValidateResponseMixin, unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=10000,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "place_id/scenario.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("place_id/parking.json")
      )
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "place_id/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "place_id/scenario.local_response.60s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "place_id/scenario.global_request.60s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "place_id/scenario.global_response.60s.60s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "place_id/scenario.merged_request.60s.60s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json("place_id/scenario.merged_response.60s.60s.json")
  )

  def test_validate_local_files(self):
    self.validate_response(
        self._EXPECTED_LOCAL_REQUEST_JSON, self._LOCAL_RESPONSE_JSON
    )

  def test_validate_global_files(self):
    self.validate_response(
        self._EXPECTED_GLOBAL_REQUEST_JSON, self._GLOBAL_RESPONSE_JSON
    )

  def test_validate_merged_files(self):
    self.validate_response(
        self._EXPECTED_MERGED_REQUEST_JSON, self._EXPECTED_MERGED_RESPONSE_JSON
    )

  def test_local_model(self):
    planner = two_step_routing.Planner(
        options=self._OPTIONS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )
    self.assertEqual(
        planner.make_local_request(),
        self._EXPECTED_LOCAL_REQUEST_JSON,
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


class PlannerWithBreaksTest(unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
  )
  _OPTIONS_NO_DEPRECATED_FIELDS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
      use_deprecated_fields=False,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "breaks/scenario.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("breaks/parking.json")
      )
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "breaks/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "breaks/scenario.local_response.120s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "breaks/scenario.global_request.120s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "breaks/scenario.global_response.120s.240s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "breaks/scenario.merged_request.120s.240s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json("breaks/scenario.merged_response.120s.240s.json")
  )
  _EXPECTED_MERGED_RESPONSE_NO_DEPRECATED_FIELDS_JSON: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json(
      "breaks/scenario.merged_response.120s.240s.no_deprecated_fields.json"
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "breaks/scenario.refined_1.local_request.120s.240s.120s.120s.json"
      )
  )
  _LOCAL_REFINEMENT_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "breaks/scenario.refined_1.local_response.120s.240s.120s.120s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "breaks/scenario.refined_1.integrated_local_request.120s.240s.120s.120s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "breaks/scenario.refined_1.integrated_local_response.120s.240s.120s.120s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "breaks/scenario.refined_1.integrated_global_request.120s.240s.120s.120s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json(
      "breaks/scenario.refined_1.integrated_global_request.120s.240s.120s.120s.full_routes.json"
  )
  _EXPECTED_INTEGRATED_GLOBAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "breaks/scenario.refined_1.expected_integrated_global_response.120s.240s.120s.120s.json"
      )
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
        self._planner.make_local_request(),
        self._EXPECTED_LOCAL_REQUEST_JSON,
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

  def test_merged_routes_no_deprecated_fields(self):
    planner = two_step_routing.Planner(
        options=self._OPTIONS_NO_DEPRECATED_FIELDS,
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
    )
    merged_request, merged_response = planner.merge_local_and_global_result(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(
        merged_response,
        self._EXPECTED_MERGED_RESPONSE_NO_DEPRECATED_FIELDS_JSON,
    )

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
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.VISITS_AND_START_TIMES,
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
    self.assertIsNone(integrated_global_response)

  def test_global_refinement_model_no_visit_start_times(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.VISITS_ONLY,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    expected_integrated_global_request = copy.deepcopy(
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST
    )
    for route in expected_integrated_global_request[
        "injectedFirstSolutionRoutes"
    ]:
      del route["vehicleStartTime"]
      del route["vehicleEndTime"]
      for visit in route["visits"]:
        del visit["startTime"]
        del visit["detour"]
    self.assertEqual(
        integrated_global_request, expected_integrated_global_request
    )
    self.assertIsNone(integrated_global_response)

  def test_integrated_global_response(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.FULL_ROUTES,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    self.assertEqual(
        integrated_global_request,
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES,
    )
    self.assertEqual(
        integrated_global_response, self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE
    )


class PlannerPickupAndDeliveryTest(ValidateResponseMixin, unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "pickup_and_delivery_small/scenario.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("pickup_and_delivery_small/parking.json")
      )
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "pickup_and_delivery_small/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "pickup_and_delivery_small/scenario.local_response.10s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "pickup_and_delivery_small/scenario.global_request.10s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "pickup_and_delivery_small/scenario.global_response.10s.10s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "pickup_and_delivery_small/scenario.merged_request.10s.10s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "pickup_and_delivery_small/scenario.merged_response.10s.10s.json"
      )
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "pickup_and_delivery_small/scenario.refined_1.local_request.10s.10s.10s.10s.json"
      )
  )
  _LOCAL_REFINEMENT_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "pickup_and_delivery_small/scenario.refined_1.local_response.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "pickup_and_delivery_small/scenario.refined_1.integrated_local_request.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "pickup_and_delivery_small/scenario.refined_1.integrated_local_response.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "pickup_and_delivery_small/scenario.refined_1.integrated_global_request.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json(
      "pickup_and_delivery_small/scenario.refined_1.integrated_global_request.10s.10s.10s.10s.full_routes.json"
  )
  _EXPECTED_INTEGRATED_GLOBAL_RESPONSE_FULL_ROUTES: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json(
      "pickup_and_delivery_small/scenario.refined_1.integrated_global_response.10s.10s.10s.10s.full_routes.json"
  )

  def setUp(self):
    super().setUp()
    self._planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )

  def test_validate_local_request(self):
    self.validate_response(
        self._EXPECTED_LOCAL_REQUEST_JSON, self._LOCAL_RESPONSE_JSON
    )

  def test_validate_global_request(self):
    self.validate_response(
        self._EXPECTED_GLOBAL_REQUEST_JSON, self._GLOBAL_RESPONSE_JSON
    )

  def test_validate_merged_request(self):
    self.validate_response(
        self._EXPECTED_MERGED_REQUEST_JSON, self._EXPECTED_MERGED_RESPONSE_JSON
    )

  def test_validate_local_refinement_request(self):
    self.validate_response(
        self._EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
    )

  def test_validate_integrated_global_request(self):
    self.validate_response(
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES,
        self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE_FULL_ROUTES,
    )

  def test_local_request(self):
    local_request = self._planner.make_local_request()
    self.assertEqual(local_request, self._EXPECTED_LOCAL_REQUEST_JSON)

  def test_global_request(self):
    global_request = self._planner.make_global_request(
        self._LOCAL_RESPONSE_JSON
    )
    self.assertEqual(global_request, self._EXPECTED_GLOBAL_REQUEST_JSON)

  def test_merge_local_and_global_result(self):
    merged_request, merged_response = (
        self._planner.merge_local_and_global_result(
            self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
        )
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(merged_response, self._EXPECTED_MERGED_RESPONSE_JSON)

  def test_local_refinement_request(self):
    local_refinement_request = self._planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request, self._EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON
    )

  def test_global_refinement_request(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.VISITS_ONLY,
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
    self.assertIsNone(integrated_global_response)

  def test_global_refinement_request_full_routes(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.FULL_ROUTES,
    )
    self.assertEqual(
        integrated_local_request, self._EXPECTED_INTEGRATED_LOCAL_REQUEST
    )
    self.assertEqual(
        integrated_local_response, self._EXPECTED_INTEGRATED_LOCAL_RESPONSE
    )
    self.assertEqual(
        integrated_global_request,
        self._EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES,
    )
    self.assertEqual(
        integrated_global_response,
        self._EXPECTED_INTEGRATED_GLOBAL_RESPONSE_FULL_ROUTES,
    )


class PlannerEnergyCostsTests(ValidateResponseMixin, unittest.TestCase):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
      use_deprecated_fields=False,
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "energy_costs/scenario.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("energy_costs/parking.json")
      )
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "energy_costs/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "energy_costs/scenario.local_response.30s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "energy_costs/scenario.global_request.30s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "energy_costs/scenario.global_response.30s.30s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "energy_costs/scenario.merged_request.30s.30s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json("energy_costs/scenario.merged_response.30s.30s.json")
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "energy_costs/scenario.refined_1.local_request.30s.30s.30s.30s.json"
      )
  )
  _LOCAL_REFINEMENT_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "energy_costs/scenario.refined_1.local_response.30s.30s.30s.30s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "energy_costs/scenario.refined_1.integrated_local_request.30s.30s.30s.30s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "energy_costs/scenario.refined_1.integrated_local_response.30s.30s.30s.30s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST = cfr_json.OptimizeToursRequest = (
      testdata.json(
          "energy_costs/scenario.refined_1.integrated_global_request.30s.30s.30s.30s.json"
      )
  )

  def setUp(self):
    super().setUp()
    self._planner = two_step_routing.Planner(
        request_json=self._REQUEST_JSON,
        parking_locations=self._PARKING_LOCATIONS,
        parking_for_shipment=self._PARKING_FOR_SHIPMENT,
        options=self._OPTIONS,
    )

  def test_validate_local_request(self):
    self.validate_response(
        self._EXPECTED_LOCAL_REQUEST_JSON, self._LOCAL_RESPONSE_JSON
    )

  def test_validate_global_request(self):
    self.validate_response(
        self._EXPECTED_GLOBAL_REQUEST_JSON, self._GLOBAL_RESPONSE_JSON
    )

  def test_validate_merged_request(self):
    self.validate_response(
        self._EXPECTED_MERGED_REQUEST_JSON, self._EXPECTED_MERGED_RESPONSE_JSON
    )

  def test_local_request(self):
    local_request = self._planner.make_local_request()
    self.assertEqual(local_request, self._EXPECTED_LOCAL_REQUEST_JSON)

  def test_global_request(self):
    global_request = self._planner.make_global_request(
        self._LOCAL_RESPONSE_JSON
    )
    self.assertEqual(global_request, self._EXPECTED_GLOBAL_REQUEST_JSON)

  def test_merged_request(self):
    merged_request, merged_response = (
        self._planner.merge_local_and_global_result(
            self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
        )
    )
    self.assertEqual(merged_request, self._EXPECTED_MERGED_REQUEST_JSON)
    self.assertEqual(merged_response, self._EXPECTED_MERGED_RESPONSE_JSON)

  def test_local_refinement_request(self):
    local_refinement_request = self._planner.make_local_refinement_request(
        self._LOCAL_RESPONSE_JSON, self._GLOBAL_RESPONSE_JSON
    )
    self.assertEqual(
        local_refinement_request, self._EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON
    )

  def test_global_refinement_request(self):
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = self._planner.integrate_local_refinement(
        self._EXPECTED_LOCAL_REQUEST_JSON,
        self._LOCAL_RESPONSE_JSON,
        self._EXPECTED_GLOBAL_REQUEST_JSON,
        self._GLOBAL_RESPONSE_JSON,
        self._LOCAL_REFINEMENT_RESPONSE_JSON,
        integration_mode=two_step_routing.IntegrationMode.VISITS_ONLY,
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
    self.assertIsNone(integrated_global_response)


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
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
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
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
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
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=3,
                local_route_indices=[3, 2, 4],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 9,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 10,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 9,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 10,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
        ),
    )

  def test_consecutive_visits_with_breaks(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
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
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=4,
                num_global_visits=2,
                local_route_indices=[3, 2],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
        ),
    )

  def test_only_parking(self):
    local_response: cfr_json.OptimizeToursResponse = {
        "routes": [
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "3: S003", "isPickup": True},
                    {"shipmentLabel": "5: S005", "isPickup": True},
                    {"shipmentLabel": "3: S003"},
                    {"shipmentLabel": "5: S005"},
                ],
            },
            {
                "vehicleLabel": "P001 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "1: S001", "isPickup": True},
                    {"shipmentLabel": "12: S012", "isPickup": True},
                    {"shipmentLabel": "1: S001"},
                    {"shipmentLabel": "12: S012"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/0",
                "visits": [
                    {"shipmentLabel": "2: S002", "isPickup": True},
                    {"shipmentLabel": "8: S008", "isPickup": True},
                    {"shipmentLabel": "0: S000", "isPickup": True},
                    {"shipmentLabel": "2: S002"},
                    {"shipmentLabel": "8: S008"},
                    {"shipmentLabel": "0: S000"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/1",
                "visits": [
                    {"shipmentLabel": "4: S004", "isPickup": True},
                    {"shipmentLabel": "6: S006", "isPickup": True},
                    {"shipmentLabel": "4: S004"},
                    {"shipmentLabel": "6: S006"},
                ],
            },
            {
                "vehicleLabel": "P002 [vehicles=(0,)]/2",
                "visits": [
                    {"shipmentLabel": "9: S009", "isPickup": True},
                    {"shipmentLabel": "10: S010", "isPickup": True},
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
                visits=[
                    [
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 3,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 5,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 1,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 12,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
            ),
            two_step_routing._ConsecutiveParkingLocationVisits(
                parking_tag="P002",
                global_route=global_route,
                first_global_visit_index=3,
                num_global_visits=2,
                local_route_indices=[3, 2],
                visits=[
                    [
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 4,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 6,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                    [
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": True,
                        },
                        {
                            "shipmentIndex": 2,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 8,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                        {
                            "shipmentIndex": 0,
                            "visitRequestIndex": 0,
                            "isPickup": False,
                        },
                    ],
                ],
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
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": True},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": True},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": True},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": False},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": False},
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": False},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": False},
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
        ((visits, transitions, travel_steps),),
    )

  def test_multiple_rounds(self):
    visits: list[cfr_json.Visit] = [
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": True},
        {"shipmentIndex": 0, "shipmentLabel": "0: S000", "isPickup": False},
        {"shipmentIndex": 1, "shipmentLabel": "barrier P123", "isPickup": True},
        {
            "shipmentIndex": 1,
            "shipmentLabel": "barrier P123",
            "isPickup": False,
        },
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": True},
        {"shipmentIndex": 8, "shipmentLabel": "8: S008", "isPickup": False},
        {"shipmentIndex": 2, "shipmentLabel": "2: S002", "isPickup": False},
        {"shipmentIndex": 7, "shipmentLabel": "barrier P123", "isPickup": True},
        {
            "shipmentIndex": 7,
            "shipmentLabel": "barrier P123",
            "isPickup": False,
        },
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": True},
        {"shipmentIndex": 5, "shipmentLabel": "5: S005", "isPickup": False},
    ]
    transitions = [
        {"totalDuration": "0s"},
        {"totalDuration": "14s"},
        {"totalDuration": "16s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "32s"},
        {"totalDuration": "45s"},
        {"totalDuration": "27s"},
        {"totalDuration": "0s"},
        {"totalDuration": "0s"},
        {"totalDuration": "72s"},
        {"totalDuration": "18s"},
    ]
    travel_steps = [{} for _ in transitions]
    route: cfr_json.ShipmentRoute = {
        "visits": visits,
        "transitions": transitions,
        "travelSteps": travel_steps,
    }
    expected_splits = (
        (visits[0:2], transitions[0:3], travel_steps[0:3]),
        (visits[4:8], transitions[4:9], travel_steps[4:9]),
        (visits[10:], transitions[10:], travel_steps[10:]),
    )
    self.assertSequenceEqual(
        two_step_routing._split_refined_local_route(route),
        expected_splits,
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


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
