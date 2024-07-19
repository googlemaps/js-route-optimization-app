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

"""Implements a basic two-step route optimization algorithm on top of CFR.

Takes a Cloud Fleet Routing (CFR) request augmented with parking location data,
and creates a response that uses the given parking locations for deliveries.

Technically, the optimization is done by decomposing the original request into
a sequence of requests that solve parts of the optimization problem, and then
recombining them into full routes that include both driving and walking
directions.

On a high level, the solver does the following:
1. For each parking location, compute optimized routes for shipments that are
   delivered from this parking location. These routes start at the parking
   location and visit one or more final delivery locations. Additional
   constraints may be used to limit the length of these local routes.

   These optimized routes are used in two ways:
     - they provide an estimation of the time necessary to serve each parking
       location; this estimate is used in the global plan.
     - they are included in the final routes.

2. Based on the results from step 1, compute optimized routes that connect the
   parking locations and shipments that are delivered directly to the customer
   location (i.e. they are not delivered through a parking location).

   All shipments that are delivered through a parking location are represented
   by one (or more) "virtual" shipments that represent the parking location and
   its shipments. This shipment has has the waypoint of the parking location
   and the visit duration is equivalent to the time needed to deliver the
   shipments from the parking location.

3. The results from both plans are merged into a final plan that includes both
   directions for "driving" from the depots to the parking locations (and to
   custommer sites that are not served from a parking locatio) and directions
   for "walking" from the parking location to the final delivery locations.

   This plan contains all shipments from the original request, and pairs of
   "virtual" shipments that represent arrivals to and departures from parking
   locations.
"""

import collections
from collections.abc import Collection, Mapping, MutableMapping, Sequence, Set
import copy
import dataclasses
import datetime
import logging
import re
from typing import TypeAlias, TypeVar

from . import _global_model
from . import _local_model
from . import _merged_model
from . import _parking
from . import _shared
from ..json import cfr_json

# Re-export types that are parts of the public API but that are implemented in
# _shared.py.
IntegrationMode = _shared.IntegrationMode
Options = _shared.Options


# Re-export functions and types that are part of the public API but that are
# implemented in _parking.py.
InitialLocalModelGrouping: TypeAlias = _parking.InitialLocalModelGrouping
ParkingTag: TypeAlias = _parking.ParkingTag
ParkingLocation: TypeAlias = _parking.ParkingLocation
load_parking_from_json = _parking.load_parking_from_json


# Defines a mapping from shipments to the parking locations from which they are
# delivered. The key of the map is the index of a shipment in the request, and
# the value is the label of the parking location through which it is delivered.
ShipmentParkingMap = Mapping[int, ParkingTag]


