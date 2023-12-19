# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

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
   its shipments. This shipment has has the coordinates of the parking location
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
import enum
import math
import re
from typing import Any, TypeAlias, TypeVar, cast

from .. import utils
from ..json import cfr_json


@dataclasses.dataclass(frozen=True)
class _ParkingGroupKey:
  """A key used to group shipments into parking groups.

  A parking group is a group of shipments that are delivered from the same
  parking location and that are planned as a group by the global model. The goal
  of this class is that shipments with the same key can be grouped in the local
  and global models.

  Attributes:
    parking_tag: The tag of the parking location from which the shipment is
      delivered.
    start_time: The beginning of the delivery window of the shipment.
    end_time: The end of the delivery window of the shipment.
    allowed_vehicle_indices: The list of vehicle indices that can deliver the
      shipment.
  """

  parking_tag: str | None = None
  start_time: str | None = None
  end_time: str | None = None
  allowed_vehicle_indices: tuple[int, ...] | None = None


@enum.unique
class LocalModelGrouping(utils.EnumForArgparse):
  """Specifies how shipments are grouped in the local model.

  In the local model, the routes are computed for each group separately, i.e.
  shipments that are in different groups according to the selected strategy can
  never appear on the same route.

  Values:
    PARKING_AND_TIME: Shipments are grouped by the assigned parking location and
      by their time windows. Only shipments delivered from the same parking
      location in the same time window can be delivered together.
    PARKING: Shipments are grouped by the assigned parking location. Shipments
      that are delivered from the same parking location but with different time
      windows can still be merged together, as long as the time windows overlap
      or are not too far from each other.
  """

  PARKING_AND_TIME = 0
  PARKING = 1


# The type of parking location tags. Technically, this is a string, but we use
# an alias with a different name to make this apparent from type annotations
# alone.
ParkingTag: TypeAlias = str


@dataclasses.dataclass(frozen=True)
class ParkingLocation:
  """Defines one parking location for the planner.

  Attributes:
    coordinates: The coordinates of the parking location. When delivering a
      shipment using the two-step delivery, the driver first drives to these
      coordinates and then uses a different mode of transport to the final
      delivery location.
    tag: A unique name used for the parking location. Used to match parking
      locations in `ShipmentParkingMap`, and it is also used in the labels of
      the virtual shipments generated for parking locations by the planner.
    travel_mode: The travel mode used in the CFR requests when computing
      optimized routes from the parking lot to the final delivery locations.
      Overrides `Vehicle.travel_mode` for vehicles used in the local route
      optimization plan.
    travel_duration_multiple: The travel duration multiple used when computing
      optimized routes from the parking lot to the final delivery locations.
      Overrides `Vehicle.travel_duration_multiple` for vehicles used in the
      local route optimization plan.
    delivery_load_limits: The load limits applied when delivering shipments from
      the parking location. This is equivalent to Vehicle.loadLimits, and it
      restricts the number of shipments that can be delivered without returning
      to the parking location. When the number of shipments delivered from the
      parking location exceeds this limit, the model will create multiple routes
      starting and ending at the parking location that will appear as multiple
      visits to the parking location in the global model. Since the local model
      allows only very limited cost tuning, we accept only one value per unit,
      and this value is used as the hard limit.
    max_round_duration: The maximal duration of one delivery round from the
      parking location. When None, there is no limit on the maximal duration of
      one round.
    arrival_duration: The time that is spent when a vehicle arrives to the
      parking location. This time is added to the total duration of the route
      whenever the vehicle arrives to the parking location from a different
      location. Can be used to model the time required to enter a parking lot,
      park the vehicle, and pick up the shipments for the first delivery round.
    departure_duration: The time that is spent when a vehicle leaves the parking
      location. This time is added to the total duration of the route whenever
      the vehicle leaves the parking location for a different location. Can be
      used to model the time needed to leave a parking lot.
    reload_duration: The time that is spent at the parking location between two
      consecutive delivery rounds from the parking location. Can be used to
      model the time required to pick up packages from the vehicle before
      another round of pickups.
    arrival_cost: The cost of entering the parking location. The cost is applied
      when a vehicle enters the parking location from another location.
    departure_cost: The cost of leaving the parking location. The cost is
      applied when a vehicle leaves the parking location for another location.
    reload_cost: The cost of visiting the parking location between two
      consecutive delivery rounds from the parking location.
  """

  coordinates: cfr_json.LatLng
  tag: str

  travel_mode: int = 1
  travel_duration_multiple: float = 1.0

  delivery_load_limits: Mapping[str, int] | None = None

  max_round_duration: cfr_json.DurationString | None = None

  arrival_duration: cfr_json.DurationString | None = None
  departure_duration: cfr_json.DurationString | None = None
  reload_duration: cfr_json.DurationString | None = None

  arrival_cost: float = 0.0
  departure_cost: float = 0.0
  reload_cost: float = 0.0


def load_parking_from_json(
    parking_json: Any,
) -> tuple[Sequence[ParkingLocation], Mapping[int, ParkingTag]]:
  """Loads parking location data from a JSON data structure.

  Expects that `parking_json` is a JSON-like data structure that contains the
  definitions of the parking locations and the mapping from shipments to parking
  locations.

  `parking_json` must be a dict that contains the following two keys:
  - "parking_locations":
      Contains the list of parking location definitions. Each element of the
      list is a dict that will be passed as keyword args to the constructor of
      `ParkingLocation`.
  - "parking_for_shipment":
      Contains the mapping from shipment indices to parking location tags for
      shipments that are delivered through a parking location.

  Args:
    parking_json: The JSON data structure that contains the parking data.

  Returns:
    A tuple (parking_locations, parking_for_shipment) where parking_locations
    is the list of parking location definitions, and parking_for_shipment is a
    mapping from shipment indices to parking tags.

  Raises:
    ValueError: When the format of the input file is invalid.
  """
  try:
    parking_for_shipment: Mapping[int, str] = {
        int(shipment): parking
        for shipment, parking in parking_json["parking_for_shipment"].items()
    }
  except KeyError:
    raise ValueError(
        "parking_json doesn't have the key 'parking_for_shipment'"
    ) from None

  parking_location_json = None
  try:
    parking_locations: list[ParkingLocation] = []
    for parking_location_json in parking_json["parking_locations"]:
      parking_locations.append(ParkingLocation(**parking_location_json))
  except KeyError:
    raise ValueError(
        "parking_json doesn't have the key 'parking_locations'"
    ) from None
  except TypeError:
    raise ValueError(
        f"Invalid parking location specification: {parking_location_json!r}"
    ) from None
  return parking_locations, parking_for_shipment


