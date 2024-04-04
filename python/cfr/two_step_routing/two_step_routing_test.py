# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

from collections.abc import Sequence
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


class PlannerLocalLoadUnloadDurationTest(
    ValidateResponseMixin, unittest.TestCase
):
  maxDiff = None

  _OPTIONS = two_step_routing.Options(
      local_model_vehicle_fixed_cost=0,
      min_average_shipments_per_round=1,
      initial_local_model_grouping=two_step_routing.InitialLocalModelGrouping(
          time_windows=True
      ),
  )

  _REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "parking_load_unload_time/scenario.json"
  )
  _PARKING_LOCATIONS, _PARKING_FOR_SHIPMENT = (
      two_step_routing.load_parking_from_json(
          testdata.json("parking_load_unload_time/parking.json")
      )
  )
  _EXPECTED_LOCAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "parking_load_unload_time/scenario.local_request.json"
  )
  _LOCAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "parking_load_unload_time/scenario.local_response.10s.json"
  )
  _EXPECTED_GLOBAL_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "parking_load_unload_time/scenario.global_request.10s.json"
  )
  _GLOBAL_RESPONSE_JSON: cfr_json.OptimizeToursResponse = testdata.json(
      "parking_load_unload_time/scenario.global_response.10s.10s.json"
  )
  _EXPECTED_MERGED_REQUEST_JSON: cfr_json.OptimizeToursRequest = testdata.json(
      "parking_load_unload_time/scenario.merged_request.10s.10s.json"
  )
  _EXPECTED_MERGED_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "parking_load_unload_time/scenario.merged_response.10s.10s.json"
      )
  )
  _EXPECTED_LOCAL_REFINEMENT_REQUEST_JSON: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "parking_load_unload_time/scenario.refined_1.local_request.10s.10s.10s.10s.json"
      )
  )
  _LOCAL_REFINEMENT_RESPONSE_JSON: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "parking_load_unload_time/scenario.refined_1.local_response.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "parking_load_unload_time/scenario.refined_1.integrated_local_request.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_LOCAL_RESPONSE: cfr_json.OptimizeToursResponse = (
      testdata.json(
          "parking_load_unload_time/scenario.refined_1.integrated_local_response.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST: cfr_json.OptimizeToursRequest = (
      testdata.json(
          "parking_load_unload_time/scenario.refined_1.integrated_global_request.10s.10s.10s.10s.json"
      )
  )
  _EXPECTED_INTEGRATED_GLOBAL_REQUEST_FULL_ROUTES: (
      cfr_json.OptimizeToursRequest
  ) = testdata.json(
      "parking_load_unload_time/scenario.refined_1.integrated_global_request.10s.10s.10s.10s.full_routes.json"
  )
  _EXPECTED_INTEGRATED_GLOBAL_RESPONSE_FULL_ROUTES: (
      cfr_json.OptimizeToursResponse
  ) = testdata.json(
      "parking_load_unload_time/scenario.refined_1.integrated_global_response.10s.10s.10s.10s.full_routes.json"
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
        two_step_routing._get_local_model_route_start_time_windows(
            self._MODEL, local_route
        ),
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
        two_step_routing._get_local_model_route_start_time_windows(
            self._MODEL, local_route
        ),
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
        two_step_routing._get_local_model_route_start_time_windows(
            self._MODEL, local_route
        ),
        [{
            "startTime": "2023-10-25T10:20:00Z",
            "endTime": "2023-10-25T11:15:00Z",
        }],
    )


class LocalRouteVisitIsToParking(unittest.TestCase):
  """Tests for _local_route_visit_is_to_parking."""

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
            two_step_routing._local_route_visit_is_to_parking(
                visit, shipment=shipment
            ),
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
            two_step_routing._local_route_visit_is_to_parking(
                visit, shipments=self._SHIPMENTS
            ),
            expected_is_to_parking,
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


class RemoveWaitTimeInLocalRouteUnloadTest(unittest.TestCase):
  """Tests for _remove_wait_time_in_local_route_unload."""

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
    two_step_routing._remove_wait_time_in_local_route_unload(
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
    two_step_routing._remove_wait_time_in_local_route_unload(
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
    two_step_routing._remove_wait_time_in_local_route_unload(
        visits, transitions, self._SHIPMENTS
    )
    self.assertEqual(visits, expected_visits)
    self.assertEqual(transitions, expected_transitions)


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
            _parking.GroupKey("P123")
        ),
        "P123 []",
    )

  def test_parking_tag_and_start_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            _parking.GroupKey("P123", (("2023-08-11T00:00:00.000Z", None),))
        ),
        "P123 [time_windows=(start=2023-08-11T00:00:00.000Z)]",
    )

  def test_parking_tag_and_end_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
            _parking.GroupKey("P123", ((None, "2023-08-11T00:00:00.000Z"),))
        ),
        "P123 [time_windows=(end=2023-08-11T00:00:00.000Z)]",
    )

  def test_parking_tag_and_start_and_end_time(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
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
        two_step_routing._make_local_model_vehicle_label(
            _parking.GroupKey("P123", (), (0, 1, 2))
        ),
        "P123 [vehicles=(0, 1, 2)]",
    )

  def test_parking_tag_times_and_allowed_vehicles(self):
    self.assertEqual(
        two_step_routing._make_local_model_vehicle_label(
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
        two_step_routing._make_local_model_vehicle_label(
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
        two_step_routing._make_local_model_vehicle_label(
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
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