class Planner:
  """The two-step routing planner."""

  _request: cfr_json.OptimizeToursRequest
  _model: cfr_json.ShipmentModel
  _options: Options
  _shipments: Sequence[cfr_json.Shipment]
  _vehicles: Sequence[cfr_json.Vehicle]

  _parking_locations: Mapping[str, ParkingLocation]
  _parking_for_shipment: ShipmentParkingMap
  _parking_groups: Mapping[_parking.GroupKey, Sequence[int]]
  _direct_shipments: Set[int]

  def __init__(
      self,
      request_json: cfr_json.OptimizeToursRequest,
      parking_locations: Collection[ParkingLocation],
      parking_for_shipment: ShipmentParkingMap,
      options: Options,
  ):
    """Initializes the two-step planner.

    Args:
      request_json: The CFR JSON request, in the natural Python format.
      parking_locations: The list of parking locations used in the plan.
      parking_for_shipment: Mapping from shipment indices in `request_json` to
        tags of parking locations in `parking_locations`.
      options: Options of the two-step planner.

    Raises:
      ValueError: When an inconsistency is found in the input data. For example
        when a shipment index or parking location tag in `parking_for_shipment`
        is invalid.
    """
    self._options = options
    self._request = request_json

    # TODO(ondrasej): Do more extensive validation of the model, in particular
    # check that it does not use any unexpected features.
    try:
      self._model = self._request["model"]
      self._shipments = self._model["shipments"]
      self._vehicles = self._model["vehicles"]
    except KeyError as e:
      raise ValueError(
          "The request does not have the expected structure"
      ) from e

    self._num_shipments = len(self._shipments)

    # Index and validate the parking locations.
    indexed_parking_locations = {}
    for parking in parking_locations:
      if parking.tag in indexed_parking_locations:
        raise ValueError(f"Duplicate parking tag: {parking.tag}")
      indexed_parking_locations[parking.tag] = parking
    self._parking_locations: Mapping[str, ParkingLocation] = (
        indexed_parking_locations
    )

    # Index and validate the mapping between shipments and parking locations.
    self._parking_for_shipment = parking_for_shipment

    parking_groups = collections.defaultdict(list)
    for shipment_index, parking_tag in self._parking_for_shipment.items():
      if parking_tag not in self._parking_locations:
        raise ValueError(
            f"Parking tag '{parking_tag}' from parking_for_shipment was not"
            " found in parking_locations."
        )
      if shipment_index < 0 or shipment_index >= self._num_shipments:
        raise ValueError(
            f"Invalid shipment index: {shipment_index}. The shipment index must"
            f" be between 0 and {self._num_shipments}"
        )
      shipment = self._shipments[shipment_index]
      parking = self._parking_locations[parking_tag]
      parking_group_key = _parking.shipment_group_key(
          self._options.initial_local_model_grouping, shipment, parking
      )
      parking_groups[parking_group_key].append(shipment_index)
    self._parking_groups: Mapping[_parking.GroupKey, Sequence[int]] = (
        parking_groups
    )

    # Collect indices of shipments that are delivered directly.
    self._direct_shipments = set(range(self._num_shipments))
    self._direct_shipments.difference_update(self._parking_for_shipment.keys())

  def make_local_request(self) -> cfr_json.OptimizeToursRequest:
    """Builds a pickup & delivery local model request.

    Under the pickup & delivery model, each shipment has a delivery (resp.
    pickup) at the customer address from the input shipment, but also a matching
    pickup (resp. delivery) at the parking location that corresponds to
    unloading (resp. loading) the item from the vehicle at the parking.

    This model supports both pickups and deliveries from customers, and respects
    the load limits of the parking location vehicle at all times. It uses
    transition attributes to add a high cost/delay to solution which has
    multiple returns to the parking location on a single route, to force each
    delivery round on its own route.

    Returns:
      The JSON CFR request for the local part of the optimization, using a
      pickup & delivery approach.
    """
    local_shipments: list[cfr_json.Shipment] = []
    local_vehicles: list[cfr_json.Vehicle] = []
    local_model: cfr_json.ShipmentModel = {
        "globalEndTime": cfr_json.as_time_string(
            cfr_json.get_global_end_time(self._model)
        ),
        "globalStartTime": cfr_json.as_time_string(
            cfr_json.get_global_start_time(self._model)
        ),
        "shipments": local_shipments,
        "vehicles": local_vehicles,
    }

    transition_attribute_manager = _parking.TransitionAttributeManager(
        self._model
    )

    for parking_key, group_shipment_indices in self._parking_groups.items():
      parking_tag = parking_key.parking_tag
      assert parking_tag is not None
      parking = self._parking_locations[parking_tag]
      parking_tags = transition_attribute_manager.get_or_create(parking)
      num_shipments = len(group_shipment_indices)
      assert num_shipments > 0

      # Add one virtual vehicle for each shipment. This way, we can be sure that
      # there are never any skipped shipments in the local model, as long as
      # each shipment is feasible in isolation.
      vehicle_label = _local_model.make_vehicle_label(parking_key)
      group_vehicle_indices = []
      for round_index in range(num_shipments):
        group_vehicle_indices.append(len(local_vehicles))
        local_vehicles.append(
            _local_model.make_vehicle(
                self._options, parking, f"{vehicle_label}/{round_index}"
            )
        )

      for shipment_index in group_shipment_indices:
        original_shipment = self._shipments[shipment_index]
        local_shipment = _local_model.make_shipment(
            shipment_index,
            original_shipment,
            parking,
            group_vehicle_indices,
            parking_tags=parking_tags,
        )
        local_shipments.append(local_shipment)

    if transition_attribute_manager.local_transition_attributes:
      local_model["transitionAttributes"] = (
          transition_attribute_manager.local_transition_attributes
      )
    request: cfr_json.OptimizeToursRequest = {
        "label": self._request.get("label", "") + "/local",
        "model": local_model,
    }
    _shared.copy_shared_options(from_request=self._request, to_request=request)
    return request

  def make_global_request(
      self,
      local_response: cfr_json.OptimizeToursResponse,
      consider_road_traffic_override: bool | None = None,
  ) -> cfr_json.OptimizeToursRequest:
    """Creates a request for the global model.

    Args:
      local_response: A solution to the local model created by
        self.make_local_request() in the JSON format.
      consider_road_traffic_override: When True or False, the
        `considerRoadTraffic` option of the global model is set to this value.
        When None, the value is taken from the base request.

    Returns:
      A JSON CFR request for the global model based on a solution of the local
      model.

      Note that, for efficiency reasons, the returned data structure may contain
      parts of the input data strucutres, and it is thus not safe to mutate. If
      mutating it is needed, first make a copy via copy.deepcopy().

    Raises:
      ValueError: When `local_response` has an unexpected format.
    """

    # TODO(ondrasej): Validate that the local results corresponds to the
    # original request.
    global_shipments: list[cfr_json.Shipment] = []
    global_model: cfr_json.ShipmentModel = {
        "globalStartTime": self._model["globalStartTime"],
        "globalEndTime": self._model["globalEndTime"],
        "shipments": global_shipments,
        # Vehicles are the same as in the original request.
        "vehicles": self._model["vehicles"],
    }

    transition_attributes = _parking.TransitionAttributeManager(self._model)

    # Take all shipments that are delivered directly, and copy them to the
    # global request. the only change we make is that we add the original
    # shipment index to their label.
    for shipment_index in self._direct_shipments:
      # We're changing only the label - no need to make a deep copy.
      shipment = copy.copy(self._shipments[shipment_index])
      shipment["label"] = f"s:{shipment_index} {shipment.get('label')}"
      global_shipments.append(shipment)

    # Create a single virtual shipment for each group of shipments that are
    # delivered together through a parking location. Note that this way, we may
    # get multiple virtual shipments for a single parking location, if the
    # parking location has shipments with multiple time windows or if there are
    # too many shipments to deliver in one round. In the optimized routes, they
    # may be served by different vehicles, but if possible, it is likely that
    # they will be served by the same vehicle and the rounds will be next to
    # each other.
    for route_index, route in enumerate(cfr_json.get_routes(local_response)):
      visits = cfr_json.get_visits(route)
      if not visits:
        # Skip unused vehicles. The local plan uses a simple estimate of the
        # number of required vehicles, and is very likely to oversupply.
        continue

      parking_tag = _local_model.get_parking_tag_from_route(route)
      global_shipments.append(
          _global_model.make_shipment_for_local_route(
              model=self._model,
              local_route_index=route_index,
              local_route=route,
              parking=self._parking_locations[parking_tag],
              transition_attributes=transition_attributes,
          )
      )

    if transition_attributes.global_transition_attributes:
      global_model["transitionAttributes"] = (
          transition_attributes.global_transition_attributes
      )

    request = {
        "label": self._request.get("label", "") + "/global",
        "model": global_model,
    }
    _shared.copy_shared_options(from_request=self._request, to_request=request)
    if consider_road_traffic_override is not None:
      request["considerRoadTraffic"] = consider_road_traffic_override
    else:
      consider_road_traffic = self._request.get("considerRoadTraffic")
      if consider_road_traffic is not None:
        request["considerRoadTraffic"] = consider_road_traffic
    # TODO(ondrasej): Consider applying internal parameters also to the local
    # request; potentially, add separate internal parameters for the local and
    # the global models to the configuration of the planner.
    internal_parameters = self._request.get("internalParameters")
    if internal_parameters is not None:
      request["internalParameters"] = internal_parameters
    return request

  def make_local_refinement_request(
      self,
      local_response: cfr_json.OptimizeToursResponse,
      global_response: cfr_json.OptimizeToursResponse,
  ) -> cfr_json.OptimizeToursRequest:
    """Creates a refinement request for local routes for a complete solution.

    The refinement is done by re-optimizing the local (walking/biking) routes
    whenever there is a sequence of consecutive visits to the same parking
    location. This re-optimization is done on visits from all visits to the
    parking location in the sequence, so that the solver can reorganize how the
    local delivery rounds are done.

    This phase is different from the original local model in the sense that it:
      - always uses the original visit time windows for the visits in the plan,
      - uses a pickup & delivery model with a single vehicle and capacities to
        make sure that the result is a sequence of delivery rounds.
      - uses the original delivery rounds as an injected initial solution, so
        the refined solution should always have the same or better cost.

    Outline of the design of the model:
      - Each shipment is represented as a pickup (at the parking location) and a
        delivery (at the delivery address). If the original shipment had a time
        window constraint, the new shipment will have the same time window on
        the delivery request. All shipments are mandatory.
      - There is a single vehicle with capacity constraints corresponding to the
        capacity constraints for delivery from this parking location. The
        vehicle start and end time are flexible, but they are restricted to the
        start/end time of the sequence of visits to the parking location in the
        original solution.
      - The capacity constraint makes the "vehicle" return to the parking
        location when there are more shipments than can be delivered in one
        round. At the same time, by using a single vehicle, we make sure that
        the delivery rounds that we get out of the optimization can be executed
        by one driver in a sequence.
      - The model minimizes the total time and the total distance. Compared to
        the base local model, the cost per km and cost per hour are the same,
        but there is an additional steep cost for using more time than the
        solution of the base local model.

    Args:
      local_response: The original solution of the "local" part of the model.
      global_response: The original solution of the "global" part of the model.

    Returns:
      A new CFR request that models the refinement of local routes based on the
      solution of the global model.
    """
    global_routes = cfr_json.get_routes(global_response)
    transition_attribute_manager = _parking.TransitionAttributeManager(
        self._model
    )

    refinement_vehicles: list[cfr_json.Vehicle] = []
    refinement_shipments: list[cfr_json.Shipment] = []
    refinement_model: cfr_json.ShipmentModel = {
        "globalEndTime": self._model["globalEndTime"],
        "globalStartTime": self._model["globalStartTime"],
        "shipments": refinement_shipments,
        "vehicles": refinement_vehicles,
        "transitionAttributes": (
            transition_attribute_manager.local_refinement_transition_attributes
        ),
    }
    refinement_injected_routes: list[cfr_json.ShipmentRoute] = []

    consecutive_visit_sequences: list[_ConsecutiveParkingLocationVisits] = []
    for route in global_routes:
      consecutive_visit_sequences.extend(
          _get_consecutive_parking_location_visits(local_response, route)
      )

    refinement_shipment_for_original = {}
    for consecutive_visit_sequence in consecutive_visit_sequences:
      parking = self._parking_locations[consecutive_visit_sequence.parking_tag]
      parking_tags = transition_attribute_manager.get_or_create(parking)

      refinement_vehicle_index = len(refinement_vehicles)
      refinement_vehicle_label = (
          f"global_route:{consecutive_visit_sequence.vehicle_index}"
          f" start:{consecutive_visit_sequence.first_global_visit_index}"
          f" size:{consecutive_visit_sequence.num_global_visits}"
          f" parking:{consecutive_visit_sequence.parking_tag}"
      )
      refinement_vehicle = _local_model.make_vehicle(
          self._options, parking, refinement_vehicle_label
      )

      # NOTE(ondrasej): We use soft start time windows with steep costs instead
      # of a hard time window here. The time window is exactly the total time of
      # the previous solution, and as such it may be very tight and even slight
      # changes in travel times can make it infeasible.
      # By using soft start/end times, we allow the solver proceed even if this
      # happens; if, in the end, the refined solution is worse than the original
      # we preserve the original solution.
      refinement_vehicle["startTimeWindows"] = [{
          "startTime": consecutive_visit_sequence.start_time,
          "endTime": consecutive_visit_sequence.start_time,
      }]
      refinement_vehicle["endTimeWindows"] = [{
          "softEndTime": consecutive_visit_sequence.end_time,
          "costPerHourAfterSoftEndTime": 1000000,
      }]
      refinement_vehicles.append(refinement_vehicle)

      injected_visits: list[cfr_json.Visit] = []
      refinement_injected_route: cfr_json.ShipmentRoute = {
          "vehicleIndex": refinement_vehicle_index,
          "visits": injected_visits,
      }
      refinement_injected_routes.append(refinement_injected_route)

      # The vist rounds are added in the order in which they appear on the base
      # global route. To build a first solution hint for the local refinement
      # model, we mainly reuse the visits from the previous local model,
      # concatenated in the order in which they appear in the global model and
      # with barrier separators in between.
      #
      # As a consequence, the injected solution that we build based on the
      # shipments in these rounds is feasible by construction, because both the
      # local and global routes were feasible and the basic parameters and the
      # cosntraints of the solution do not change. The only case where the
      # injected solution may become infeasible is when there is a significant
      # change in travel duration between the base local model and the
      # refinement model; however, given that we do not use live traffic in
      # the local models, this is very unlikely.
      for round_index, visit_round in enumerate(
          consecutive_visit_sequence.visits
      ):
        if round_index > 0:
          barrier_shipment_index = len(refinement_shipments)
          refinement_shipments.append(
              _make_local_model_barrier_shipment(
                  parking, [refinement_vehicle_index], parking_tags
              )
          )
          injected_visits.append({
              "shipmentIndex": barrier_shipment_index,
              "isPickup": True,
              "shipmentLabel": refinement_shipments[-1]["label"],
          })
          injected_visits.append({
              "shipmentIndex": barrier_shipment_index,
              "shipmentLabel": refinement_shipments[-1]["label"],
          })

        for visit in visit_round:
          shipment_index = visit.get("shipmentIndex", 0)
          original_shipment = self._shipments[shipment_index]
          refinement_shipment_index = refinement_shipment_for_original.get(
              shipment_index
          )
          # There are two visits for each shipment; only add the shipment to the
          # refinement model once.
          if refinement_shipment_index is None:
            refinement_shipment = _local_model.make_shipment(
                shipment_index,
                original_shipment,
                parking,
                [refinement_vehicle_index],
                parking_tags=parking_tags,
            )
            refinement_shipment_index = len(refinement_shipments)
            refinement_shipments.append(refinement_shipment)
            refinement_shipment_for_original[shipment_index] = (
                refinement_shipment_index
            )
          else:
            refinement_shipment = refinement_shipments[
                refinement_shipment_index
            ]
          injected_visit = copy.deepcopy(visit)
          injected_visit["shipmentIndex"] = refinement_shipment_index
          injected_visit["shipmentLabel"] = refinement_shipment["label"]
          injected_visits.append(injected_visit)

      # Add one additional barrier to allow the solver to increase the number of
      # delivery rounds in the rare case where it is actually beneficial.
      refinement_shipments.append(
          _make_local_model_barrier_shipment(
              parking, [refinement_vehicle_index], parking_tags
          )
      )

      # TODO(ondrasej): Also add skipped any shipments delivered from this
      # parking location that were skipped in the original plan. When adding
      # more shipments, we need to make sure that the solution does include the
      # skipped shipments at the expense of exceeding the available time.

    request = {
        "label": self._request.get("label", "") + "/local_refinement",
        "model": refinement_model,
        "injectedFirstSolutionRoutes": refinement_injected_routes,
    }
    _shared.copy_shared_options(from_request=self._request, to_request=request)
    return request

  def integrate_local_refinement(
      self,
      local_request: cfr_json.OptimizeToursRequest,
      local_response: cfr_json.OptimizeToursResponse,
      global_request: cfr_json.OptimizeToursRequest,
      global_response: cfr_json.OptimizeToursResponse,
      refinement_response: cfr_json.OptimizeToursResponse,
      integration_mode: IntegrationMode,
  ) -> tuple[
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse,
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse | None,
  ]:
    """Integrates a refined local plan into the base local and global models.

    Takes the base local and global requests and responses, and a response to a
    local refinement model, and creates:

    1. an integrated local request and response; the local model is created by
      replacing the refined parts of the base local model with the refinement.
      The integrated local model covers all shipments delivered from a parking
      location, and can be used as a local model with
      Planner.merge_local_and_global_result.
    2. an integrated global request; the global request is similar to the base
      global request, but it is based on the integrated local model rather than
      on the base local model.
    3. a first solution hint for the integrated global request; this first
      solution is created from the solution of the base global model by
      replacing the refined parts.
    4. an optional integrated global response. This response is created by
      reusing the routes in the previous global model, accounting for the
      refined local routes. Any time saved by the local refinement is
      transformed into wait time in the global model.
      This approach always yields a feasible solution because the local
      refinement either preserves the duration of the delivery rounds or makes
      them shorter. The result may, however, contain trivial inefficiencies
      because of the wait time used as padding.
      The full response is returned only when integration_mode is
      IntegrationMode.FULL_ROUTE; otherwise, it is None.

    When the integrated global response is not requested, it needs to be
    re-solved via CFR to (1) update arrival and departure times in the solution,
    (2) inject road traffic information if requested, and (3) use any time saved
    by the refinement to deliver more shipments.

    The solution of the integrated global model can be used together with the
    solution of the integrated local model to obtain a merged request+response
    via `Planner.merge_local_and_global_result()`.

    Args:
      local_request: A local request created by `self.make_local_request()`.
      local_response: A solution for `local_request`.
      global_request: A global request created by
        `self.make_global_request(local_response)`.
      global_response: A solution for `global_request`.
      refinement_response: A solution for a request created by
        `self.make_local_refinement_request(local_response, global_response)`.
      integration_mode: Determines the level of integration of the local
        solution into the global refinement request injected first solution.

    Returns:
      A tuple `(integrated_local_request, integrated_local_response,
      integrated_global_request, integrated_global_response)` that contains the
      results of the integration as described above.

    Raises:
      ValueError: If the inputs are invalid or inconsistent.
    """
    integration = _RefinedRouteIntegration(
        options=self._options,
        parking_locations=self._parking_locations,
        request=self._request,
        local_request=local_request,
        local_response=local_response,
        global_request=global_request,
        global_response=global_response,
        refinement_response=refinement_response,
        integration_mode=integration_mode,
    )
    return integration.integrate()

  def merge_local_and_global_result(
      self,
      local_response: cfr_json.OptimizeToursResponse,
      global_response: cfr_json.OptimizeToursResponse,
      check_consistency: bool = True,
  ) -> tuple[cfr_json.OptimizeToursRequest, cfr_json.OptimizeToursResponse]:
    """Creates a merged request and a response from the local and global models.

    The merged request and response incorporate both the global "driving" routes
    from the global model and the local "walking" routes from the local model.
    The merged request uses the same shipments as the original request, extended
    with "virtual" shipments used to represent parking location arrivals and
    departures in the merged routes.

    Each parking location visit from the global plan is replaced by a visit to
    a virtual shipment that represents the arrival to the parking location, then
    all shipments delivered from the parking location, and then another virtual
    shipment that represents the departure from the parking location. The
    virtual shipments use the waypoint of the parking location as their
    position; the actual shipments delivered through the parking location and
    transitions between them are taken from the local plan.

    The request and the response follow the same structure as standard CFR JSON
    requests, but they do not use all fields, and sending the merged request to
    the CFR API endpoint would not produce the merged response. The pair can
    however be used for example to inspect the solution in the fleet routing app
    or be used by other applications that consume a CFR response.

    Args:
      local_response: A solution of the local model created by
        self.make_local_request(). The local request itself is not needed.
      global_response: A solution of the global model created by
        self.make_global_request(local_response). The global request itself is
        not needed.
      check_consistency: Set to False to avoid consistency checks in the merged
        response.

    Returns:
      A tuple (merged_request, merged_response) that contains the merged data
      from the original request and the local and global results.

      Note that, for efficiency reasons, the returned data structure may contain
      parts of the input data strucutres, and it is thus not safe to mutate. If
      mutating it is needed, first make a copy via copy.deepcopy().
    """

    merge_local_and_global = _merged_model.MergeLocalAndGlobalModel(
        self._request, self._parking_locations, self._options
    )
    return merge_local_and_global.merge_local_and_global_result(
        local_response, global_response, check_consistency
    )