@dataclasses.dataclass
class Options:
  """Options for the two-step planner.

  Attributes:
    local_model_grouping: The grouping strategy used in the local model.
    local_model_vehicle_fixed_cost: The fixed cost of the vehicles in the local
      model. This should be a high number to make the solver use as few vehicles
      as possible.
    local_model_vehicle_per_hour_cost: The per-hour cost of the vehicles in the
      local model. This should be a small positive number so that the solver
      prefers faster routes.
    local_model_vehicle_per_km_cost: The per-kilometer cost of the vehicles in
      the local model. This should be a small positive number so that the solver
      prefers shorter routes.
    min_average_shipments_per_round: The minimal (average) number of shipments
      that is delivered from a parking location without returning to the parking
      location. This is used to estimate the number of vehicles in the plan.
    travel_mode_in_merged_transitions: When True, transition objects in the
      merged response contain also the travel mode and travel duration multiple
      used while computing route for the transition. These fields are extensions
      to the CFR API, and converting a JSON response with these fields to the
      CFR proto may fail.
  """

  local_model_grouping: LocalModelGrouping = LocalModelGrouping.PARKING_AND_TIME

  # TODO(ondrasej): Do we actually need these? Perhaps they can be filled in on
  # the user side.
  local_model_vehicle_fixed_cost: float = 10_000
  local_model_vehicle_per_hour_cost: float = 300
  local_model_vehicle_per_km_cost: float = 60

  min_average_shipments_per_round: int = 1

  travel_mode_in_merged_transitions: bool = False


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
  _parking_groups: Mapping[_ParkingGroupKey, Sequence[int]]
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
      parking_group_key = _parking_delivery_group_key(
          self._options, shipment, parking
      )
      parking_groups[parking_group_key].append(shipment_index)
    self._parking_groups: Mapping[_ParkingGroupKey, Sequence[int]] = (
        parking_groups
    )

    # Collect indices of shipments that are delivered directly.
    self._direct_shipments = set(range(self._num_shipments))
    self._direct_shipments.difference_update(self._parking_for_shipment.keys())

  def make_local_request(self) -> cfr_json.OptimizeToursRequest:
    """Builds the local model request.

    Returns:
      The JSON CFR request for the local model, in the natural Python format.
      The request can be exported to a JSON string via `json.dumps()`.

      Note that, for efficiency reasons, the returned data structure may contain
      parts of the input data strucutres, and it is thus not safe to mutate. If
      mutating it is needed, first make a copy via copy.deepcopy().
    """

    local_shipments: list[cfr_json.Shipment] = []
    local_vehicles: list[cfr_json.Vehicle] = []
    local_model = {
        "globalEndTime": self._model["globalEndTime"],
        "globalStartTime": self._model["globalStartTime"],
        "shipments": local_shipments,
        "vehicles": local_vehicles,
    }
    # Preserve transition attributes from the original request. This might add
    # unused transition attributes to the local model, but it does not disturb
    # the request validation so we keep it for now.
    # TODO(ondrasej): Restrict the preserved transition attributes only to tags
    # that are actually used in the model, to make the model smaller.
    transition_attributes = self._model.get("transitionAttributes")
    if transition_attributes is not None:
      local_model["transitionAttributes"] = transition_attributes

    for parking_key, group_shipment_indices in self._parking_groups.items():
      assert parking_key.parking_tag is not None
      num_shipments = len(group_shipment_indices)
      assert num_shipments > 0

      # Add a virtual vehicle for each delivery round from the parking location
      # to customer sites. We use the minimal average number of shipments per
      # round to compute a bound on the required number of vehicles.
      max_num_rounds = math.ceil(
          num_shipments / self._options.min_average_shipments_per_round
      )
      assert max_num_rounds > 0
      vehicle_label = _make_local_model_vehicle_label(parking_key)
      group_vehicle_indices = []
      for round_index in range(max_num_rounds):
        group_vehicle_indices.append(len(local_vehicles))
        local_vehicles.append(
            _make_local_model_vehicle(
                self._options,
                self._parking_locations[parking_key.parking_tag],
                f"{vehicle_label}/{round_index}",
            )
        )

      # Add shipments from the group. From each shipment, we preserve only the
      # necessary properties for the local plan.
      for shipment_index in group_shipment_indices:
        shipment = self._shipments[shipment_index]
        delivery = shipment["deliveries"][0]
        local_delivery = {
            "arrivalWaypoint": delivery["arrivalWaypoint"],
        }
        if (delivery_duration := delivery.get("duration")) is not None:
          local_delivery["duration"] = delivery_duration
        # Preserve tags in the local shipment.
        tags = delivery.get("tags")
        if tags is not None:
          local_delivery["tags"] = tags
        # Preserve time windows in the local shipment.
        time_windows = delivery.get("timeWindows")
        if time_windows is not None:
          local_delivery["timeWindows"] = time_windows
        local_shipment: cfr_json.Shipment = {
            "deliveries": [local_delivery],
            "label": f"{shipment_index}: {shipment.get('label', '')}",
            "allowedVehicleIndices": group_vehicle_indices,
        }
        # Copy load demands from the original shipment, if present.
        load_demands = shipment.get("loadDemands")
        if load_demands is not None:
          local_shipment["loadDemands"] = load_demands
        local_shipments.append(local_shipment)

    request = {
        "label": self._request.get("label", "") + "/local",
        "model": local_model,
        "parent": self._request.get("parent"),
    }
    self._add_options_from_original_request(request)
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

    transition_attributes = _ParkingTransitionAttributeManager(self._model)

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

      parking_tag = _get_parking_tag_from_local_route(route)
      global_shipments.append(
          _make_global_model_shipment_for_local_route(
              model=self._model,
              local_route_index=route_index,
              local_route=route,
              parking=self._parking_locations[parking_tag],
              transition_attributes=transition_attributes,
          )
      )

    # TODO(ondrasej): Restrict the preserved transition attributes only to tags
    # that are actually used in the model, to make the model smaller.
    global_transition_attributes = list(
        self._model.get("transitionAttributes", ())
    )
    global_transition_attributes.extend(
        transition_attributes.transition_attributes
    )
    if global_transition_attributes:
      global_model["transitionAttributes"] = global_transition_attributes

    request = {
        "label": self._request.get("label", "") + "/global",
        "model": global_model,
        "parent": self._request.get("parent"),
    }
    self._add_options_from_original_request(request)
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

    existing_tags = cfr_json.get_all_visit_tags(self._model)

    def get_non_existent_tag(base: str) -> str:
      tag = base
      index = 0
      while tag in existing_tags:
        index += 1
        tag = f"{base}#{index}"
      return tag

    refinement_vehicles: list[cfr_json.Vehicle] = []
    refinement_shipments: list[cfr_json.Shipment] = []
    refinement_transition_attributes: list[cfr_json.TransitionAttributes] = (
        list(self._model.get("transitionAttributes", ()))
    )

    refinement_model: cfr_json.ShipmentModel = {
        "globalEndTime": self._model["globalEndTime"],
        "globalStartTime": self._model["globalStartTime"],
        "shipments": refinement_shipments,
        "vehicles": refinement_vehicles,
        "transitionAttributes": refinement_transition_attributes,
    }
    refinement_injected_routes: list[cfr_json.ShipmentRoute] = []

    consecutive_visit_sequences: list[_ConsecutiveParkingLocationVisits] = []
    for route in global_routes:
      consecutive_visit_sequences.extend(
          _get_consecutive_parking_location_visits(local_response, route)
      )

    # The list of parking tags for which the model already added reload
    # transition attributes.
    visited_parking_tags = set()

    for consecutive_visit_sequence in consecutive_visit_sequences:
      parking = self._parking_locations[consecutive_visit_sequence.parking_tag]

      parking_waypoint: cfr_json.Waypoint = {
          "location": {"latLng": parking.coordinates}
      }

      refinement_vehicle_index = len(refinement_vehicles)
      refinement_vehicle_label = (
          f"global_route:{consecutive_visit_sequence.vehicle_index}"
          f" start:{consecutive_visit_sequence.first_global_visit_index}"
          f" size:{consecutive_visit_sequence.num_global_visits}"
          f" parking:{consecutive_visit_sequence.parking_tag}"
      )
      refinement_vehicle = _make_local_model_vehicle(
          self._options, parking, refinement_vehicle_label
      )
      # Set up delays for the parking location reload delays. We model the delay
      # using transition attributes, by adding a delay whenever the vehicle
      # does a pickup (from the parking location) after a delivery.
      # These pickup tags need to be different from any ohter tag used in the
      # model. Otherwise, other transition attributes or existing tags might
      # interfere with this modeling.
      parking_pickup_tag = get_non_existent_tag(f"{parking.tag} pickup")
      parking_delivery_tag = get_non_existent_tag(f"{parking.tag} delivery")
      if parking.tag not in visited_parking_tags and (
          parking.reload_duration or parking.reload_cost
      ):
        # Each srcTag/dstTag can be used in the list of transition attributes
        # only once.
        transition_attribute: cfr_json.TransitionAttributes = {
            "srcTag": parking_delivery_tag,
            "dstTag": parking_pickup_tag,
        }
        if parking.reload_duration:
          transition_attribute["delay"] = parking.reload_duration
        if parking.reload_cost:
          transition_attribute["cost"] = parking.reload_cost
        refinement_transition_attributes.append(transition_attribute)

      visited_parking_tags.add(parking.tag)

      # NOTE(ondrasej): We use soft start time windows with steep costs instead
      # of a hard time window here. The time window is exactly the total time of
      # the previous solution, and as such it may be very tight and even slight
      # changes in travel times can make it infeasible.
      # By using soft start/end times, we allow the solver proceed even if this
      # happens; if, in the end, the refined solution is worse than the original
      # we preserve the original solution.
      refinement_vehicle["startTimeWindows"] = [{
          "softStartTime": consecutive_visit_sequence.start_time,
          "costPerHourBeforeSoftStartTime": 10000,
      }]
      refinement_vehicle["endTimeWindows"] = [{
          "softEndTime": consecutive_visit_sequence.end_time,
          "costPerHourAfterSoftEndTime": 10000,
      }]
      refinement_vehicles.append(refinement_vehicle)

      injected_visits: list[cfr_json.Visit] = []
      refinement_injected_route: cfr_json.ShipmentRoute = {
          "vehicleIndex": refinement_vehicle_index,
          "visits": injected_visits,
      }
      refinement_injected_routes.append(refinement_injected_route)

      # The delivery rounds are added in the order in which they appear on the
      # base global route. As a consequence, the injected solution that we build
      # based on the shipments in these rounds is feasible by construction,
      # because both the local and global routes were feasible. The only case
      # where the injected solution may become infeasible is when there is a
      # significant change in travel duration between the base local model and
      # the refinement model; however, given that we do not use live traffic in
      # the local models, this is very unlikely.
      for delivery_round in consecutive_visit_sequence.shipment_indices:
        for offset in range(len(delivery_round)):
          refinement_shipment_index = len(refinement_shipments) + offset
          injected_visits.append({
              "shipmentIndex": refinement_shipment_index,
              "isPickup": True,
          })

        for shipment_index in delivery_round:
          original_shipment = self._shipments[shipment_index]
          # NOTE(ondrasej): This assumes that original_shipment has a single
          # delivery and no pickups.
          refinement_shipment_index = len(refinement_shipments)
          injected_visits.append({
              "shipmentIndex": refinement_shipment_index,
              "isPickup": False,
          })

          refinement_delivery = copy.deepcopy(
              original_shipment["deliveries"][0]
          )
          if "tags" in refinement_delivery:
            refinement_delivery["tags"].append(parking_delivery_tag)
          else:
            refinement_delivery["tags"] = [parking_delivery_tag]
          refinement_shipment: cfr_json.Shipment = {
              "pickups": [
                  {
                      "arrivalWaypoint": parking_waypoint,
                      "tags": [parking.tag, parking_pickup_tag],
                  },
              ],
              "deliveries": [refinement_delivery],
              "allowedVehicleIndices": [refinement_vehicle_index],
              "label": f"{shipment_index}: {original_shipment.get('label')}",
          }
          # Preserve load demands.
          load_demands = original_shipment.get("loadDemands")
          if load_demands is not None:
            refinement_shipment["loadDemands"] = load_demands
          refinement_shipments.append(refinement_shipment)

      # TODO(ondrasej): Also add skipped any shipments delivered from this
      # parking location that were skipped in the original plan. When adding
      # more shipments, we need to make sure that the solution does include the
      # skipped shipments at the expense of exceeding the available time.

    request = {
        "label": self._request.get("label", "") + "/local_refinement",
        "model": refinement_model,
        "injectedFirstSolutionRoutes": refinement_injected_routes,
    }
    self._add_options_from_original_request(request)
    return request

  def integrate_local_refinement(
      self,
      local_request: cfr_json.OptimizeToursRequest,
      local_response: cfr_json.OptimizeToursResponse,
      global_request: cfr_json.OptimizeToursRequest,
      global_response: cfr_json.OptimizeToursResponse,
      refinement_response: cfr_json.OptimizeToursResponse,
  ) -> tuple[
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse,
      cfr_json.OptimizeToursRequest,
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

    The integrated global model needs to be re-solved via CFR to (1) update
    arrival and departure times in the solution, (2) inject road traffic
    information if requested, and (3) use any time saved by the refinement to
    deliver more shipments. The solution of the integrated global model can be
    used together with the solution of the integrated local model to obtain a
    merged request+response via `Planner.merge_local_and_global_result()`.

    Args:
      local_request: A local request created by `self.make_local_request()`.
      local_response: A solution for `local_request`.
      global_request: A global request created by
        `self.make_global_request(local_response)`.
      global_response: A solution for `global_request`.
      refinement_response: A solution for a request created by
        `self.make_local_refinement_request(local_response, global_response)`.

    Returns:
      A triple `(integrated_local_request, integrated_local_response,
      integrated_global_request)` that contains the results of the integration
      as described above.

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
    virtual shipments use the coordinates of the parking location as their
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

    # The shipments in the merged request consist of all shipments in the
    # original request + virtual shipments to handle parking location visits. We
    # preserve the shipment indices from the original request, and add all the
    # virtual shipments at the end.
    merged_shipments: list[cfr_json.Shipment] = copy.copy(self._shipments)
    merged_model: cfr_json.ShipmentModel = {
        # The start and end time remain unchanged.
        "globalStartTime": self._model["globalStartTime"],
        "globalEndTime": self._model["globalEndTime"],
        "shipments": merged_shipments,
        # The vehicles in the merged model are the vehicles from the global
        # model and from the local model. This preserves vehicle indices from
        # the original request.
        "vehicles": self._model["vehicles"],
    }
    merged_request: cfr_json.OptimizeToursRequest = {
        "model": merged_model,
        "label": self._request.get("label", "") + "/merged",
        "parent": self._request.get("parent"),
    }
    merged_routes: list[cfr_json.ShipmentRoute] = []
    merged_result: cfr_json.OptimizeToursResponse = {
        "routes": merged_routes,
    }

    transition_attributes = self._model.get("transitionAttributes")
    if transition_attributes is not None:
      merged_model["transitionAttributes"] = transition_attributes

    local_routes = cfr_json.get_routes(local_response)
    global_routes = cfr_json.get_routes(global_response)
    populate_polylines = self._request.get("populatePolylines", False)

    # We defined merged_transitions, merged_travel_steps, and
    # add_merged_transition outside of the loop to avoid a lint warning (and to
    # avoid redefining the function for each iteration of the loop).
    merged_transitions = None
    merged_travel_steps = None

    def add_merged_transition(
        transition: cfr_json.Transition,
        travel_step: cfr_json.TravelStep,
        at_parking: ParkingLocation | None = None,
        vehicle: cfr_json.Vehicle | None = None,
    ):
      assert (at_parking is None) != (vehicle is None)
      assert merged_transitions is not None
      assert merged_travel_steps is not None
      if self._options.travel_mode_in_merged_transitions:
        if at_parking is not None:
          transition["travelMode"] = at_parking.travel_mode
          transition["travelDurationMultiple"] = (
              at_parking.travel_duration_multiple
          )
        if vehicle is not None:
          transition["travelMode"] = vehicle.get("travelMode", 0)
          transition["travelDurationMultiple"] = vehicle.get(
              "travelDurationMultiple", 1
          )
      merged_transitions.append(transition)
      merged_travel_steps.append(travel_step)

    for global_route_index, global_route in enumerate(global_routes):
      global_visits = cfr_json.get_visits(global_route)
      global_vehicle = self._vehicles[global_route_index]
      if not global_visits:
        # This is an unused vehicle in the global model. We can just copy the
        # route as is.
        merged_routes.append(global_route)
        continue

      global_transitions = global_route["transitions"]
      global_travel_steps = global_route["travelSteps"]
      merged_visits: list[cfr_json.Visit] = []
      merged_transitions: list[cfr_json.Transition] = []
      merged_travel_steps: list[cfr_json.TravelStep] = []
      merged_route: cfr_json.ShipmentRoute = {
          "routeTotalCost": global_route["routeTotalCost"],
          "transitions": merged_transitions,
          "travelSteps": merged_travel_steps,
          "vehicleEndTime": global_route["vehicleEndTime"],
          "vehicleIndex": global_route.get("vehicleIndex", 0),
          "vehicleLabel": global_route["vehicleLabel"],
          "vehicleStartTime": global_route["vehicleStartTime"],
          "visits": merged_visits,
          # TODO(ondrasej): metrics, detailed costs, ...
      }

      # Copy breaks from the global route, if present.
      if (global_breaks := global_route.get("breaks")) is not None:
        merged_route["breaks"] = global_breaks

      # Copy vehicle detour from the global route, if present.
      if (global_detour := global_route.get("vehicleDetour")) is not None:
        merged_route["vehicleDetour"] = global_detour

      merged_routes.append(merged_route)

      def add_parking_location_shipment(
          parking: ParkingLocation, arrival: bool
      ):
        arrival_or_departure = "arrival" if arrival else "departure"
        shipment_index = len(merged_shipments)
        shipment: cfr_json.Shipment = {
            "label": f"{parking.tag} {arrival_or_departure}",
            "deliveries": [{
                "arrivalWaypoint": {
                    "location": {"latLng": parking.coordinates}
                },
                "duration": "0s",
            }],
            # TODO(ondrasej): Vehicle costs and allowed vehicle indices.
        }
        merged_shipments.append(shipment)
        return shipment_index, shipment

      for global_visit_index, global_visit in enumerate(global_visits):
        # The transition from the previous global visit to the current one is
        # always by vehicle.
        add_merged_transition(
            copy.deepcopy(global_transitions[global_visit_index]),
            copy.deepcopy(global_travel_steps[global_visit_index]),
            vehicle=global_vehicle,
        )
        global_visit_label = global_visit["shipmentLabel"]
        global_visit_detour = cfr_json.get_visit_detour(global_visit)
        visit_type, index = _parse_global_shipment_label(global_visit_label)
        match visit_type:
          case "s":
            # This is direct delivery of one of the shipments in the original
            # request. We just copy it and update the shipment index and label
            # accordingly.
            merged_visit = copy.deepcopy(global_visit)
            merged_visit["shipmentIndex"] = index
            merged_visit["shipmentLabel"] = self._shipments[index]["label"]
            merged_visits.append(merged_visit)
          case "p":
            # This is delivery through a parking location. We need to copy parts
            # of the route from the local model solution, and add virtual
            # shipments for entering and leaving the parking location.
            local_route = local_routes[index]
            parking_tag = _get_parking_tag_from_local_route(local_route)
            parking = self._parking_locations[parking_tag]
            arrival_shipment_index, arrival_shipment = (
                add_parking_location_shipment(parking, arrival=True)
            )
            global_start_time = cfr_json.parse_time_string(
                global_visit["startTime"]
            )
            local_start_time = cfr_json.parse_time_string(
                local_route["vehicleStartTime"]
            )
            local_to_global_delta = global_start_time - local_start_time
            merged_visits.append({
                "shipmentIndex": arrival_shipment_index,
                "shipmentLabel": arrival_shipment["label"],
                "startTime": global_visit["startTime"],
                # NOTE(ondrasej): The detour of the parking arrival visit is the
                # difference from a plan where the vehicle drives directly to
                # this parking location.
                "detour": cfr_json.as_duration_string(global_visit_detour),
            })

            # Transfer all visits and transitions from the local route. Update
            # the timestamps as needed.
            local_visits = cfr_json.get_visits(local_route)
            local_transitions = local_route["transitions"]
            local_travel_steps = local_route["travelSteps"]
            for local_visit_index, local_visit in enumerate(local_visits):
              local_transition_in = local_transitions[local_visit_index]
              merged_transition = copy.deepcopy(local_transition_in)
              merged_transition["startTime"] = cfr_json.update_time_string(
                  merged_transition["startTime"], local_to_global_delta
              )
              merged_travel_step = copy.deepcopy(
                  local_travel_steps[local_visit_index]
              )
              add_merged_transition(
                  merged_transition, merged_travel_step, at_parking=parking
              )

              shipment_index = _get_shipment_index_from_local_route_visit(
                  local_visit
              )
              local_visit_detour = cfr_json.get_visit_detour(local_visit)
              merged_visit: cfr_json.Visit = {
                  "shipmentIndex": shipment_index,
                  "shipmentLabel": self._shipments[shipment_index]["label"],
                  "startTime": cfr_json.update_time_string(
                      local_visit["startTime"], local_to_global_delta
                  ),
                  # NOTE(ondrasej): The computation of the detour works with the
                  # assumption that all visits on the local route are for
                  # delivery-only shipments. The sum of the local and global
                  # detours is equivalent to the detour from a route where the
                  # vehicle drivers straight to the current parking location and
                  # where the driver then goes directly to this visit.
                  "detour": cfr_json.as_duration_string(
                      global_visit_detour + local_visit_detour
                  ),
              }
              merged_visits.append(merged_visit)

            # Add a transition back to the parking location.
            transition_to_parking = copy.deepcopy(local_transitions[-1])
            transition_to_parking["startTime"] = cfr_json.update_time_string(
                transition_to_parking["startTime"], local_to_global_delta
            )
            travel_step_to_parking = copy.deepcopy(local_travel_steps[-1])
            add_merged_transition(
                transition_to_parking,
                travel_step_to_parking,
                at_parking=parking,
            )

            # Add a virtual shipment and a visit for the departure from the
            # parking location.
            departure_shipment_index, departure_shipment = (
                add_parking_location_shipment(parking, arrival=False)
            )
            local_route_duration = cfr_json.parse_duration_string(
                local_route["metrics"]["totalDuration"]
            )
            merged_visits.append({
                "shipmentIndex": departure_shipment_index,
                "shipmentLabel": departure_shipment["label"],
                "startTime": cfr_json.update_time_string(
                    local_route["vehicleEndTime"], local_to_global_delta
                ),
                # NOTE(ondrasej): The detour of the parking departure visit is
                # the time spent in the parking (the delta between the arrival
                # to the parking and the departure from the parking).
                "detour": cfr_json.as_duration_string(local_route_duration),
            })
          case _:
            raise ValueError(f"Unexpected visit type: '{visit_type}'")

      # Add the transition back to the depot.
      add_merged_transition(
          copy.deepcopy(global_transitions[-1]),
          copy.deepcopy(global_travel_steps[-1]),
          vehicle=global_vehicle,
      )
      if populate_polylines:
        route_polyline = cfr_json.merge_polylines_from_transitions(
            merged_transitions
        )
        if route_polyline is not None:
          merged_routes[-1]["routePolyline"] = route_polyline

      # Update route metrics to include data from both local and global travel.
      cfr_json.recompute_route_metrics(
          merged_model, merged_routes[-1], check_consistency=check_consistency
      )

    merged_skipped_shipments = []
    for local_skipped_shipment in local_response.get("skippedShipments", ()):
      shipment_index, label = local_skipped_shipment["label"].split(
          ": ", maxsplit=1
      )
      merged_skipped_shipments.append({
          "index": int(shipment_index),
          "label": label,
      })
    for global_skipped_shipment in global_response.get("skippedShipments", ()):
      shipment_type, index = _parse_global_shipment_label(
          global_skipped_shipment["label"]
      )
      match shipment_type:
        case "s":
          # Shipments delivered directly can be added directly to the list.
          merged_skipped_shipments.append({
              "index": int(index),
              "label": self._shipments[index].get("label", ""),
          })
        case "p":
          # For parking locations, we need to add all shipments delivered from
          # that parking location.
          local_route = local_routes[index]
          for visit in cfr_json.get_visits(local_route):
            shipment_index, label = visit["shipmentLabel"].split(
                ": ", maxsplit=1
            )
            merged_skipped_shipments.append({
                "index": int(shipment_index),
                "label": label,
            })

    if merged_skipped_shipments:
      merged_result["skippedShipments"] = merged_skipped_shipments

    return merged_request, merged_result

  def _add_options_from_original_request(
      self, request: cfr_json.OptimizeToursRequest
  ) -> None:
    """Copies solver options from `self._request` to `request`."""
    # Copy solve mode.
    # TODO(ondrasej): Consider always setting searchMode to
    # CONSUME_ALL_AVAILABLE_TIME for the local model. The timeout for the local
    # model is usually very short, and the difference between the two might not
    # be that large.
    search_mode = self._request.get("searchMode")
    if search_mode is not None:
      request["searchMode"] = search_mode

    allow_large_deadlines = self._request.get(
        "allowLargeDeadlineDespiteInterruptionRisk"
    )
    if allow_large_deadlines is not None:
      request["allowLargeDeadlineDespiteInterruptionRisk"] = (
          allow_large_deadlines
      )

    # Copy polyline settings.
    populate_polylines = self._request.get("populatePolylines")
    if populate_polylines is not None:
      request["populatePolylines"] = populate_polylines
    populate_transition_polylines = (
        self._request.get("populateTransitionPolylines") or populate_polylines
    )
    if populate_transition_polylines is not None:
      request["populateTransitionPolylines"] = populate_transition_polylines


def _make_local_model_vehicle(
    options: Options, parking: ParkingLocation, label: str
) -> cfr_json.Vehicle:
  """Creates a vehicle for the local model from a given parking location.

  Args:
    options: The options of the two-step planner.
    parking: The parking location for which the vehicle is created.
    label: The label of the new vehicle.

  Returns:
    The newly created vehicle.
  """
  parking_waypoint: cfr_json.Waypoint = {
      "location": {"latLng": parking.coordinates}
  }
  vehicle: cfr_json.Vehicle = {
      "label": label,
      # Start and end waypoints.
      "endWaypoint": parking_waypoint,
      "startWaypoint": parking_waypoint,
      # Limits and travel speed.
      "travelDurationMultiple": parking.travel_duration_multiple,
      "travelMode": parking.travel_mode,
      # Costs.
      "fixedCost": options.local_model_vehicle_fixed_cost,
      "costPerHour": options.local_model_vehicle_per_hour_cost,
      "costPerKilometer": options.local_model_vehicle_per_km_cost,
      # Transition attribute tags.
      "startTags": [parking.tag],
      "endTags": [parking.tag],
  }
  if parking.max_round_duration is not None:
    vehicle["routeDurationLimit"] = {
        "maxDuration": parking.max_round_duration,
    }
  if parking.delivery_load_limits is not None:
    vehicle["loadLimits"] = {
        unit: {"maxLoad": str(max_load)}
        for unit, max_load in parking.delivery_load_limits.items()
    }
  return vehicle


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

    if shipment.get("pickups"):
      append_shipment_error(
          "Shipments delivered via parking must not have any pickups",
          shipment_index,
          label,
      )

    deliveries = shipment.get("deliveries", ())
    if len(deliveries) != 1:
      append_shipment_error(
          "Shipments delivered via parking must have exactly one delivery"
          " visit request",
          shipment_index,
          label,
      )
      continue

    delivery = deliveries[0]
    time_windows = delivery.get("timeWindows", ())
    if len(time_windows) > 1:
      append_shipment_error(
          "Shipments delivered via parking must have at most one delivery time"
          " window",
          shipment_index,
          label,
      )

  if errors:
    return errors
  return None


def _shipment_label_counts_in_global_route(
    route: cfr_json.ShipmentRoute,
) -> Mapping[str, int]:
  r"""Counts base shipment labels in the visits on a global model route.

  Assumes that the labels of the shipments on the route follow the format of
  shipment labels in the global model "[ds]:\d+ (?<labels>.*)" where the
  group <labels> contains a comma-separated list of shipment labels from the
  base model.

  Note that when shipment labels in the base model contain commas, the counts
  might not match but the results will be comparable in terms of the comparisons
  done in `_assert_global_model_routes_handle_same_shipments()`.

  Args:
    route: A route from the global model.

  Returns:
    A mapping from shipment labels in the base model to the count of their
    appearances on the route.
  """
  label_count = collections.defaultdict(int)
  for visit in cfr_json.get_visits(route):
    global_shipment_label = visit["shipmentLabel"]
    _, base_shipment_labels = global_shipment_label.split(" ", maxsplit=1)
    for label in base_shipment_labels.split(","):
      label_count[label] += 1
  return label_count


def _routes_by_unique_vehicle_indices(
    response: cfr_json.OptimizeToursResponse,
) -> Mapping[int, cfr_json.ShipmentRoute]:
  routes = {}
  for route in cfr_json.get_routes(response):
    vehicle = route.get("vehicleIndex", 0)
    assert vehicle not in routes, f"Duplicate vehicle index {vehicle}"
    routes[vehicle] = route
  return routes


def _assert_global_model_routes_handle_same_shipments(
    response_a: cfr_json.OptimizeToursResponse,
    response_b: cfr_json.OptimizeToursResponse,
) -> None:
  """Checks that routes in `response_a` and `response_b` serve same shipments.

  Assumes that `response_a` and `response_b` are two different solutions of
  equivalent global models in a two-step routing model. They may be either two
  different solutions of the same global model, or the solution of a base global
  model and an integrated global model.

  Checks that the routes in `response_a` and `response_b` are similar in the
  sense that:
  - both responses have the same number of routes,
  - the shipment labels on the routes are the same. This is done by extracting
    the "original shipment labels" part of the the shipment labels on both
    routes and checking that their numbers are the same.

  Args:
    response_a: The first response to compare.
    response_b: The second response to compare.

  Raises:
    AssertionError: When the routes are not equivalent.
  """
  routes_a = _routes_by_unique_vehicle_indices(response_a)
  routes_b = _routes_by_unique_vehicle_indices(response_b)

  assert len(routes_a) == len(routes_b), (
      f"The number of routes is different. Found {len(routes_a)} routes in"
      f" response_a, {len(routes_b)} in response_b."
  )
  vehicle_indices_a = set(routes_a)
  vehicle_indices_b = set(routes_b)
  assert vehicle_indices_a == vehicle_indices_b, (
      "The vehicle indices of the routes are different. Found"
      f" {vehicle_indices_a} in response_a and {vehicle_indices_b} in"
      " response_b."
  )

  for vehicle_index in vehicle_indices_a:
    route_a = routes_a[vehicle_index]
    route_b = routes_b[vehicle_index]
    label_count_a = _shipment_label_counts_in_global_route(route_a)
    label_count_b = _shipment_label_counts_in_global_route(route_b)
    assert label_count_a == label_count_b, (
        f"Shipment label counts for vehicle {vehicle_index} are different:\n"
        f"response_a: {label_count_a},\n"
        f"response_b: {label_count_b}"
    )


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
    self._integrated_global_request: cfr_json.OptimizeToursRequest | None = None

    self._transition_attributes = _ParkingTransitionAttributeManager(
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
        _make_local_shipment_from_shipment_map(
            cfr_json.get_shipments(local_model)
        )
    )

  def integrate(
      self,
  ) -> tuple[
      cfr_json.OptimizeToursRequest,
      cfr_json.OptimizeToursResponse,
      cfr_json.OptimizeToursRequest,
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
      A triple (local_request, local_response, global_request) where
      local_request and local_response contain the integrated local model and
      its solution, and global_request contains a global model adapted to the
      integrated local model and injected routes based on the solution of the
      base global model.
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
      self._integrated_global_request["injectedFirstSolutionRoutes"] = (
          self._integrated_global_routes
      )
      consider_road_traffic = self._request.get("considerRoadTraffic")
      if consider_road_traffic is not None:
        self._integrated_global_request["considerRoadTraffic"] = (
            consider_road_traffic
        )

      _assert_global_model_routes_handle_same_shipments(
          self._global_response, {"routes": self._integrated_global_routes}
      )

    assert self._integrated_local_request is not None
    assert self._integrated_local_response is not None
    assert self._integrated_global_request is not None
    return (
        self._integrated_local_request,
        self._integrated_local_response,
        self._integrated_global_request,
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
      visit_type, index = _parse_global_shipment_label(
          global_skipped_shipment["label"]
      )
      match visit_type:
        case "s":
          # The visit is for a shipment delivered directly. It refers only to
          # the shipment in the base model which did not change with
          # integration, so we can reuse it in the integrate model without any
          # changes.
          self._add_integrated_global_shipment(
              global_shipment, add_to_visits=None
          )
        case "p":
          # The visit is for a round of deliveries from a parking location. It
          # was skipped in the base global model, and so it could not have been
          # part of a refinement.
          self._integrate_unmodified_local_route(
              global_shipment, local_route_index=index, add_to_visits=None
          )
        case _:
          raise ValueError("Unexpected global visit type: {visit_type!r}")

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
      refinements: Mapping[int, tuple[int, cfr_json.ShipmentRoute]] = (
          self._refinements_for_global_route.get(
              global_route_index, no_refinements
          )
      )

      integrated_global_visits: list[cfr_json.Visit] = []
      self._integrated_global_routes.append({
          "vehicleIndex": global_route_index,
          "visits": integrated_global_visits,
      })

      global_visits = cfr_json.get_visits(global_route)
      num_visits_to_skip = 0
      for global_visit_index, global_visit in enumerate(global_visits):
        if num_visits_to_skip > 0:
          num_visits_to_skip -= 1
          continue
        global_shipment_label = global_visit.get("shipmentLabel", "")
        global_shipment_index = global_visit.get("shipmentIndex", 0)
        global_shipment = self._global_shipments[global_shipment_index]
        visit_type, index = _parse_global_shipment_label(global_shipment_label)
        visit_refinement = refinements.get(global_visit_index)
        if visit_refinement is not None:
          if visit_type != "p":
            raise ValueError(
                "Expected a parking location visit, found"
                f" {global_shipment_label!r}"
            )
          num_refined_visits, refined_local_route = visit_refinement
          self._integrate_refined_local_route(
              refined_local_route, add_to_visits=integrated_global_visits
          )
          # Skip all following visits that were part of the refined route that
          # we just integrated.
          num_visits_to_skip = num_refined_visits - 1
        else:
          # This global visit was not part of the refinement, we just need to
          # carry over the shipment or local delivery round from the base model.
          match visit_type:
            case "s":
              self._add_integrated_global_shipment(
                  global_shipment, add_to_visits=integrated_global_visits
              )
            case "p":
              self._integrate_unmodified_local_route(
                  global_shipment,
                  local_route_index=index,
                  add_to_visits=integrated_global_visits,
              )
            case _:
              raise ValueError(f"Unexpected global visit type: {visit_type!r}")
      assert num_visits_to_skip == 0

  def _integrate_refined_local_route(
      self,
      refined_local_route: cfr_json.ShipmentRoute,
      add_to_visits: list[cfr_json.Visit] | None,
  ) -> None:
    """Integrates a refined local route to the refined models and solutions.

    Splits the refined local route into delivery rounds, and creates a new
    vehicle and route in the integrated local model and solution. Adds virtual
    shipments and visits to the integrated global model and initial solution.

    Args:
      refined_local_route: The route from the refinement local model that
        represents the new delivery rounds for the parking location.
      add_to_visits: When not None, visits for the shipments that represent the
        new delivery rounds in the integrated global model are added to this
        list.
    """
    refined_route_splits = _split_refined_local_route(refined_local_route)
    num_refined_route_splits = len(refined_route_splits)
    refined_route_label = refined_local_route.get("vehicleLabel", "")
    assert refined_route_splits, "Refined local routes are never empty."

    _, _, _, parking_tag = _parse_refinement_vehicle_label(refined_route_label)
    parking = self._parking_locations[parking_tag]

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

      # Update shipment indices in the integrated local route.
      for visit in integrated_route_visits:
        # We first extract the index of the shipment in the original model and
        # then map it to a shipment index in the base local model. Since the
        # visits are already a local copy, we can safely update it in place.
        shipment_index = _get_shipment_index_from_local_route_visit(visit)
        visit["shipmentIndex"] = self._local_shipment_for_original_shipment[
            shipment_index
        ]

      # Add a new vehicle for the delivery round to the integrated local model.
      integrated_local_vehicle_index = len(self._integrated_local_vehicles)
      integrated_local_vehicle_label = (
          f"{parking_tag} [refinement]/{refined_split_index}"
      )
      self._integrated_local_vehicles.append(
          _make_local_model_vehicle(
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
          "travelSteps": list(integrated_route_travel_steps),
      }
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
      integrated_global_shipment = _make_global_model_shipment_for_local_route(
          self._model,
          integrated_local_route_index,
          integrated_local_route,
          parking,
          transition_attributes=self._transition_attributes,
      )
      self._add_integrated_global_shipment(
          integrated_global_shipment, add_to_visits
      )

  def _integrate_unmodified_local_route(
      self,
      global_shipment: cfr_json.Shipment,
      local_route_index: int,
      add_to_visits: list[cfr_json.Visit] | None,
  ) -> None:
    """Integrates a local route into the refined models and solutions.

    Takes one local route (delivery round from a parking location) that was not
    touched by the refinement process and integrates it into the refined global
    and local models and their solutions.

    Args:
      global_shipment: The shipment in the global model that represents the
        local route.
      local_route_index: The index of the local route in the base local model.
      add_to_visits: When not none, a visit for the shipment that represents the
        local route in the refined global model is added to this list.
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
    self._add_integrated_global_shipment(
        integrated_global_shipment, add_to_visits
    )

  def _add_integrated_global_shipment(
      self,
      shipment: cfr_json.Shipment,
      add_to_visits: list[cfr_json.Visit] | None,
  ) -> int:
    """Adds `shipment` to the integrated request and returns its index.

    Args:
      shipment: The shipment to be added.
      add_to_visits: When not None, the method adds a delivery visit to the
        newly added shipment to this list.

    Returns:
      The index of the newly added integrated shipment.
    """
    # NOTE(ondrasej): This method works only for shipments with a single
    # delivery option and no pickups.
    assert len(shipment["deliveries"]) == 1
    assert not shipment.get("pickups")

    shipment_index = len(self._integrated_global_shipments)
    self._integrated_global_shipments.append(shipment)
    if add_to_visits is not None:
      add_to_visits.append({
          "shipmentIndex": shipment_index,
          "shipmentLabel": shipment.get("label", ""),
          "isPickup": False,
      })
    return shipment_index


class _ParkingTransitionAttributeManager:
  """Manages transition attributes for parking locations in the global model."""

  def __init__(self, model: cfr_json.ShipmentModel):
    """Initializes the transition attribute manager."""
    self._existing_tags = cfr_json.get_all_visit_tags(model)
    self._cached_parking_transition_tags = {}
    self._transition_attributes = []

  @property
  def transition_attributes(self) -> list[cfr_json.TransitionAttributes]:
    """Returns transition attributes created by the manager."""
    return self._transition_attributes

  def get_or_create_if_needed(self, parking: ParkingLocation) -> str | None:
    """Creates parking transition attribute for a parking location if needed.

    When the parking location uses arrival/departure/reload costs or delays,
    creates transition attributes for the parking location that implement them.
    Does nothing when the parking location doesn't use any of these features.

    Can be safely called multiple times for the same parking location.

    Args:
      parking: The parking location for which the transition attributes are
        created.

    Returns:
      When the parking location has features that reuqire transition attributes,
      returns a unique tag for visits to the parking location. Otherwise,
      returns None.
    """
    # `None` is a valid value in self._cached_parking_transition_tags, so a
    # special sentinel object is needed.
    sentinel = object()
    cached_tag = self._cached_parking_transition_tags.get(parking.tag, sentinel)
    if cached_tag is not sentinel:
      return cast(str | None, cached_tag)

    parking_transition_tag = self._get_non_existent_tag(
        f"parking: {parking.tag}"
    )

    added_transitions = self._add_transition_attribute_if_needed(
        delay=parking.arrival_duration,
        cost=parking.arrival_cost,
        excluded_src_tag=parking_transition_tag,
        dst_tag=parking_transition_tag,
    )
    added_transitions |= self._add_transition_attribute_if_needed(
        delay=parking.departure_duration,
        cost=parking.departure_cost,
        src_tag=parking_transition_tag,
        excluded_dst_tag=parking_transition_tag,
    )
    added_transitions |= self._add_transition_attribute_if_needed(
        delay=parking.reload_duration,
        cost=parking.reload_cost,
        src_tag=parking_transition_tag,
        dst_tag=parking_transition_tag,
    )
    if not added_transitions:
      parking_transition_tag = None

    self._cached_parking_transition_tags[parking.tag] = parking_transition_tag
    return parking_transition_tag

  def _add_transition_attribute_if_needed(
      self,
      *,
      delay: cfr_json.DurationString | None,
      cost: float,
      src_tag: str | None = None,
      excluded_src_tag: str | None = None,
      dst_tag: str | None = None,
      excluded_dst_tag: str | None = None,
  ) -> bool:
    """Adds a new transition attributes objects when delay or cost are used."""
    if delay is None and cost == 0:
      return False
    if cost < 0:
      raise ValueError("Cost must be non-negative.")
    if (src_tag is None) == (excluded_src_tag is None):
      raise ValueError(
          "Exactly one of `src_tag` and `excluded_src_tag` must be provided."
      )
    if (dst_tag is None) == (excluded_dst_tag is None):
      raise ValueError(
          "Exactly one of `dst_tag` and `excluded_dst_tag` must be provided."
      )
    transition_attributes: cfr_json.TransitionAttributes = {}
    if delay is not None:
      transition_attributes["delay"] = delay
    if cost > 0:
      transition_attributes["cost"] = cost
    if src_tag is not None:
      transition_attributes["srcTag"] = src_tag
    if excluded_src_tag is not None:
      transition_attributes["excludedSrcTag"] = excluded_src_tag
    if dst_tag is not None:
      transition_attributes["dstTag"] = dst_tag
    if excluded_dst_tag is not None:
      transition_attributes["excludedDstTag"] = excluded_dst_tag
    self._transition_attributes.append(transition_attributes)
    return True

  def _get_non_existent_tag(self, base: str) -> str:
    if base not in self._existing_tags:
      return base
    index = 1
    while True:
      tag = f"{base}#{index}"
      if tag not in self._existing_tags:
        return tag
      index += 1


def _make_global_model_shipment_for_local_route(
    model: cfr_json.ShipmentModel,
    local_route_index: int,
    local_route: cfr_json.ShipmentRoute,
    parking: ParkingLocation,
    transition_attributes: _ParkingTransitionAttributeManager,
) -> cfr_json.Shipment:
  """Creates a virtual shipment in the global model for a local delivery route.

  Args:
    model: The original model.
    local_route_index: The index of the local delivery route in the local
      response.
    local_route: The local delivery route.
    parking: The parking location for the local delivery route.
    transition_attributes: The parking transition attribute manager used for the
      construction of the global model.

  Returns:
    The newly created global shipment.
  """
  visits = cfr_json.get_visits(local_route)

  # Get all shipments from the original model that are delivered in this
  # parking location route.
  shipment_indices = _get_shipment_indices_from_local_route_visits(visits)
  shipments = tuple(
      model["shipments"][shipment_index] for shipment_index in shipment_indices
  )
  assert shipments

  global_delivery_tags: list[str] = [parking.tag]
  global_delivery: cfr_json.VisitRequest = {
      # We use the coordinates of the parking location for the waypoint.
      "arrivalWaypoint": {"location": {"latLng": parking.coordinates}},
      # The duration of the delivery at the parking location is the total
      # duration of the local route for this round.
      "duration": local_route["metrics"]["totalDuration"],
      "tags": global_delivery_tags,
  }
  global_time_windows = _get_local_model_route_start_time_windows(
      model, local_route
  )
  if global_time_windows is not None:
    global_delivery["timeWindows"] = global_time_windows

  # Add arrival/departure/reload costs and delays if needed.
  parking_transition_tag = transition_attributes.get_or_create_if_needed(
      parking
  )
  if parking_transition_tag is not None:
    global_delivery_tags.append(parking_transition_tag)

  shipment_labels = ",".join(shipment["label"] for shipment in shipments)
  global_shipment: cfr_json.Shipment = {
      "label": f"p:{local_route_index} {shipment_labels}",
      # We use the total duration of the parking location route as the
      # duration of this virtual shipment.
      "deliveries": [global_delivery],
  }
  # The load demands of the virtual shipment is the sum of the demands of
  # all individual shipments delivered on the local route.
  load_demands = cfr_json.combined_load_demands(shipments)
  if load_demands:
    global_shipment["loadDemands"] = load_demands

  # Add the penalty cost of the virtual shipment if needed.
  penalty_cost = cfr_json.combined_penalty_cost(shipments)
  if penalty_cost is not None:
    global_shipment["penaltyCost"] = penalty_cost

  allowed_vehicle_indices = cfr_json.combined_allowed_vehicle_indices(shipments)
  if allowed_vehicle_indices:
    global_shipment["allowedVehicleIndices"] = allowed_vehicle_indices

  costs_per_vehicle_and_indices = cfr_json.combined_costs_per_vehicle(shipments)
  if costs_per_vehicle_and_indices is not None:
    vehicle_indices, costs = costs_per_vehicle_and_indices
    global_shipment["costsPerVehicle"] = costs
    global_shipment["costsPerVehicleIndices"] = vehicle_indices

  return global_shipment


_GLOBAL_SHIPEMNT_LABEL = re.compile(r"^([ps]):(\d+) .*")
_REFINEMENT_VEHICLE_LABEL = re.compile(
    r"^global_route:(\d+) start:(\d+) size:(\d+) parking:(.*)$"
)


T = TypeVar("T")


def _interval_intersection(
    intervals_a: Sequence[tuple[T, T]], intervals_b: Sequence[tuple[T, T]]
) -> Sequence[tuple[T, T]]:
  """Computes intersection of two sets of intervals.

  Each element of the input sequences is an interval represented as a tuple
  [start, end] (inclusive on both sides), and that the intervals in each of the
  inputs are disjoint (they may not even touch) and sorted by their start value.

  The function works for any value type that supports comparison and ordering.

  Args:
    intervals_a: The first input.
    intervals_b: The second input.

  Returns:
    The intersection of the two inputs, represented as a sequence of disjoint
    intervals ordered by their start value. Returns an empty sequence when the
    intersection is empty.
  """
  out_intervals = []
  a_iter = iter(intervals_a)
  b_iter = iter(intervals_b)

  try:
    a_start, a_end = next(a_iter)
    b_start, b_end = next(b_iter)
    while True:
      while a_end < b_start:
        # Skip all intervals from a_iter that do not overlap the current
        # interval from b.
        a_start, a_end = next(a_iter)
      while b_end < a_start:
        # Skip all intervals from b_iter that do not overlap the current
        # interval from a.
        b_start, b_end = next(b_iter)
      if a_end >= b_start and b_end >= a_start:
        # We stopped because we have an overlap here. Compute the intersection
        # of the two intervals and fetch a new interval from the input whose
        # interval ends at the end of the intersection interval.
        out_start = max(a_start, b_start)
        out_end = min(b_end, a_end)
        out_intervals.append((out_start, out_end))
        if out_end == a_end:
          a_start, a_end = next(a_iter)
        if out_end == b_end:
          b_start, b_end = next(b_iter)
  except StopIteration:
    pass
  return out_intervals


def _get_local_model_route_start_time_windows(
    model: cfr_json.ShipmentModel,
    route: cfr_json.ShipmentRoute,
) -> list[cfr_json.TimeWindow] | None:
  """Computes global time windows for starting a local route.

  Computes a list of time windows for the start of the local route that are
  compatible with time windows of all visits on the local route. The output list
  contains only hard time windows, soft time windows are not taken into account
  by this algorithm. Returns None when the route can start at any time within
  the global start/end time interval of the model.

  The function always returns either None to signal that any start time is
  possible or returns at least one time window that contains the original
  vehicle start time of the route.

  Args:
    model: The model in which the route is computed.
    route: The local route for which the time window is computed.

  Returns:
    A list of time windows for the start of the route. The time windows account
    for the time needed to walk to the first visit, and the time needed to
    return from the last visit back to the parking. When the local route can
    start at any time within the global start/end interval of the model, returns
    None.
  """
  visits = cfr_json.get_visits(route)
  if not visits:
    return None

  global_start_time = cfr_json.get_global_start_time(model)
  global_end_time = cfr_json.get_global_end_time(model)

  route_start_time = cfr_json.parse_time_string(route["vehicleStartTime"])
  shipments = cfr_json.get_shipments(model)

  # The start time window for the route is computed as the intersection of
  # "route start time windows" of all visits in the route. A "route start time
  # window" of a visit is the time window of the visit, shifted by the time
  # since the start of the route needed to get to the vist (including all visits
  # that precede it on the route).
  # By starting the route in the intersection of these time windows, we
  # guarantee that each visit will start within its own time time window.

  # Start by allowing any start time for the local route.
  overall_route_start_time_intervals = ((global_start_time, global_end_time),)

  for visit in visits:
    # NOTE(ondrasej): We can't use `visit["shipmentIndex"]` to get the shipment;
    # `visit` is from the local model, while `model` is the global model. To
    # get the expected results, we need to use the shipment label from the visit
    # to get the shipment index in the base model.
    shipment_label = visit.get("shipmentLabel")
    shipment_index = _get_shipment_index_from_local_label(shipment_label)
    shipment = shipments[shipment_index]
    deliveries = shipment.get("deliveries", ())
    if len(deliveries) != 1:
      raise ValueError(
          "Only shipments with one delivery request are supported."
      )

    time_windows = deliveries[0].get("timeWindows")
    if not time_windows:
      # This shipment can be delivered at any time. No refinement of the route
      # delivery time interval is needed.
      continue

    # The time needed to get to this visit since the start of the local route.
    # This includes both the time needed for transit and the time needed to
    # handle any shipments that come on the route before this one.
    # TODO(ondrasej): Verify that the translation of the time windows is correct
    # in the presence of wait times.
    visit_start_time = cfr_json.parse_time_string(visit["startTime"])
    visit_start_offset = visit_start_time - route_start_time

    # Refine `route_start_time` using the route start times computed from time
    # windows of all visits on the route.
    shipment_route_start_time_intervals = []
    for time_window in time_windows:
      time_window_start = time_window.get("startTime")
      time_window_end = time_window.get("endTime")

      # Compute the start time window for this shipment, adjusted by the time
      # needed to process all shipments that come before this one and to arrive
      # to the delivery location.
      # All times are clamped by the (global_start_time, global_end_time)
      # interval that we start with, so there's no need to worry about clamping
      # any times for an individual time window.
      shipment_route_start_time_intervals.append((
          cfr_json.parse_time_string(time_window_start) - visit_start_offset
          if time_window_start is not None
          else global_start_time,
          cfr_json.parse_time_string(time_window_end) - visit_start_offset
          if time_window_end is not None
          else global_end_time,
      ))

    overall_route_start_time_intervals = _interval_intersection(
        overall_route_start_time_intervals, shipment_route_start_time_intervals
    )

  if not overall_route_start_time_intervals:
    raise ValueError(
        f"The shipments in local route {route['vehicleLabel']!r} have"
        " incompatible time windows. Arrived at an empty time window"
        " intersection."
    )

  # Transform intervals into time window data structures.
  global_time_windows = []
  for start, end in overall_route_start_time_intervals:
    global_time_window = {}
    if start > global_start_time:
      global_time_window["startTime"] = cfr_json.as_time_string(start)
    if end < global_end_time:
      global_time_window["endTime"] = cfr_json.as_time_string(end)
    if global_time_window:
      global_time_windows.append(global_time_window)

  if not global_time_windows:
    # We might have dropped a single time window that spans from the global
    # start time to the global end time, and that is OK.
    return None
  return global_time_windows


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
    shipment_indices: The shipments delivered in this sequence of consecutive
      visits to the parking location. This is a list of lists of shipment
      indices; each inner list corresponds to one delivery round from the
      parking location.
  """

  parking_tag: str
  global_route: cfr_json.ShipmentRoute
  first_global_visit_index: int
  num_global_visits: int
  local_route_indices: Sequence[int]
  shipment_indices: Sequence[Sequence[int]]

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

    # Collect the indices of shipments from the original request that are
    # handled during these visits.
    shipment_indices = []
    for local_route_index in local_route_indices:
      local_route = local_routes[local_route_index]
      local_visits = cfr_json.get_visits(local_route)
      shipment_indices.append([])
      for local_visit in local_visits:
        shipment_indices[-1].append(
            _get_shipment_index_from_local_route_visit(local_visit)
        )

    consecutive_visits.append(
        _ConsecutiveParkingLocationVisits(
            parking_tag=previous_parking_tag,
            local_route_indices=local_route_indices,
            global_route=global_route,
            first_global_visit_index=sequence_start,
            num_global_visits=sequence_end - sequence_start,
            shipment_indices=shipment_indices,
        )
    )

  for global_visit_index, global_visit in enumerate(global_visits):
    global_visit_label = global_visit["shipmentLabel"]
    visit_type, index = _parse_global_shipment_label(global_visit_label)
    if visit_type == "s":
      add_sequence_if_needed(global_visit_index)
      previous_parking_tag = None
      sequence_start = None
      local_route_indices = []
      continue
    assert visit_type == "p"
    transition_in = global_transitions[global_visit_index]
    break_duration = transition_in.get("breakDuration", "0s")
    local_route = local_routes[index]
    parking_tag = _get_parking_tag_from_local_route(local_route)
    if parking_tag != previous_parking_tag or break_duration != "0s":
      # The sequence ends when the vehicle moves to another parking location or
      # when there is a break scheduled between the two visits. As of 2023-11-06
      # we do not support breaks in local routes, and so we need to keep the
      # part before the break and the part after the break separate.
      add_sequence_if_needed(global_visit_index)
      previous_parking_tag = parking_tag
      sequence_start = global_visit_index
      local_route_indices = []
    local_route_indices.append(index)
  add_sequence_if_needed(len(global_visits))
  return consecutive_visits


def _split_refined_local_route(
    route: cfr_json.ShipmentRoute,
) -> Sequence[
    tuple[
        Sequence[cfr_json.Visit],
        Sequence[cfr_json.Transition],
        Sequence[cfr_json.TravelStep],
    ]
]:
  """Extracts delivery rounds from a local refinement model route.

  In the local refinement model, a route may contain more than one delivery
  round. Each delivery round consists of a sequence of delivery visits, and the
  rounds in a route are separated by sequences of pickup visits (at the address
  of the parking location). This function returns the visits, transitions, and
  travel steps corresponding to each of the delivery rounds.

  Args:
    route: A route from the local delivery model to be split.

  Returns:
    A sequence of splits of the current route. Each split is returned as a list
    of visits, transitions, and travel steps that belong to the segment. Only
    delivery visits are returned, and the first (resp. last) transition in each
    group is from (resp. to) the parking location.
  """
  if route.get("breaks", ()):
    raise ValueError("Breaks in the local routes are not supported.")
  # NOTE(ondrasej): This code assumes that all shipments are delivery-only and
  # that all pickup visits are at the parking location address and they were
  # added by the local refinement model to make the driver return to the parking
  # at the end of each delivery round.
  splits = []

  visits = iter(enumerate(cfr_json.get_visits(route)))
  transitions = route.get("transitions", ())
  travel_steps = route.get("travelSteps", ())
  indexed_visit = next(visits, None)
  visit_index = None
  while True:
    # Drop pickup visits at the beginning of the sequence.
    if indexed_visit is None:
      # We already processed all visits on the route. Returns the results.
      return splits
    while indexed_visit is not None and indexed_visit[1].get("isPickup", False):
      indexed_visit = next(visits, None)
    if indexed_visit is None:
      # Since all our shipments are delivery only, the last visit on any valid
      # route must be a delivery.
      raise ValueError("The route should not end with a pickup")

    split_visits = []
    split_transitions = []
    split_travel_steps = []

    # Extract visits and transitions from the current split.
    while indexed_visit is not None:
      visit_index, visit = indexed_visit
      if visit.get("isPickup", False):
        # The current round has ended. Add a new transition and move to the next
        # one.
        break
      split_visits.append(visit)
      split_transitions.append(transitions[visit_index])
      split_travel_steps.append(travel_steps[visit_index])
      indexed_visit = next(visits, None)

    # Add the transition back to the parking location. We can just add the next
    # transition - it will be either a return to the vehicle end location or a
    # transition to a shipment pickup, but in both cases it will be transition
    # to the parking location.
    if indexed_visit is None:
      visit_index += 1
    split_transitions.append(transitions[visit_index])
    split_travel_steps.append(travel_steps[visit_index])

    # If the algorithm is correct, there must be at least one split. Otherwise,
    # we'd exit the parent while loop right at the beginning.
    assert split_visits, "Unexpected empty visit list"
    assert split_transitions, "Unexpected empty transition list"
    assert split_travel_steps, "Unexpected empty travel step list"

    splits.append((split_visits, split_transitions, split_travel_steps))


def _parse_refinement_vehicle_label(label: str) -> tuple[int, int, int, str]:
  """Parses the label of a vehicle in the local refinement model."""
  match = _REFINEMENT_VEHICLE_LABEL.match(label)
  if not match:
    raise ValueError("Invalid vehicle label in refinement model: {label!r}")
  return int(match[1]), int(match[2]), int(match[3]), match[4]


def _parse_global_shipment_label(label: str) -> tuple[str, int]:
  match = _GLOBAL_SHIPEMNT_LABEL.match(label)
  if not match:
    raise ValueError(f"Invalid shipment label: {label!r}")
  return match[1], int(match[2])


def _make_local_shipment_from_shipment_map(
    local_shipments: Sequence[cfr_json.Shipment],
) -> Mapping[int, int]:
  """Returns a map from shipment indices in the base model to the local model.

  Args:
    local_shipments: The list of shipments from a local model in the two-step
      routing library.

  Returns:
    A mapping where the keys are the indices of the shipment in the base model,
    and the value for a key is the index of the corresponding shipment in the
    local model. If a shipment is not delivered through a parking location, the
    shipment index is not present in the returned mapping.
  """
  local_shipment_for_base_shipment = {}
  for local_index, local_shipment in enumerate(local_shipments):
    shipment_index = _get_shipment_index_from_local_shipment(local_shipment)
    if shipment_index in local_shipment_for_base_shipment:
      raise ValueError(
          "Duplicate shipment indices in the local shipment labels"
      )
    local_shipment_for_base_shipment[shipment_index] = local_index
  return local_shipment_for_base_shipment


def _get_shipment_index_from_local_label(label: str) -> int:
  shipment_index, _ = label.split(":")
  return int(shipment_index)


def _get_shipment_index_from_local_route_visit(visit: cfr_json.Visit) -> int:
  return _get_shipment_index_from_local_label(visit["shipmentLabel"])


def _get_shipment_index_from_local_shipment(
    local_shipment: cfr_json.Shipment,
) -> int:
  local_shipment_label = local_shipment.get("label", "")
  return _get_shipment_index_from_local_label(local_shipment_label)


def _get_shipment_indices_from_local_route_visits(
    visits: Sequence[cfr_json.Visit],
) -> Sequence[int]:
  """Returns the list of shipment indices from a route in the local model.

  Args:
    visits: The list of visits from a route that is from a solution of the local
      model. Shipment labels in the visit must follow the format used in the
      local model.

  Raises:
    ValueError: When some of the shipment labels do not follow the expected
      format.
  """
  return tuple(
      _get_shipment_index_from_local_route_visit(visit) for visit in visits
  )


def _get_parking_tag_from_local_route(route: cfr_json.ShipmentRoute) -> str:
  """Extracts the parking location tag from a route.

  Expects that the route is from a solution of the local model, and the vehicle
  label in the route follows the format used for the vehicles.

  Args:
    route: The route from which the parking tag is extracted.

  Returns:
    The parking tag for the route.

  Raises:
    ValueError: When the vehicle label of the route does not have the expected
      format.
  """
  parking_tag, _ = route["vehicleLabel"].rsplit(" [")
  if not parking_tag:
    raise ValueError(
        "Invalid vehicle label in the local route: " + route["vehicleLabel"]
    )
  return parking_tag


def _make_local_model_vehicle_label(group_key: _ParkingGroupKey) -> str:
  """Creates a label for a vehicle in the local model."""
  parts = [group_key.parking_tag, " ["]
  num_initial_parts = len(parts)

  def add_part_if_not_none(keyword: str, value: Any):
    if value is not None:
      if len(parts) > num_initial_parts:
        parts.append(" ")
      parts.append(keyword)
      parts.append(str(value))

  add_part_if_not_none("start=", group_key.start_time)
  add_part_if_not_none("end=", group_key.end_time)
  add_part_if_not_none("vehicles=", group_key.allowed_vehicle_indices)
  parts.append("]")
  return "".join(parts)


def _parking_delivery_group_key(
    options: Options,
    shipment: cfr_json.Shipment,
    parking: ParkingLocation | None,
) -> _ParkingGroupKey:
  """Creates a key that groups shipments with the same time window and parking."""
  if parking is None:
    return _ParkingGroupKey()
  group_by_time = (
      options.local_model_grouping == LocalModelGrouping.PARKING_AND_TIME
  )
  parking_tag = parking.tag
  start_time = None
  end_time = None
  delivery = shipment["deliveries"][0]
  # TODO(ondrasej): Allow using multiple time windows here.
  time_window = next(iter(delivery.get("timeWindows", ())), None)
  if group_by_time and time_window is not None:
    start_time = time_window.get("startTime")
    end_time = time_window.get("endTime")
  allowed_vehicle_indices = shipment.get("allowedVehicleIndices")
  if allowed_vehicle_indices is not None:
    allowed_vehicle_indices = tuple(sorted(allowed_vehicle_indices))
  return _ParkingGroupKey(
      parking_tag=parking_tag,
      start_time=start_time,
      end_time=end_time,
      allowed_vehicle_indices=allowed_vehicle_indices,
  )
