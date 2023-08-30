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
import datetime
import math
import re
from typing import Any, TypeAlias, TypedDict

# A duration in a string format following the protocol buffers specification in
# https://protobuf.dev/reference/protobuf/google.protobuf/#duration
DurationString: TypeAlias = str

# A timestamp in a string format following the protocol buffers specification in
# https://protobuf.dev/reference/protobuf/google.protobuf/#timestamp.
TimeString: TypeAlias = str


# The amount value represented as a string. This is effectively an int64 stored
# as a string, because JSON doesn't have 64-bit integers. See the reference in
# https://developers.google.com/discovery/v1/type-format
Int64String: TypeAlias = str

# These TypedDicts are based on the JSON format for CFR requests that uses
# smallCamelCase for all names. Note that these are not full definitions, they
# have only attributes that are used in the code of the two-step planner.
#
# pylint: disable=invalid-name


class LatLng(TypedDict):
  """Represents a latitude-longitude pair in the JSON CFR request."""

  latitude: float
  longitude: float


class DurationLimit(TypedDict, total=False):
  """Represents a duration limit in the JSON CFR request."""

  maxDuration: DurationString


class TimeWindow(TypedDict, total=False):
  """Represents a time window in the JSON CFR request."""

  startTime: TimeString
  softEndTime: TimeString
  endTime: TimeString

  costPerHourAfterSoftEndTime: float


class Load(TypedDict):
  """Represents a load object in the JSON CFR request."""

  amount: Int64String


class LoadLimit(TypedDict):
  """Represents the vehicle load limit in the JSON CFR request."""

  maxLoad: Int64String


class Location(TypedDict):
  """Represents a location in the JSON CFR request."""

  latLng: LatLng


class Waypoint(TypedDict):
  """Represents a waypoint in the JSON CFR request."""

  location: Location


class VisitRequest(TypedDict, total=False):
  """Represents a delivery in the JSON CFR request."""

  arrivalWaypoint: Waypoint
  timeWindows: list[TimeWindow]
  duration: DurationString


class Shipment(TypedDict, total=False):
  """Represents a shipment in the JSON CFR request."""

  pickups: list[VisitRequest]
  deliveries: list[VisitRequest]
  label: str

  allowedVehicleIndices: list[int]

  loadDemands: dict[str, Load]

  penaltyCost: float
  costsPerVehicle: list[float]
  costsPerVehicleIndices: list[int]


class BreakRequest(TypedDict, total=False):
  """Represents a break request in the JSON CFR request."""

  earliestStartTime: TimeString
  latestStartTime: TimeString
  minDuration: DurationString


class BreakRule(TypedDict):
  """Represents a break rule in the JSON CFR request."""

  breakRequests: list[BreakRequest]


class Vehicle(TypedDict, total=False):
  """Represents a vehicle in the JSON CFR request."""

  label: str

  startWaypoint: Waypoint
  endWaypoint: Waypoint

  startTimeWindows: list[TimeWindow]
  endTimeWindows: list[TimeWindow]

  travelMode: int
  travelDurationMultiple: float

  routeDurationLimit: DurationLimit

  fixedCost: float
  costPerHour: float
  costPerKilometer: float

  loadLimits: dict[str, LoadLimit]

  breakRule: BreakRule


class ShipmentModel(TypedDict, total=False):
  """Represents a shipment model in the JSON CFR request."""

  shipments: list[Shipment]
  vehicles: list[Vehicle]
  globalStartTime: TimeString
  globalEndTime: TimeString


class OptimizeToursRequest(TypedDict, total=False):
  """Represents the JSON CFR request."""

  label: str
  model: ShipmentModel
  parent: str
  timeout: DurationString
  searchMode: int


class Visit(TypedDict, total=False):
  """Represents a single visit on a route in the JSON CFR results."""

  shipmentIndex: int
  shipmentLabel: str
  startTime: TimeString
  detour: str
  isPickup: bool