def _make_local_model_barrier_shipment(
    parking: ParkingLocation,
    parking_vehicle_indices: list[int],
    parking_tags: _parking.ParkingLocationTags,
) -> cfr_json.Shipment:
  """Creates a barrier shipment for the local refinement model.

  The barrier shipment consumes the whole capacity of the vehicle used from the
  parking, forcing it to make any pending deliveries before passing through the
  barrier. It should be used with transition attributes that turn the barrier
  into a separator between two visit rounds (without a return to the vehicle).

  Args:
    parking: The parking for which the barrier is created.
    parking_vehicle_indices: The list of vehicle indices in the local refinement
      model that are used with this barrier.
    parking_tags: The transition attribute tags used for the parking location.

  Returns:
    A new shipment that can be used as a barrier in the local refinement model.
  """
  barrier: cfr_json.Shipment = {
      "pickups": [{
          "arrivalWaypoint": parking.waypoint_for_local_model,
          "duration": "0s",
          "tags": [parking_tags.local_barrier_pickup_tag],
      }],
      "deliveries": [{
          "arrivalWaypoint": parking.waypoint_for_local_model,
          "duration": "0s",
          "tags": [parking_tags.local_barrier_delivery_tag],
      }],
      "penaltyCost": 0,
      "allowedVehicleIndices": parking_vehicle_indices,
      "label": f"barrier {parking.tag}",
  }
  if (load_limits := parking.delivery_load_limits) is not None:
    barrier["loadDemands"] = {
        unit: {"amount": str(amount)} for unit, amount in load_limits.items()
    }
  return barrier


