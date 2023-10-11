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
from collections.abc import Collection, Mapping, Sequence, Set
import copy
import dataclasses
import enum
import math
import re
from typing import Any, TypeAlias, TypeVar, cast

from . import cfr_json


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
class LocalModelGrouping(enum.Enum):
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
  """

  local_model_grouping: LocalModelGrouping = LocalModelGrouping.PARKING_AND_TIME

  # TODO(ondrasej): Do we actually need these? Perhaps they can be filled in on
  # the user side.
  local_model_vehicle_fixed_cost: float = 10_000
  local_model_vehicle_per_hour_cost: float = 300
  local_model_vehicle_per_km_cost: float = 60

  min_average_shipments_per_round: int = 1


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
      parking = self._parking_locations[parking_key.parking_tag]
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
      parking_waypoint: cfr_json.Waypoint = {
          "location": {"latLng": parking.coordinates}
      }
      group_vehicle_indices = []
      for round_index in range(max_num_rounds):
        group_vehicle_indices.append(len(local_vehicles))
        vehicle: cfr_json.Vehicle = {
            "label": f"{vehicle_label}/{round_index}",
            # Start and end waypoints.
            "endWaypoint": parking_waypoint,
            "startWaypoint": parking_waypoint,
            # Limits and travel speed.
            "travelDurationMultiple": parking.travel_duration_multiple,
            "travelMode": parking.travel_mode,
            # Costs.
            "fixedCost": self._options.local_model_vehicle_fixed_cost,
            "costPerHour": self._options.local_model_vehicle_per_hour_cost,
            "costPerKilometer": self._options.local_model_vehicle_per_km_cost,
            # Transition attribute tags.
            "startTags": [parking_key.parking_tag],
            "endTags": [parking_key.parking_tag],
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
        local_vehicles.append(vehicle)

      # Add shipments from the group. From each shipment, we preserve only the
      # necessary properties for the local plan.
      for shipment_index in group_shipment_indices:
        shipment = self._shipments[shipment_index]
        delivery = shipment["deliveries"][0]
        local_delivery = {
            "arrivalWaypoint": delivery["arrivalWaypoint"],
            "duration": delivery["duration"],
        }
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
            "label": f"{shipment_index}: {shipment['label']}",
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
      self, local_response: cfr_json.OptimizeToursResponse
  ) -> cfr_json.OptimizeToursRequest:
    """Creates a request for the global model.

    Args:
      local_response: A solution to the local model created by
        self.make_local_request() in the JSON format.

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

    # TODO(ondrasej): Honor transition attributes from the input request.
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
    for route_index, route in enumerate(local_response["routes"]):
      visits = route.get("visits")
      if visits is None or not visits:
        # Skip unused vehicles. The local plan uses a simple estimate of the
        # number of required vehicles, and is very likely to oversupply.
        continue

      parking_tag = _get_parking_tag_from_local_route(route)
      parking = self._parking_locations[parking_tag]

      # Get all shipments from the original model that are delivered in this
      # parking location route.
      shipment_indices = _get_shipment_indices_from_local_route_visits(visits)
      shipments = tuple(
          self._shipments[shipment_index] for shipment_index in shipment_indices
      )
      assert shipments

      global_delivery: cfr_json.VisitRequest = {
          # We use the coordinates of the parking location for the waypoint.
          "arrivalWaypoint": {"location": {"latLng": parking.coordinates}},
          # The duration of the delivery at the parking location is the total
          # duration of the local route for this round.
          "duration": route["metrics"]["totalDuration"],
          "tags": [parking_tag],
      }
      global_time_windows = _get_local_model_route_start_time_windows(
          self._model, route, shipments
      )
      if global_time_windows is not None:
        global_delivery["timeWindows"] = global_time_windows

      # Add arrival/departure/reload costs and delays if needed.
      parking_transition_tag = transition_attributes.get_or_create_if_needed(
          parking
      )
      if parking_transition_tag is not None:
        global_delivery["tags"].append(parking_transition_tag)

      shipment_labels = ",".join(shipment["label"] for shipment in shipments)
      global_shipment: cfr_json.Shipment = {
          "label": f"p:{route_index} {shipment_labels}",
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

      allowed_vehicle_indices = cfr_json.combined_allowed_vehicle_indices(
          shipments
      )
      if allowed_vehicle_indices:
        global_shipment["allowedVehicleIndices"] = allowed_vehicle_indices

      costs_per_vehicle_and_indices = cfr_json.combined_costs_per_vehicle(
          shipments
      )
      if costs_per_vehicle_and_indices is not None:
        vehicle_indices, costs = costs_per_vehicle_and_indices
        global_shipment["costsPerVehicle"] = costs
        global_shipment["costsPerVehicleIndices"] = vehicle_indices

      global_shipments.append(global_shipment)

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

  def merge_local_and_global_result(
      self,
      local_response: cfr_json.OptimizeToursResponse,
      global_response: cfr_json.OptimizeToursResponse,
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

    local_routes = local_response["routes"]
    populate_polylines = self._request.get("populatePolylines", False)

    # We need to define these two outside of the loop to avoid a useless warning
    # about capturing a variable defined in a loop.
    merged_transitions = None
    route_points = None
    for global_route in global_response["routes"]:
      global_visits = global_route.get("visits", ())
      if not global_visits:
        # This is an unused vehicle in the global model. We can just copy the
        # route as is.
        merged_routes.append(global_route)
        continue

      global_transitions = global_route["transitions"]
      merged_visits: list[cfr_json.Visit] = []
      merged_transitions: list[cfr_json.Transition] = []
      route_points: list[cfr_json.LatLng] = []
      merged_routes.append(
          {
              "vehicleIndex": global_route.get("vehicleIndex", 0),
              "vehicleLabel": global_route["vehicleLabel"],
              "vehicleStartTime": global_route["vehicleStartTime"],
              "vehicleEndTime": global_route["vehicleEndTime"],
              "visits": merged_visits,
              "transitions": merged_transitions,
              "routeTotalCost": global_route["routeTotalCost"],
              # TODO(ondrasej): metrics, detailed costs, ...
          }
      )

      # Copy breaks from the global route, if present.
      global_breaks = global_route.get("breaks")
      if global_breaks is not None:
        merged_routes[-1]["breaks"] = global_breaks

      if not global_visits:
        # We add empty routes, but there is no additional work to do on them.
        continue

      def add_parking_location_shipment(
          local_route: cfr_json.ShipmentRoute, arrival: bool
      ):
        arrival_or_departure = "arrival" if arrival else "departure"
        shipment_index = len(merged_shipments)
        parking_tag = _get_parking_tag_from_local_route(local_route)
        parking = self._parking_locations[parking_tag]

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

      def add_merged_transition(transition: cfr_json.Transition):
        merged_transitions.append(transition)
        if populate_polylines:
          decoded_polyline = cfr_json.decode_polyline(
              transition["routePolyline"].get("points", "")
          )
          for latlng in decoded_polyline:
            # Drop repeated points from the route polyline.
            if not route_points or route_points[-1] != latlng:
              route_points.append(latlng)

      for global_visit_index, global_visit in enumerate(global_visits):
        # The transition from the previous global visit to the current one can
        # be copied without any modifications, and it is the same regardless of
        # whether the next stop is a direct delivery or a parking location.
        add_merged_transition(global_transitions[global_visit_index])
        global_visit_label = global_visit["shipmentLabel"]
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
            arrival_shipment_index, arrival_shipment = (
                add_parking_location_shipment(local_route, arrival=True)
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
            })

            # Transfer all visits and transitions from the local route. Update
            # the timestamps as needed.
            local_visits = local_route["visits"]
            local_transitions = local_route["transitions"]
            for local_visit_index, local_visit in enumerate(local_visits):
              local_transition_in = local_transitions[local_visit_index]
              merged_transition = copy.deepcopy(local_transition_in)
              merged_transition["startTime"] = cfr_json.update_time_string(
                  merged_transition["startTime"], local_to_global_delta
              )
              add_merged_transition(merged_transition)

              shipment_index = _get_shipment_index_from_local_route_visit(
                  local_visit
              )
              merged_visit: cfr_json.Visit = {
                  "shipmentIndex": shipment_index,
                  "shipmentLabel": self._shipments[shipment_index]["label"],
                  "startTime": cfr_json.update_time_string(
                      local_visit["startTime"], local_to_global_delta
                  ),
              }
              merged_visits.append(merged_visit)

            # Add a transition back to the parking location.
            transition_to_parking = copy.deepcopy(local_transitions[-1])
            transition_to_parking["startTime"] = cfr_json.update_time_string(
                transition_to_parking["startTime"], local_to_global_delta
            )
            add_merged_transition(transition_to_parking)

            # Add a virtual shipment and a visit for the departure from the
            # parking location.
            departure_shipment_index, departure_shipment = (
                add_parking_location_shipment(local_route, arrival=False)
            )
            merged_visits.append({
                "shipmentIndex": departure_shipment_index,
                "shipmentLabel": departure_shipment["label"],
                "startTime": cfr_json.update_time_string(
                    local_route["vehicleEndTime"], local_to_global_delta
                ),
            })
          case _:
            raise ValueError(f"Unexpected visit type: '{visit_type}'")

      # Add the transition back to the depot.
      add_merged_transition(global_transitions[-1])
      if populate_polylines:
        merged_routes[-1]["routePolyline"] = {
            "points": cfr_json.encode_polyline(route_points)
        }

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
              "label": self._model["shipments"][index].get("label", ""),
          })
        case "p":
          # For parking locations, we need to add all shipments delivered from
          # that parking location.
          local_route = local_routes[index]
          for visit in local_route["visits"]:
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