class Transition(TypedDict, total=False):
  """Represents a single transition on a route in the JSON CFR results."""

  travelDuration: str
  travelDistanceMeters: int
  waitDuration: str
  totalDuration: str
  startTime: str


class AggregatedMetrics(TypedDict, total=False):
  """Represents aggregated route metrics in the JSON CFR results."""

  performedShipmentCount: int
  totalDuration: DurationString


class ShipmentRoute(TypedDict, total=False):
  """Represents a single route in the JSON CFR result."""

  vehicleIndex: int
  vehicleLabel: str

  vehicleStartTime: str
  vehicleEndTime: str

  visits: list[Visit]
  transitions: list[Transition]
  metrics: AggregatedMetrics

  routeTotalCost: float


class SkippedShipment(TypedDict, total=False):
  """Represents a skipped shipment in the JSON CFR result."""

  index: int
  penaltyCost: float
  label: str


class OptimizeToursResponse(TypedDict, total=False):
  """Represents the JSON CFR result."""

  routes: list[ShipmentRoute]
  skippedShipments: list[SkippedShipment]
  totalCost: float


# pylint: enable=invalid-name


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
  """

  coordinates: LatLng
  tag: str

  travel_mode: int = 1
  travel_duration_multiple: float = 1.0

  delivery_load_limits: Mapping[str, int] | None = None


@dataclasses.dataclass
class Options:
  """Options for the two-step planner.

  Attributes:
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
    max_round_duration: The maximal duration of a single delivery round from the
      parking location to customer sites.
  """

  # TODO(ondrasej): Do we actually need these? Perhaps they can be filled in on
  # the user side.
  local_model_vehicle_fixed_cost: float = 10_000
  local_model_vehicle_per_hour_cost: float = 300
  local_model_vehicle_per_km_cost: float = 60

  min_average_shipments_per_round: int = 4
  max_round_duration: str = "7200s"


# Defines a mapping from shipments to the parking locations from which they are
# delivered. The key of the map is the index of a shipment in the request, and
# the value is the label of the parking location through which it is delivered.
ShipmentParkingMap = Mapping[int, ParkingTag]


class Planner:
  """The two-step routing planner."""

  _request: OptimizeToursRequest
  _model: ShipmentModel
  _options: Options
  _shipments: Sequence[Shipment]
  _vehicles: Sequence[Vehicle]

  _parking_locations: Mapping[str, ParkingLocation]
  _parking_for_shipment: ShipmentParkingMap
  _parking_groups: Mapping[_ParkingGroupKey, Sequence[int]]
  _direct_shipments: Set[int]

  def __init__(
      self,
      request_json: OptimizeToursRequest,
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
      parking_group_key = _parking_delivery_group_key(shipment, parking)
      parking_groups[parking_group_key].append(shipment_index)
    self._parking_groups: Mapping[_ParkingGroupKey, Sequence[int]] = (
        parking_groups
    )

    # Collect indices of shipments that are delivered directly.
    self._direct_shipments = set(range(self._num_shipments))
    self._direct_shipments.difference_update(self._parking_for_shipment.keys())

  def make_local_request(self) -> OptimizeToursRequest:
    """Builds the local model request.

    Returns:
      The JSON CFR request for the local model, in the natural Python format.
      The request can be exported to a JSON string via `json.dumps()`.

      Note that, for efficiency reasons, the returned data structure may contain
      parts of the input data strucutres, and it is thus not safe to mutate. If
      mutating it is needed, first make a copy via copy.deepcopy().
    """

    local_shipments: list[Shipment] = []
    local_vehicles: list[Vehicle] = []
    local_model = {
        "globalEndTime": self._model["globalEndTime"],
        "globalStartTime": self._model["globalStartTime"],
        "shipments": local_shipments,
        "vehicles": local_vehicles,
    }

    round_duration_limit: DurationLimit = {
        "maxDuration": self._options.max_round_duration
    }

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
      parking_waypoint: Waypoint = {"location": {"latLng": parking.coordinates}}
      group_vehicle_indices = []
      for round_index in range(max_num_rounds):
        group_vehicle_indices.append(len(local_vehicles))
        vehicle: Vehicle = {
            "label": f"{vehicle_label}/{round_index}",
            # Start and end waypoints.
            "endWaypoint": parking_waypoint,
            "startWaypoint": parking_waypoint,
            # Limits and travel speed.
            "routeDurationLimit": round_duration_limit,
            "travelDurationMultiple": parking.travel_duration_multiple,
            "travelMode": parking.travel_mode,
            # Costs.
            "fixedCost": self._options.local_model_vehicle_fixed_cost,
            "costPerHour": self._options.local_model_vehicle_per_hour_cost,
            "costPerKilometer": self._options.local_model_vehicle_per_km_cost,
        }
        if parking.delivery_load_limits is not None:
          vehicle["loadLimits"] = {
              unit: {"maxLoad": str(max_load)}
              for unit, max_load in parking.delivery_load_limits.items()
          }
        if parking_key.start_time is not None:
          vehicle["startTimeWindows"] = [{
              "startTime": parking_key.start_time,
          }]
        if parking_key.end_time is not None:
          vehicle["endTimeWindows"] = [{
              "endTime": parking_key.end_time,
          }]
        local_vehicles.append(vehicle)

      # Add shipments from the group. From each shipment, we preserve only the
      # necessary properties for the local plan.
      for shipment_index in group_shipment_indices:
        shipment = self._shipments[shipment_index]
        delivery = shipment["deliveries"][0]
        local_shipment: Shipment = {
            "deliveries": [{
                "arrivalWaypoint": delivery["arrivalWaypoint"],
                "duration": delivery["duration"],
            }],
            "label": f"{shipment_index}: {shipment['label']}",
            "allowedVehicleIndices": group_vehicle_indices,
        }
        # Copy load demands from the original shipment, if present.
        load_demands = shipment.get("loadDemands")
        if load_demands is not None:
          local_shipment["loadDemands"] = load_demands
        local_shipments.append(local_shipment)

    return {
        "label": self._request.get("label", "") + "/local",
        "model": local_model,
        "parent": self._request.get("parent"),
    }

  def make_global_request(
      self, local_response: OptimizeToursResponse
  ) -> OptimizeToursRequest:
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
    global_shipments: list[Shipment] = []
    global_model: ShipmentModel = {
        "globalStartTime": self._model["globalStartTime"],
        "globalEndTime": self._model["globalEndTime"],
        "shipments": global_shipments,
        # Vehicles are the same as in the original request.
        "vehicles": self._model["vehicles"],
    }
    global_start_time = _parse_time_string(self._model["globalStartTime"])
    global_end_time = _parse_time_string(self._model["globalEndTime"])

    # Take all shipments that are delivered directly, and copy them to the
    # global request. the only change we make is that we add the original
    # shipment index to their label.
    for shipment_index in self._direct_shipments:
      # We"re changing only the label - no need to make a deep copy.
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
      # We need one shipment to determine the time window of the parking
      # location visit (if there is one).
      shipment = shipments[0]

      global_delivery: VisitRequest = {
          # We use the coordinates of the parking location for the waypoint.
          "arrivalWaypoint": {"location": {"latLng": parking.coordinates}},
          # The duration of the delivery at the parking location is the total
          # duration of the local route for this round.
          "duration": route["metrics"]["totalDuration"],
      }
      # The delivery time windows of all the shipments on the local route are
      # either the same, or none of them has a delivery time window. We just
      # take the time windows definition of one of them and if present, we use
      # it as the time window of the delivery in the global model.
      time_windows = shipment["deliveries"][0].get("timeWindows")
      if time_windows is not None:
        global_time_windows = []
        local_route_duration = parse_duration_string(
            route["metrics"]["totalDuration"]
        )
        duration_to_first_shipment = parse_duration_string(
            route["transitions"][0]["totalDuration"]
        )
        duration_from_last_shipment = parse_duration_string(
            route["transitions"][-1]["totalDuration"]
        )
        for time_window in time_windows:
          global_time_window = {}
          if "startTime" in time_window:
            # Shift the beginning of the time window so that the walking time to
            # the first delivery on the route from the parking location does not
            # eat time from the delivery time window.
            start_time = _parse_time_string(time_window["startTime"])
            global_time_window["startTime"] = _make_time_string(
                max(start_time - duration_to_first_shipment, global_start_time)
            )
          if "endTime" in time_window:
            # Shift the end of the time window so that (1) the driver has enough
            # time to do all deliveries within the time window, and (2) the time
            # to walk from the last shipment back to the parking location does
            # not eat from the delivery time window.
            end_time = _parse_time_string(time_window["endTime"])
            global_time_window["endTime"] = _make_time_string(
                min(
                    end_time
                    - local_route_duration
                    + duration_from_last_shipment,
                    global_end_time,
                )
            )
          global_time_windows.append(global_time_window)

        global_delivery["timeWindows"] = global_time_windows

      shipment_labels = ",".join(shipment["label"] for shipment in shipments)
      global_shipment: Shipment = {
          "label": f"p:{route_index} {shipment_labels}",
          # We use the total duration of the parking location route as the
          # duration of this virtual shipment.
          "deliveries": [global_delivery],
      }
      # The load demands of the virtual shipment is the sum of the demands of
      # all individual shipments delivered on the local route.
      load_demands = _combined_load_demands(shipments)
      if load_demands:
        global_shipment["loadDemands"] = load_demands

      # Add the penalty cost of the virtual shipment if needed.
      penalty_cost = _combined_penalty_cost(shipments)
      if penalty_cost is not None:
        global_shipment["penaltyCost"] = penalty_cost

      allowed_vehicle_indices = _combined_allowed_vehicle_indices(shipments)
      if allowed_vehicle_indices:
        global_shipment["allowedVehicleIndices"] = allowed_vehicle_indices

      costs_per_vehicle_and_indices = _combined_costs_per_vehicle(shipments)
      if costs_per_vehicle_and_indices is not None:
        vehicle_indices, costs = costs_per_vehicle_and_indices
        global_shipment["costsPerVehicle"] = costs
        global_shipment["costsPerVehicleIndices"] = vehicle_indices

      global_shipments.append(global_shipment)

    return {
        "label": self._request.get("label", "") + "/global",
        "model": global_model,
        "parent": self._request.get("parent"),
    }

  def merge_local_and_global_result(
      self,
      local_response: OptimizeToursResponse,
      global_response: OptimizeToursResponse,
  ) -> tuple[OptimizeToursRequest, OptimizeToursResponse]:
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
    merged_shipments: list[Shipment] = copy.copy(self._shipments)
    merged_model: ShipmentModel = {
        # The start and end time remain unchanged.
        "globalStartTime": self._model["globalStartTime"],
        "globalEndTime": self._model["globalEndTime"],
        "shipments": merged_shipments,
        # The vehicles in the merged model are the vehicles from the global
        # model and from the local model. This preserves vehicle indices from
        # the original request.
        "vehicles": self._model["vehicles"],
    }
    merged_request: OptimizeToursRequest = {
        "model": merged_model,
        "label": self._request.get("label", "") + "/merged",
        "parent": self._request.get("parent"),
    }
    merged_routes: list[ShipmentRoute] = []
    merged_result: OptimizeToursResponse = {
        "routes": merged_routes,
    }

    local_routes = local_response["routes"]

    for global_route in global_response["routes"]:
      global_visits = global_route.get("visits", ())
      if not global_visits:
        # This is an unused vehicle in the global model. We can just copy the
        # route as is.
        merged_routes.append(global_route)
        continue

      global_transitions = global_route["transitions"]
      merged_visits: list[Visit] = []
      merged_transitions: list[Transition] = []
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

      if not global_visits:
        # We add empty routes, but there is no additional work to do on them.
        continue

      def add_parking_location_shipment(
          local_route: ShipmentRoute, arrival: bool
      ):
        arrival_or_departure = "arrival" if arrival else "departure"
        shipment_index = len(merged_shipments)
        parking_tag = _get_parking_tag_from_local_route(local_route)
        parking = self._parking_locations[parking_tag]

        shipment: Shipment = {
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
        # The transition from the previous global visit to the current one can
        # be copied without any modifications, and it is the same regardless of
        # whether the next stop is a direct delivery or a parking location.
        merged_transitions.append(global_transitions[global_visit_index])
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
            global_start_time = _parse_time_string(global_visit["startTime"])
            local_start_time = _parse_time_string(
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
              merged_transition["startTime"] = _update_time_string(
                  merged_transition["startTime"], local_to_global_delta
              )
              merged_transitions.append(merged_transition)

              shipment_index = _get_shipment_index_from_local_route_visit(
                  local_visit
              )
              merged_visit: Visit = {
                  "shipmentIndex": shipment_index,
                  "shipmentLabel": self._shipments[shipment_index]["label"],
                  "startTime": _update_time_string(
                      local_visit["startTime"], local_to_global_delta
                  ),
              }
              merged_visits.append(merged_visit)

            # Add a transition back to the parking location.
            transition_to_parking = copy.deepcopy(local_transitions[-1])
            transition_to_parking["startTime"] = _update_time_string(
                transition_to_parking["startTime"], local_to_global_delta
            )
            merged_transitions.append(transition_to_parking)

            # Add a virtual shipment and a visit for the departure from the
            # parking location.
            departure_shipment_index, departure_shipment = (
                add_parking_location_shipment(local_route, arrival=False)
            )
            merged_visits.append({
                "shipmentIndex": departure_shipment_index,
                "shipmentLabel": departure_shipment["label"],
                "startTime": _update_time_string(
                    local_route["vehicleEndTime"], local_to_global_delta
                ),
            })
          case _:
            raise ValueError(f"Unexpected visit type: '{visit_type}'")

      # Add the transition back to the depot.
      merged_transitions.append(global_transitions[-1])

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
          merged_skipped_shipments.append(global_skipped_shipment)
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


def validate_request(
    request: OptimizeToursRequest,
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


_GLOBAL_SHIPEMNT_LABEL = re.compile(r"^([ps]):(\d+) .*")


def _parse_global_shipment_label(label: str) -> tuple[str, int]:
  match = _GLOBAL_SHIPEMNT_LABEL.match(label)
  if not match:
    raise ValueError(f'Invalid shipment label: "{label}"')
  return match[1], int(match[2])


def _combined_penalty_cost(
    shipments: Collection[Shipment],
) -> float | None:
  """Returns the combined skipped shipment penalty cost of a group of shipments.

  Args:
    shipments: The list of shipments.

  Returns:
    The sum of the penalty costs of the shipments or None if any of the
    shipments is mandatory.
  """
  cost_sum = 0
  for shipment in shipments:
    shipment_cost = shipment.get("penaltyCost")
    if shipment_cost is None:
      return None
    cost_sum += shipment_cost
  return cost_sum


def _combined_costs_per_vehicle(
    shipments: Collection[Shipment],
) -> tuple[list[int], list[float]] | None:
  """Returns the combined shipment-vehicle costs for the shipments.

  The cost of the group for a vehicle is the maximum of the costs of the
  individual shipments for that vehicle.

  Args:
    shipments: The group of shipments for which the costs are computed.

  Returns:
    A tuple (vehicle_indices, costs) that can be used in attributes
    `costsPerVehicle` and `costsPerVehicleIndices` of a shipment. Returns None
    when there are no vehicle-shipment costs.
  """
  vehicle_costs = collections.defaultdict(float)
  for shipment in shipments:
    costs = shipment.get("costsPerVehicle")
    if costs is None:
      continue
    vehicle_indices = shipment.get("costsPerVehicleIndices")
    if vehicle_indices is None:
      raise ValueError(
          "Vehicle-shipment costs are supported only when using"
          " costsPerVehicleIndices."
      )
    for vehicle_index, cost in zip(vehicle_indices, costs, strict=True):
      vehicle_costs[vehicle_index] = max(vehicle_costs[vehicle_index], cost)

  if not vehicle_costs:
    # There were no vehicle-shipment costs.
    return None

  # Convert the dict into a list of costs and a list of corresponding indices.
  indices, costs = zip(*sorted(vehicle_costs.items()))
  return list(indices), list(costs)


def _combined_allowed_vehicle_indices(
    shipments: Collection[Shipment],
) -> list[int] | None:
  """Returns the list of allowed vehicle indices that can serve all shipments."""
  allowed_vehicles = None
  for shipment in shipments:
    shipment_allowed_vehicles = shipment.get("allowedVehicleIndices")
    if shipment_allowed_vehicles is None:
      continue
    if allowed_vehicles is None:
      allowed_vehicles = set(shipment_allowed_vehicles)
    else:
      allowed_vehicles.intersection_update(shipment_allowed_vehicles)
      if not allowed_vehicles:
        raise ValueError("No allowed vehicles are left")
  if allowed_vehicles is None:
    return None
  return sorted(allowed_vehicles)


def _combined_load_demands(shipments: Collection[Shipment]) -> dict[str, Load]:
  """Computes the combined load demands of all shipments in `shipments`."""
  demands = collections.defaultdict(int)
  for shipment in shipments:
    shipment_demands = shipment.get("loadDemands")
    if shipment_demands is None:
      continue
    for unit, amount in shipment_demands.items():
      demands[unit] += int(amount.get("amount", 0))
  return {unit: {"amount": str(amount)} for unit, amount in demands.items()}


def _get_shipment_index_from_local_label(label: str) -> int:
  shipment_index, _ = label.split(":")
  return int(shipment_index)


def _get_shipment_index_from_local_route_visit(visit: Visit) -> int:
  return _get_shipment_index_from_local_label(visit["shipmentLabel"])


def _get_shipment_indices_from_local_route_visits(
    visits: Sequence[Visit],
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


def _get_parking_tag_from_local_route(route: ShipmentRoute) -> str:
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
    shipment: Shipment, parking: ParkingLocation | None
) -> _ParkingGroupKey:
  """Creates a key that groups shipments with the same time window and parking."""
  if parking is None:
    return _ParkingGroupKey()
  parking_tag = parking.tag
  start_time = None
  end_time = None
  delivery = shipment["deliveries"][0]
  time_window = next(iter(delivery.get("timeWindows", ())), None)
  if time_window is not None:
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


def _update_time_string(
    time_string: TimeString, delta: datetime.timedelta
) -> TimeString:
  """Takes the time from `times_string` and adds `delta` to it."""
  timestamp = _parse_time_string(time_string)
  updated_timestamp = timestamp + delta
  return _make_time_string(updated_timestamp)


def _parse_time_string(time_string: TimeString) -> datetime.datetime:
  """Parses the time string and converts it into a datetime."""
  if time_string.endswith("Z") or time_string.endswith("z"):
    # Drop the 'Z', we do not need it for parsing.
    time_string = time_string[:-1]
  return datetime.datetime.fromisoformat(time_string)


def _make_time_string(timestamp: datetime.datetime) -> TimeString:
  """Formats timestampt to a string format used in the CFR JSON API."""
  date_string = timestamp.isoformat()
  if "+" not in date_string:
    # There is no time zone offset. We need to add the "Z" terminator.
    date_string += "Z"
  return date_string


def parse_duration_string(duration: DurationString) -> datetime.timedelta:
  """Parses the duration string and converts it to a timedelta.

  Args:
    duration: The duration in the string format "{number_of_seconds}s".

  Returns:
    The duration as a timedelta object.

  Raises:
    ValueError: When the duration string does not have the right format.
  """
  if not duration.endswith("s"):
    raise ValueError(f"Unexpected duration string format: '{duration}'")
  seconds = float(duration[:-1])
  return datetime.timedelta(seconds=seconds)