def validate_request(
    request: cfr_json.OptimizeToursRequest,
    parking_for_shipment: ShipmentParkingMap,
) -> Sequence[str] | None:
  """Checks that request conforms to the requirements of the two-step planner.

  Args:
    request: The validated request in the CFR JSON format.
    parking_for_shipment: Mapping from shipment indices in the request to
      parking location tags.

  Returns:
    A list of errors found during the validation or None when no issues
    are found. Note that this function might not be exhaustive, and even if it
    does not return any errors, the two-step planner may still not support the
    plan correctly.
  """
  shipments = request["model"]["shipments"]
  errors = []

  def append_shipment_error(error: str, shipment_index: int, label: str):
    errors.append(f"{error}. Invalid shipment {shipment_index} ({label!r})")

  for shipment_index, shipment in enumerate(shipments):
    if shipment_index not in parking_for_shipment:
      # Shipment is not delivered via a parking location.
      continue

    label = shipment.get("label", "")

    deliveries = shipment.get("deliveries", ())
    pickups = shipment.get("pickups", ())

    if len(pickups) + len(deliveries) != 1:
      append_shipment_error(
          "Each shipment must have either a single pickup or a single delivery"
          " request",
          shipment_index,
          label,
      )

  if errors:
    return errors
  return None


class _RefinedRouteIntegration:
  """The integration of a refined local solution into the base models.

  This is the implementation of `Planner.integrate_local_refinement()`. See the
  docstring of the method for more details of the algorithm.
  """

  def __init__(
      self,
      options: Options,
      parking_locations: Mapping[str, ParkingLocation],
      request: cfr_json.OptimizeToursRequest,
      local_request: cfr_json.OptimizeToursRequest,
      local_response: cfr_json.OptimizeToursResponse,
      global_request: cfr_json.OptimizeToursRequest,
      global_response: cfr_json.OptimizeToursResponse,
      refinement_response: cfr_json.OptimizeToursResponse,
      integration_mode: IntegrationMode,
  ):
    """Initializes the integration algorithm.

    Args:
      options: The options of the planner that uses this class.
      parking_locations: The list of parking locations used in the planner.
      request: The base request passed to the planner by the user.
      local_request: A local request created by `planner.make_local_request()`.
      local_response: A solution for `local_request`.
      global_request: A global request created by
        `planner.make_global_request(local_response)`.
      global_response: A solution for `global_request`.
      refinement_response: A solution for a request created by
        `self.make_local_refinement_request(local_response, global_response)`.
      integration_mode: Specifies the amount of detail used when integrating the
        local solution routes.
    """
    self._options = options
    self._parking_locations = parking_locations
    self._request = request
    self._model = request["model"]

    self._local_request = local_request
    local_model = local_request["model"]
    self._local_vehicles = cfr_json.get_vehicles(local_model)

    self._local_response = local_response
    self._local_routes = cfr_json.get_routes(local_response)

    self._global_request = global_request
    global_model = self._global_request["model"]
    self._global_shipments = cfr_json.get_shipments(global_model)

    self._global_response = global_response
    self._global_routes = cfr_json.get_routes(global_response)

    self._integration_mode = integration_mode

    refinement_routes = cfr_json.get_routes(refinement_response)

    # Shipments in the integrated local model are the same as in the base local
    # model, only the vehicles are redefined based on the new routes. This is
    # not 100% correct, as any fields based on vehicle indices
    # (allowedVehicleIndices, costsPerVehicle) will be invalid in the integrated
    # local model, but it is OK for use with merge_local_and_global_result().
    # TODO(ondrasej): Update vehicle-index based fields in the integrated local
    # model to make it consistent with the rest of the request and the response.
    integrated_local_shipments = list(cfr_json.get_shipments(local_model))
    self._integrated_local_vehicles: list[cfr_json.Vehicle] = []
    self._integrated_local_model: cfr_json.ShipmentModel = copy.copy(
        local_model
    )
    self._integrated_local_model["shipments"] = integrated_local_shipments
    self._integrated_local_model["vehicles"] = self._integrated_local_vehicles

    self._integrated_local_routes: list[cfr_json.ShipmentRoute] = []
    self._integrated_local_request: cfr_json.OptimizeToursRequest | None = None
    self._integrated_local_response: cfr_json.OptimizeToursResponse | None = (
        None
    )

    self._integrated_global_shipments: list[cfr_json.Shipment] = []
    self._integrated_global_model = copy.copy(global_model)
    self._integrated_global_model["shipments"] = (
        self._integrated_global_shipments
    )
    self._integrated_global_routes: list[cfr_json.ShipmentRoute] = []
    self._integrated_global_skipped_shipments: list[
        cfr_json.SkippedShipment
    ] = []
    self._integrated_global_request: cfr_json.OptimizeToursRequest | None = None
    self._integrated_global_response: cfr_json.OptimizeToursResponse | None = (
        None
    )

    self._transition_attributes = _parking.TransitionAttributeManager(
        self._model
    )

    # Map routes from `refinement_routes` to the original global routes.
    self._refinements_for_global_route: MutableMapping[
        int, MutableMapping[int, tuple[int, cfr_json.ShipmentRoute]]
    ] = collections.defaultdict(dict)
    for refinement_route in refinement_routes:
      global_route_index, start_visit, num_visits, _ = (
          _parse_refinement_vehicle_label(
              refinement_route.get("vehicleLabel", "")
          )
      )
      self._refinements_for_global_route[global_route_index][start_visit] = (
          num_visits,
          refinement_route,
      )

    self._local_shipment_for_original_shipment = (
        _local_model.make_local_shipment_from_shipment_map(
            cfr_json.get_shipments(local_model)
        )
    )

  def integrate(
      self,
  ) -> tuple[
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse,
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse | None,
  ]:
    """Integrates the refinement result into the base local and global models.

    Replaces the vehicles and routes in the base local model with the refined
    ones and creates a new global model that uses the data from the refined
    local model instead. At the global level, only the refined request is
    created; it contains the updated virtual shipments, and it comes with a
    first solution hint corresponding to the solution of the base global model.

    This method can be called multiple times. Subsequent calls just return the
    same values as the first call.

    Returns:
      A tuple (local_request, local_response, global_request, global_response)
      where local_request and local_response contain the integrated local model
      and its solution, global_request contains a global model adapted to the
      integrated local model and injected routes based on the solution of the
      base global model, and global response contains an optional solution of
      the refined global model created during the integration process. It is not
      None only when integration_mode is IntegrationMode.FULL_ROUTES.
    """
    if self._integrated_local_request is None:
      self._integrate_global_routes()
      self._integrate_global_skipped_shipments()

      # Create the integrated local request. We only need the request-level
      # attributes, no need to copy also details of the model.
      self._integrated_local_request = copy.copy(self._local_request)
      self._integrated_local_request["model"] = self._integrated_local_model
      self._integrated_local_request["label"] = (
          f"{self._request.get('label', '')}/refined_local"
      )
      self._integrated_local_request.pop("injectedFirstSolutionRoutes", None)

      # Create the integrated local response.
      self._integrated_local_response: cfr_json.OptimizeToursResponse = {
          "routes": self._integrated_local_routes,
      }
      local_skipped_shipments = self._local_response.get("skippedShipments")
      if local_skipped_shipments is not None:
        self._integrated_local_response["skippedShipments"] = (
            local_skipped_shipments
        )

      # Create the integrated global request.
      self._integrated_global_request = copy.copy(self._global_request)
      self._integrated_global_request["model"] = self._integrated_global_model
      integrated_global_request_label = (
          f"{self._request.get('label', '')}/refined_global"
      )
      self._integrated_global_request["label"] = integrated_global_request_label
      self._integrated_global_request["injectedFirstSolutionRoutes"] = (
          self._integrated_global_routes
      )
      consider_road_traffic = self._request.get("considerRoadTraffic")
      if consider_road_traffic is not None:
        self._integrated_global_request["considerRoadTraffic"] = (
            consider_road_traffic
        )

      _global_model.assert_routes_handle_same_shipments(
          self._global_response, {"routes": self._integrated_global_routes}
      )

      if self._integration_mode == IntegrationMode.FULL_ROUTES:
        self._integrated_global_response = {
            "routes": self._integrated_global_routes,
            "requestLabel": integrated_global_request_label,
        }
        if self._integrated_global_skipped_shipments:
          self._integrated_global_response["skippedShipments"] = (
              self._integrated_global_skipped_shipments
          )
        # TODO(ondrasej): Add costs.
        # TODO(ondrasej): Add metrics and aggregated route metrics.

    assert self._integrated_local_request is not None
    assert self._integrated_local_response is not None
    assert self._integrated_global_request is not None
    assert (
        self._integration_mode != IntegrationMode.FULL_ROUTES
        or self._integrated_global_response is not None
    )
    return (
        self._integrated_local_request,
        self._integrated_local_response,
        self._integrated_global_request,
        self._integrated_global_response,
    )

  def _integrate_global_skipped_shipments(self) -> None:
    """Integrates skipped shipments from the global plan."""
    # NOTE(ondrasej): We'll be re-solving the global model with a warm start.
    # The global skipped shipments were not part of the base global routes, so
    # we only need to add the shipment definitions to the integrated global
    # model, but we do not need to register them as "skipped" anywhere.
    global_skipped_shipments = self._global_response.get("skippedShipments", ())
    for global_skipped_shipment in global_skipped_shipments:
      global_shipment_index = global_skipped_shipment.get("index", 0)
      global_shipment = self._global_shipments[global_shipment_index]
      visit_type, index = _global_model.parse_shipment_label(
          global_skipped_shipment["label"]
      )
      match visit_type:
        case "s":
          # The visit is for a shipment delivered directly. It refers only to
          # the shipment in the base model which did not change with
          # integration, so we can reuse it in the integrate model without any
          # changes.
          integrated_global_shipment_index = (
              self._add_integrated_global_shipment(
                  global_shipment,
                  add_to_visits=None,
                  visit_start_time=None,
                  visit_detour=None,
                  is_pickup=None,
                  visit_request_index=None,
              )
          )
        case "p":
          # The visit is for a round of deliveries from a parking location. It
          # was skipped in the base global model, and so it could not have been
          # part of a refinement.
          integrated_global_shipment_index = (
              self._integrate_unmodified_local_route(
                  global_shipment,
                  local_route_index=index,
                  add_to_visits=None,
                  visit_start_time=None,
                  visit_detour=None,
              )
          )
        case _:
          raise ValueError("Unexpected global visit type: {visit_type!r}")
      if self._integration_mode == IntegrationMode.FULL_ROUTES:
        integrated_global_shipment = self._integrated_global_shipments[
            integrated_global_shipment_index
        ]
        self._integrated_global_skipped_shipments.append({
            "index": integrated_global_shipment_index,
            "label": integrated_global_shipment["label"],
        })

  def _integrate_global_routes(self) -> None:
    """Integrates visits from the global routes to the refined models.

    Goes through the routes in the solution of the base global model, and moves
    them to the integrated local and global models. Shipments delivered directly
    and local routes that did not go through the refinement are carried over
    unmodified; local routes that were subject to refinement are replaced with
    their refined versions.
    """
    no_refinements = {}
    for global_route_index, global_route in enumerate(self._global_routes):
      logging.debug("Integrating route %d", global_route_index)
      global_visits = cfr_json.get_visits(global_route)
      global_transitions = cfr_json.get_transitions(global_route)

      integrated_global_route: cfr_json.ShipmentRoute = {
          "vehicleIndex": global_route_index,
      }
      if (global_vehicle_label := global_route.get("vehicleLabel")) is not None:
        integrated_global_route["vehicleLabel"] = global_vehicle_label
      self._integrated_global_routes.append(integrated_global_route)

      if not global_visits:
        continue

      integrated_global_visits = integrated_global_route["visits"] = []

      integrated_global_transitions: list[cfr_json.Transition] | None = None
      if self._integration_mode == IntegrationMode.FULL_ROUTES:
        if (route_polyline := global_route.get("routePolyline")) is not None:
          integrated_global_route["routePolyline"] = route_polyline
        has_infeasibilities = global_route.get(
            "hasTrafficInfeasibilities", False
        )
        if has_infeasibilities is not None:
          integrated_global_route["hasTrafficInfeasibilities"] = (
              has_infeasibilities
          )
        integrated_global_transitions = []
        integrated_global_route["transitions"] = integrated_global_transitions

      if self._integration_mode != IntegrationMode.VISITS_ONLY:
        # TODO(ondrasej): These could be theoretically adjusted based on the
        # saved time, but we need to respect all the constrants in the model. To
        # avoid the complexity of the full constraint model, we just keep the
        # original start/end times, and pad them with wait time where needed.
        integrated_global_route["vehicleStartTime"] = global_route[
            "vehicleStartTime"
        ]
        integrated_global_route["vehicleEndTime"] = global_route[
            "vehicleEndTime"
        ]

      # Visit time intervals in the refined plan are a subset of visit time
      # intervals in the original plan. As a consequence, break start times and
      # durations can be safely carried over to the refined plan to bootstrap
      # the solver.
      if (global_breaks := global_route.get("breaks")) is not None:
        integrated_global_route["breaks"] = copy.deepcopy(global_breaks)

      refinements: Mapping[int, tuple[int, cfr_json.ShipmentRoute]] = (
          self._refinements_for_global_route.get(
              global_route_index, no_refinements
          )
      )

      num_visits_to_skip = 0
      for global_visit_index, global_visit in enumerate(global_visits):
        logging.debug(
            "Integrating visit global_visit_index=%d:\global_visit=%r",
            global_visit_index,
            global_visit,
        )
        if num_visits_to_skip > 0:
          num_visits_to_skip -= 1
          continue
        if integrated_global_transitions is not None:
          global_transition = global_transitions[global_visit_index]
          transition = copy.deepcopy(global_transition)
          # The transition start time in the previous global response might be
          # later than the end of the last visit, because the local refinement
          # may have shortened the last visit duration. To make sure that all
          # invariants of the solution are preserved, we remove the start time
          # here and recompute it later once we have start times and durations
          # of all visits on the route.
          transition.pop("startTime", None)
          # TODO(ondrasej): We may need to keep the waitDuration in case there
          # are negative wait times (because of traffic infeasibilities).
          transition.pop("waitDuration", None)
          integrated_global_transitions.append(transition)

        global_shipment_label = global_visit.get("shipmentLabel", "")
        global_shipment_index = global_visit.get("shipmentIndex", 0)
        global_shipment = self._global_shipments[global_shipment_index]
        visit_type, index = _global_model.parse_shipment_label(
            global_shipment_label
        )
        visit_refinement = refinements.get(global_visit_index)
        if visit_refinement is not None:
          if visit_type != "p":
            raise ValueError(
                "Expected a parking location visit, found"
                f" {global_shipment_label!r}"
            )
          num_refined_visits, refined_local_route = visit_refinement
          logging.debug(
              "This is a refinement,"
              " num_refined_visit=%d,\nrefined_local_route=%r",
              num_refined_visits,
              refined_local_route,
          )
          self._integrate_refined_local_route(
              refined_local_route,
              add_to_visits=integrated_global_visits,
              add_to_transitions=integrated_global_transitions,
              visit_detour=global_visit["detour"],
          )
          # Skip all following visits that were part of the refined route that
          # we just integrated.
          num_visits_to_skip = num_refined_visits - 1
        else:
          # This global visit was not part of the refinement, we just need to
          # carry over the shipment or local delivery round from the base model.
          visit_start_time = global_visit["startTime"]
          visit_detour = global_visit["detour"]
          is_pickup = global_visit.get("isPickup", False)
          visit_request_index = global_visit.get("visitRequestIndex", 0)
          match visit_type:
            case "s":
              self._add_integrated_global_shipment(
                  global_shipment,
                  add_to_visits=integrated_global_visits,
                  visit_start_time=visit_start_time,
                  visit_detour=visit_detour,
                  is_pickup=is_pickup,
                  visit_request_index=visit_request_index,
              )
            case "p":
              self._integrate_unmodified_local_route(
                  global_shipment,
                  local_route_index=index,
                  add_to_visits=integrated_global_visits,
                  visit_start_time=visit_start_time,
                  visit_detour=visit_detour,
              )
            case _:
              raise ValueError(f"Unexpected global visit type: {visit_type!r}")

      assert num_visits_to_skip == 0

      if integrated_global_transitions is not None:
        # Add the transition back to the depot.
        transition_to_depot: cfr_json.Transition = copy.deepcopy(
            global_transitions[-1]
        )
        # Remove the start time and wait duration of the transition to have them
        # adjusted later. See the comments on the other transition.pop() line
        # above for the explanation.
        transition_to_depot.pop("startTime", None)
        transition_to_depot.pop("waitDuration", None)
        integrated_global_transitions.append(transition_to_depot)

        # Fix transition start times, and pad the transitions with waitDuration
        # as needed to make all the invariants work.
        # We allow the computation to create negative wait time. This is
        # sometimes needed to deal with effects of traffic infeasibility in the
        # original plan.
        # TODO(ondrasej): Investigate other ways of dealing with traffic
        # infeasibility.
        has_traffic_infeasibility = integrated_global_route.get(
            "hasTrafficInfeasibilities", False
        )
        cfr_json.recompute_transition_starts_and_durations(
            self._integrated_global_model,
            integrated_global_route,
            allow_negative_wait_duration=has_traffic_infeasibility,
        )
        if self._options.use_deprecated_fields:
          cfr_json.recompute_travel_steps_from_transitions(
              integrated_global_route
          )
        cfr_json.recompute_route_metrics(
            self._integrated_global_model,
            integrated_global_route,
            check_consistency=True,
        )
        # TODO(ondrasej): Recompute other visit and transition metadata. As of
        # 2024-01-18, this concerns mainly vehicle load metadata. Those copied
        # from the previous global solution are still valid as long as we do not
        # change the shipments delivered from the local rounds during the
        # refinement, but we are missing them on the visits and transitions
        # added when integrating refined local routes.
        # TODO(ondrasej): Integrate or recompute route costs. Most of the costs
        # can probably be carried over from the previous global response.
        integrated_global_route["routeTotalCost"] = global_route[
            "routeTotalCost"
        ]

  def _integrate_refined_local_route(
      self,
      refined_local_route: cfr_json.ShipmentRoute,
      add_to_visits: list[cfr_json.Visit],
      add_to_transitions: list[cfr_json.Transition] | None,
      visit_detour: cfr_json.DurationString,
  ) -> None:
    """Integrates a refined local route to the refined models and solutions.

    Splits the refined local route into delivery rounds, and creates a new
    vehicle and route in the integrated local model and solution. Adds virtual
    shipments and visits to the integrated global model and initial solution.

    Args:
      refined_local_route: The route from the refinement local model that
        represents the new delivery rounds for the parking location.
      add_to_visits: Visits for the shipments that represent the new delivery
        rounds in the integrated global model are added to this list.
      add_to_transitions: Transitions for the integrated global route are added
        to this list. These transitions are added only when there are multiple
        local delivery rounds, and the transitions are added only between those
        local delivery rounds.
      visit_detour: The detour of the delivery visit for the first delivery
        round of the refined local model.
    """
    refined_route_splits = _split_refined_local_route(refined_local_route)
    num_refined_route_splits = len(refined_route_splits)
    refined_route_label = refined_local_route.get("vehicleLabel", "")
    assert refined_route_splits, "Refined local routes are never empty."

    _, _, _, parking_tag = _parse_refinement_vehicle_label(refined_route_label)
    parking = self._parking_locations[parking_tag]

    integrated_detour = cfr_json.parse_duration_string(visit_detour)
    previous_split_start_time = None
    for refined_split_index, refined_split in enumerate(refined_route_splits):
      (
          integrated_route_visits,
          integrated_route_transitions,
          integrated_route_travel_steps,
      ) = copy.deepcopy(refined_split)
      assert integrated_route_visits
      assert (
          len(integrated_route_transitions) == len(integrated_route_visits) + 1
      )

      if refined_split_index > 0 and add_to_transitions is not None:
        # TODO(ondrasej): There might also be tag-based delays coming from
        # transition attributes. We need to find if any applies, and add them.
        # We need to analyze all tags on the parking location shipment to get a
        # precise delay between the two delivery rounds.
        reload_delay = parking.reload_duration or "0s"
        reload_transition: cfr_json.Transition = {
            "travelDuration": "0s",
            "travelDistanceMeters": 0,
            "delayDuration": reload_delay,
            "waitDuration": "0s",
            # Breaks can't appear at this stage.
            "breakDuration": "0s",
            "totalDuration": reload_delay,
            "routePolyline": {},
        }
        add_to_transitions.append(reload_transition)

      # Update shipment indices in the integrated local route.
      for visit in integrated_route_visits:
        logging.debug("integrating visit %r", visit)
        # We first extract the index of the shipment in the original model and
        # then map it to a shipment index in the base local model. Since the
        # visits are already a local copy, we can safely update it in place.
        shipment_index = _local_model.get_shipment_index_from_visit(visit)
        visit["shipmentIndex"] = self._local_shipment_for_original_shipment[
            shipment_index
        ]

      # When there is wait time between two visits to a parking location and we
      # decide to merge them in the refinement anyway, the solver may preserve
      # the wait time in the local refinement solution. When it appears between
      # visits to customer locations, everything is OK. But the solver may also
      # place it between the unloading visits at the parking location, and this
      # wait time would disappear from the overall route metrics.
      # Since the loading and unloading visits never have a time window, we just
      # push the wait time before the first unloading visit.
      # This situation does happen only for unloading and not for loading,
      # because the vehicle start time in the local refinement route is pinned
      # to the original start time (to avoid drift), but the solver can adjust
      # the end time and remove the wait time.
      _local_model.remove_wait_time_from_unload_transitions(
          integrated_route_visits,
          integrated_route_transitions,
          self._model["shipments"],
      )

      # Add a new vehicle for the delivery round to the integrated local model.
      integrated_local_vehicle_index = len(self._integrated_local_vehicles)
      integrated_local_vehicle_label = (
          f"{parking_tag} [refinement]/{refined_split_index}"
      )
      self._integrated_local_vehicles.append(
          _local_model.make_vehicle(
              self._options, parking, integrated_local_vehicle_label
          )
      )

      # Create the integrated local route for the delivery round.
      integrated_local_route: cfr_json.ShipmentRoute = {
          "vehicleIndex": integrated_local_vehicle_index,
          "vehicleLabel": integrated_local_vehicle_label,
          # TODO(ondrasej): See if this list conversion is really needed.
          "visits": list(integrated_route_visits),
          "transitions": list(integrated_route_transitions),
      }
      if self._options.use_deprecated_fields:
        integrated_local_route["travelSteps"] = list(
            integrated_route_travel_steps
        )
      is_last_split = refined_split_index == num_refined_route_splits - 1
      remove_delay = None if is_last_split else parking.reload_duration
      cfr_json.update_route_start_end_time_from_transitions(
          integrated_local_route,
          remove_delay_at_end=remove_delay,
      )
      cfr_json.recompute_route_metrics(
          self._integrated_local_model, integrated_local_route
      )
      integrated_local_route_index = len(self._integrated_local_routes)
      self._integrated_local_routes.append(integrated_local_route)

      # Add a global shipment for the local delivery round.
      integrated_global_shipment = _global_model.make_shipment_for_local_route(
          self._model,
          integrated_local_route_index,
          integrated_local_route,
          parking,
          transition_attributes=self._transition_attributes,
      )

      # Update the detour for the integrated global visit for this split. For
      # the first split, we can take the detour of the original split; for all
      # other splits, we need to extend the detour by the duration of the
      # previous splits.
      current_split_start_time = cfr_json.parse_time_string(
          integrated_local_route["vehicleStartTime"]
      )
      if previous_split_start_time is None:
        previous_split_start_time = current_split_start_time
      else:
        integrated_detour += (
            current_split_start_time - previous_split_start_time
        )

      self._add_integrated_global_shipment(
          integrated_global_shipment,
          add_to_visits,
          # In the integrated local model, the vehicle start/end times are
          # exactly the start/end times of the local delivery rounds.
          visit_start_time=integrated_local_route["vehicleStartTime"],
          visit_detour=cfr_json.as_duration_string(integrated_detour),
          # NOTE(ondrasej): As of 2024-05-28, virtual shipments for parking
          # location visits are always delivery-only, and they have exactly one
          # delivery visit request.
          is_pickup=False,
          visit_request_index=0,
      )

  def _integrate_unmodified_local_route(
      self,
      global_shipment: cfr_json.Shipment,
      local_route_index: int,
      add_to_visits: list[cfr_json.Visit] | None,
      visit_start_time: cfr_json.TimeString | None,
      visit_detour: cfr_json.DurationString | None,
  ) -> int:
    """Integrates a local route into the refined models and solutions.

    Takes one local route (delivery round from a parking location) that was not
    touched by the refinement process and integrates it into the refined global
    and local models and their solutions.

    Args:
      global_shipment: The shipment in the global model that represents the
        local route.
      local_route_index: The index of the local route in the base local model.
      add_to_visits: When not none, a delivery visit for the shipment that
        represents the local route in the refined global model is added to this
        list. Must be None when `visit_start_time` is None.
      visit_start_time: The start time of the delivery visit for the new
        shipment in the integrated global model. Must be None when
        `add_to_visits` is None.
      visit_detour: The detour of the delivery visit for the new shipment in the
        integrated global model. Must be None exactly when `add_to_visits` is
        None.

    Returns:
      The index of the global shipment that represents the integrated local
      route.
    """
    # Copy the original local vehicle and route to the integrated local request
    # and response. We preserve the indices of shipments in the local model, so
    # we can copy this route as is, except for the vehicle index in the route
    # object.
    integrated_local_vehicle_index = len(self._integrated_local_vehicles)
    self._integrated_local_vehicles.append(
        self._local_vehicles[local_route_index]
    )
    # NOTE(ondrasej): We're going to change only the vehicle index of the route,
    # a deep copy is not needed and would be inefficient.
    integrated_local_route = copy.copy(self._local_routes[local_route_index])
    integrated_local_route["vehicleIndex"] = integrated_local_vehicle_index
    self._integrated_local_routes.append(integrated_local_route)

    # Copy the virtual shipment for the parking location visit to the integrated
    # global model. Most of the information in the shipment holds, we just need
    # to update the index of the local route in the label.
    integrated_global_shipment = copy.deepcopy(global_shipment)
    _, original_shipment_label = integrated_global_shipment["label"].split(
        " ", maxsplit=1
    )
    integrated_global_shipment["label"] = (
        f"p:{integrated_local_vehicle_index} {original_shipment_label}"
    )
    return self._add_integrated_global_shipment(
        integrated_global_shipment,
        add_to_visits,
        visit_start_time=visit_start_time,
        visit_detour=visit_detour,
        is_pickup=None if add_to_visits is None else False,
        visit_request_index=None if add_to_visits is None else 0,
    )

  def _add_integrated_global_shipment(
      self,
      shipment: cfr_json.Shipment,
      add_to_visits: list[cfr_json.Visit] | None,
      visit_start_time: cfr_json.TimeString | None,
      visit_detour: cfr_json.DurationString | None,
      # NOTE(ondrasej): As of 2024-05-28, virtual shipments for parking location
      # visits are always delivery-only, and they have exactly one delivery
      # visit request.
      visit_request_index: int | None,
      is_pickup: bool | None,
  ) -> int:
    """Adds `shipment` to the integrated request and returns its index.

    Args:
      shipment: The shipment to be added.
      add_to_visits: When not None, the method adds a visit to the newly added
        shipment to this list. Must be None when `visit_start_time` is None.
      visit_start_time: The start time of the visit for the new shipment in the
        integrated global model. Must be None when `add_to_visits` is None.
      visit_detour: The detour of the visit for the new shipment in the
        integrated global model. Must be None exactly when `add_to_visits` is
        None.

    Returns:
      The index of the newly added integrated shipment.

    Raises:
      ValueError: When the shipment has more than one visit request.
    """
    # Visit start time must be provided when creating a visit for the integrated
    # global shipment, even if it is not included in the initial solution.
    assert (
        (visit_start_time is None)
        == (add_to_visits is None)
        == (visit_detour is None)
        == (visit_request_index is None)
        == (is_pickup is None)
    )

    shipment_index = len(self._integrated_global_shipments)
    self._integrated_global_shipments.append(shipment)
    if add_to_visits is not None:
      assert visit_detour is not None
      assert visit_request_index is not None
      assert is_pickup is not None
      visit: cfr_json.Visit = {
          "shipmentIndex": shipment_index,
          "shipmentLabel": shipment.get("label", ""),
          "isPickup": is_pickup,
      }
      if visit_request_index:
        visit["visitRequestIndex"] = visit_request_index
      if is_pickup:
        visit["isPickup"] = is_pickup
      if self._integration_mode != IntegrationMode.VISITS_ONLY:
        visit["startTime"] = visit_start_time
        visit["detour"] = visit_detour
      add_to_visits.append(visit)
    return shipment_index