_GLOBAL_SHIPEMNT_LABEL = re.compile(r"^([ps]):(\d+) .*")


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
    shipments: Sequence[cfr_json.Shipment],
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
    shipments: The list of shipments from the model that appear on the route, in
      the order in which they appear.

  Returns:
    A list of time windows for the start of the route. The time windows account
    for the time needed to walk to the first visit, and the time needed to
    return from the last visit back to the parking. When the local route can
    start at any time within the global start/end interval of the model, returns
    None.
  """
  if not shipments:
    return None

  visits = route["visits"]
  if len(shipments) != len(visits):
    raise ValueError(
        "The number of shipments does not match the number of visits."
    )

  global_start_time = cfr_json.get_global_start_time(model)
  global_end_time = cfr_json.get_global_end_time(model)

  route_start_time = cfr_json.parse_time_string(route["vehicleStartTime"])

  # The start time window for the route is computed as the intersection of
  # "route start time windows" of all visits in the route. A "route start time
  # window" of a visit is the time window of the visit, shifted by the time
  # since the start of the route needed to get to the vist (including all visits
  # that precede it on the route).
  # By starting the route in the intersection of these time windows, we
  # guarantee that each visit will start within its own time time window.

  # Start by allowing any start time for the local route.
  overall_route_start_time_intervals = ((global_start_time, global_end_time),)

  for shipment, visit in zip(shipments, visits):
    visit_type = "pickups" if visit.get("isPickup", False) else "deliveries"
    visit_request_index = visit.get("visitRequestIndex", 0)
    time_windows = shipment[visit_type][visit_request_index].get("timeWindows")
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
        "The shipments have incompatible time windows. Arrived an an empty time"
        " window intersection."
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


def _parse_global_shipment_label(label: str) -> tuple[str, int]:
  match = _GLOBAL_SHIPEMNT_LABEL.match(label)
  if not match:
    raise ValueError(f'Invalid shipment label: "{label}"')
  return match[1], int(match[2])


def _get_shipment_index_from_local_label(label: str) -> int:
  shipment_index, _ = label.split(":")
  return int(shipment_index)


def _get_shipment_index_from_local_route_visit(visit: cfr_json.Visit) -> int:
  return _get_shipment_index_from_local_label(visit["shipmentLabel"])


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
