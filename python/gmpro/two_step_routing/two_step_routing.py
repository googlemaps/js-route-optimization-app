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
from collections.abc import Collection, Mapping, Sequence, Set
import copy
from typing import TypeAlias

from . import _global_model
from . import _local_model
from . import _merged_model
from . import _parking
from . import _refinement
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
    internal_parameters = self._options.local_internal_parameters
    if internal_parameters is not None:
      request["internalParameters"] = internal_parameters
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
    _shared.override_internal_parameters(
        request,
        self._request.get("internalParameters"),
        self._options.global_internal_parameters,
    )
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
    return _refinement.make_local_refinement_request(
        self._request,
        self._parking_locations,
        self._options,
        local_response,
        global_response,
    )

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
    integration = _refinement.RefinedRouteIntegration(
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