_REFINEMENT_VEHICLE_LABEL = re.compile(
    r"^global_route:(\d+) start:(\d+) size:(\d+) parking:(.*)$"
)


@dataclasses.dataclass(frozen=True)
class _ConsecutiveParkingLocationVisits:
  """Contains info about a sequence of consecutive visits to a parking location.

  Attributes:
    parking_tag: The parking tag of the parking location being visited.
    global_route: The global route in which the consecutive visit sequences
      appear.
    first_global_visit_index: The index of the first visit to the parking
      location in the global route.
    num_global_visits: The number of visits to the parking location in the
      sequence in the global route.
    local_route_indices: The list of routes in the local model solution that
      represent the sequence of consecutive visits to the parking location. The
      length of `local_route_indices` and `shipment_indices` must be the same
      and the local route index at a give index corresponds to the group of
      shipments at the same index.
    visits: The sequences of visit rounds from the consecutive visits to the
      parking location. Each inner sequence represents one round of visits
      without a return to the parking location.
  """

  parking_tag: str
  global_route: cfr_json.ShipmentRoute
  first_global_visit_index: int
  num_global_visits: int
  local_route_indices: Sequence[int]
  visits: Sequence[Sequence[cfr_json.Visit]]

  @property
  def vehicle_index(self) -> int:
    """The index of the vehicle in the global plan that did the delivery."""
    return self.global_route.get("vehicleIndex", 0)

  @property
  def start_time(self) -> cfr_json.TimeString:
    """Returns the start time of the first visit in the sequence."""
    visits = cfr_json.get_visits(self.global_route)
    first_visit = visits[self.first_global_visit_index]
    return first_visit["startTime"]

  @property
  def end_time(self) -> cfr_json.TimeString:
    """Returns the end time of the last visit in the sequence."""
    # The end time of a visit is not stored directly in the response, so instead
    # we take the start time of the following transition.
    transition_index = self.first_global_visit_index + self.num_global_visits
    transition = self.global_route["transitions"][transition_index]
    return transition["startTime"]


def _get_consecutive_parking_location_visits(
    local_response: cfr_json.OptimizeToursResponse,
    global_route: cfr_json.ShipmentRoute,
) -> Sequence[_ConsecutiveParkingLocationVisits]:
  """Extracts the list of consecutive visits to the same parking location.

  Takes a route in the global model and returns the list of sequences of
  consecutive visits to the same parking location. Only sequences with two or
  more visits are counted. Shipments delivered directly in the global model
  break sequences, but they never form a sequence.

  Args:
    local_response: A solution of the local model.
    global_route: A route in the global model.

  Returns:
    The list of sequences of consecutive visits to the same parking location.
    Each sequence is represented as a tuple (parking_tag, shipment_indices)
    where `parking_tag` is the tag of the parking location to which this
    applies and `shipment_indices` are indices of shipments from the original
    request that are delivered during the visits to the parking location.
  """
  local_routes = cfr_json.get_routes(local_response)
  global_visits = cfr_json.get_visits(global_route)
  global_transitions = cfr_json.get_transitions(global_route)
  consecutive_visits = []
  local_route_indices = []
  sequence_start = None
  previous_parking_tag = None

  def add_sequence_if_needed(sequence_end: int):
    if sequence_start is None:
      return
    assert previous_parking_tag is not None
    if len(local_route_indices) <= 1:
      return

    # Prepare visits for the first solution hint in the local refinement model.
    visits = []
    for local_route_index in local_route_indices:
      local_route = local_routes[local_route_index]
      round_visits = []
      for local_visit in cfr_json.get_visits(local_route):
        round_visits.append({
            "shipmentIndex": _local_model.get_shipment_index_from_visit(
                local_visit
            ),
            "visitRequestIndex": local_visit.get("visitRequestIndex", 0),
            "isPickup": local_visit.get("isPickup", False),
        })
      visits.append(round_visits)

    consecutive_visits.append(
        _ConsecutiveParkingLocationVisits(
            parking_tag=previous_parking_tag,
            local_route_indices=local_route_indices,
            global_route=global_route,
            first_global_visit_index=sequence_start,
            num_global_visits=sequence_end - sequence_start,
            visits=visits,
        )
    )

  for global_visit_index, global_visit in enumerate(global_visits):
    global_visit_label = global_visit["shipmentLabel"]
    visit_type, index = _global_model.parse_shipment_label(global_visit_label)
    if visit_type == "s":
      add_sequence_if_needed(global_visit_index)
      previous_parking_tag = None
      sequence_start = None
      local_route_indices = []
      continue
    assert visit_type == "p"
    transition_in = global_transitions[global_visit_index]
    separated_by_break = transition_in.get("breakDuration", "0s") != "0s"
    separated_by_traffic_infeasibility = transition_in.get(
        "waitDuration", "0s"
    ).startswith("-")
    local_route = local_routes[index]
    parking_tag = _local_model.get_parking_tag_from_route(local_route)
    if (
        parking_tag != previous_parking_tag
        or separated_by_break
        or separated_by_traffic_infeasibility
    ):
      # The sequence ends when the vehicle moves to another parking location or
      # when there is either:
      # - a break scheduled between the two visits. As of 2023-11-06 we do not
      #   support breaks in local routes, and so we need to keep the part before
      #   the break and the part after the break separate.
      # - negative wait time between the two visits. This may happen when live
      #   traffic is used, as a consequence of a traffic infeasiblity. With the
      #   negative wait time, the amount of time available between the start of
      #   the first visit and the end time of the last visit is smaller than the
      #   actual amount of time needed, which would make the initial solution of
      #   the refinement model infeasible.
      add_sequence_if_needed(global_visit_index)
      previous_parking_tag = parking_tag
      sequence_start = global_visit_index
      local_route_indices = []
    local_route_indices.append(index)
  add_sequence_if_needed(len(global_visits))
  return consecutive_visits


def _split_refined_local_route(route: cfr_json.ShipmentRoute) -> Sequence[
    tuple[
        Sequence[cfr_json.Visit],
        Sequence[cfr_json.Transition],
        Sequence[cfr_json.TravelStep] | None,
    ]
]:
  """Extracts delivery rounds from a local refinement model route.

  In the local refinement model, a route may contain more than one visit round.
  Each delivery round consists of three parts:
  1. zero or more pickups of items from the vehicle, to later deliver them,
  2. one or more visits to customer addresses to deliver or pickup items,
  3. zero or more deliveries of items picked up from customers to the vehicle.
  The rounds are separated by a pickup & delivery of a barrier shipment.

  This function finds the barrier shipment visits, and splits the visits,
  transitions, and travel steps of the local refinement route along them into
  the corresponding visit rounds.

  Args:
    route: A route from the local delivery model to be split.

  Returns:
    A sequence of splits of the current route. Each split is returned as a list
    of visits, transitions, and travel steps that belong to the segment. Only
    delivery visits are returned, and the first (resp. last) transition in each
    group is from (resp. to) the parking location.
    Returns None when the input sequence doesn't have travel steps.
  """
  if route.get("breaks", ()):
    raise ValueError("Breaks in the local routes are not supported.")

  visits = cfr_json.get_visits(route)
  if not visits:
    return []

  transitions = cfr_json.get_transitions(route)
  travel_steps = route.get("travelSteps")
  use_deprecated_fields = travel_steps is not None

  visit_index = 0
  num_visits = len(visits)
  splits = []
  while True:
    # Drop barrier visits at the beginning of the sequence. There is no penalty
    # for going from a barrier to another one, and the solver may pack them
    # together instead of skipping them.
    while visit_index < num_visits and (
        visits[visit_index]["shipmentLabel"].startswith("barrier ")
    ):
      visit_index += 1
    if num_visits == visit_index and visits[visit_index - 1].get(
        "isPickup", False
    ):
      # Since all our shipments are delivery only, the last visit on any valid
      # route must be a delivery.
      raise ValueError("The route should not end with a pickup")

    # We already processed all true visits on the route. Returns the results.
    if visit_index == num_visits:
      return splits

    visit_index_begin = visit_index

    # Find the last visit to a customer address in this round.
    while visit_index < num_visits and not visits[visit_index][
        "shipmentLabel"
    ].startswith("barrier "):
      visit_index += 1

    visit_index_end = visit_index
    split_visits = list(visits[visit_index_begin:visit_index_end])
    split_transitions = list(
        transitions[visit_index_begin : visit_index_end + 1]
    )
    split_travel_steps = (
        list(travel_steps[visit_index_begin : visit_index_end + 1])
        if use_deprecated_fields
        else None
    )

    # If the algorithm is correct, there must be at least one split. Otherwise,
    # we'd exit the parent while loop right at the beginning.
    assert split_visits, "Unexpected empty visit list"
    assert split_transitions, "Unexpected empty transition list"
    assert (
        not use_deprecated_fields or split_travel_steps
    ), "Unexpected empty travel step list"

    splits.append((split_visits, split_transitions, split_travel_steps))


def _parse_refinement_vehicle_label(label: str) -> tuple[int, int, int, str]:
  """Parses the label of a vehicle in the local refinement model."""
  match = _REFINEMENT_VEHICLE_LABEL.match(label)
  if not match:
    raise ValueError("Invalid vehicle label in refinement model: {label!r}")
  return int(match[1]), int(match[2]), int(match[3]), match[4]
