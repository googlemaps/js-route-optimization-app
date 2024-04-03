# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

"""Data structures and functions for working with CFR JSON requests."""

import collections
from collections.abc import Collection, Iterable, Mapping, Sequence, Set
import datetime
import itertools
import logging
from typing import TypeAlias, TypedDict

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
  softStartTime: TimeString
  softEndTime: TimeString
  endTime: TimeString

  costPerHourBeforeSoftStartTime: float
  costPerHourAfterSoftEndTime: float


class Load(TypedDict):
  """Represents a load object in the JSON CFR request."""

  amount: Int64String


class LoadLimit(TypedDict):
  """Represents the vehicle load limit in the JSON CFR request."""

  maxLoad: Int64String


class Location(TypedDict, total=False):
  """Represents a location in the JSON CFR request."""

  latLng: LatLng
  heading: int


class Waypoint(TypedDict, total=False):
  """Represents a waypoint in the JSON CFR request."""

  sideOfRoad: bool
  location: Location
  placeId: str


class VisitRequest(TypedDict, total=False):
  """Represents a delivery in the JSON CFR request."""

  arrivalLocation: LatLng
  arrivalWaypoint: Waypoint
  departureLocation: LatLng
  departureWaypoint: Waypoint
  timeWindows: list[TimeWindow]
  duration: DurationString
  cost: float

  tags: list[str]


class Shipment(TypedDict, total=False):
  """Represents a shipment in the JSON CFR request."""

  pickups: list[VisitRequest]
  deliveries: list[VisitRequest]
  label: str
  shipmentType: str

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


class RouteModifiers(TypedDict, total=False):
  """Represents the route modifiers in the JSON CFR request."""

  avoidTolls: bool
  avoidHighways: bool
  avoidFerries: bool
  avoidIndoor: bool


class Vehicle(TypedDict, total=False):
  """Represents a vehicle in the JSON CFR request."""

  label: str

  startLocation: LatLng
  startWaypoint: Waypoint
  endLocation: LatLng
  endWaypoint: Waypoint

  startTimeWindows: list[TimeWindow]
  endTimeWindows: list[TimeWindow]

  startTags: list[str]
  endTags: list[str]

  travelMode: int
  travelDurationMultiple: float
  routeModifiers: RouteModifiers

  routeDurationLimit: DurationLimit

  fixedCost: float
  costPerHour: float
  costPerKilometer: float

  loadLimits: dict[str, LoadLimit]

  breakRule: BreakRule


class TransitionAttributes(TypedDict, total=False):
  """Represents transition attributes in the JSON CFR request."""

  srcTag: str
  excludedSrcTag: str
  dstTag: str
  excludedDstTag: str
  cost: float
  delay: DurationString


class ShipmentTypeIncompatibility(TypedDict, total=False):
  """Represents a shipment type incompatibility in the JSON CFR request."""

  types: list[str]
  incompatibilityMode: int


class ShipmentModel(TypedDict, total=False):
  """Represents a shipment model in the JSON CFR request."""

  shipments: list[Shipment]
  vehicles: list[Vehicle]
  transitionAttributes: list[TransitionAttributes]
  globalStartTime: TimeString
  globalEndTime: TimeString

  shipmentTypeIncompatibilities: list[ShipmentTypeIncompatibility]


class Visit(TypedDict, total=False):
  """Represents a single visit on a route in the JSON CFR results."""

  shipmentIndex: int
  shipmentLabel: str
  startTime: TimeString
  detour: str
  isPickup: bool
  visitRequestIndex: int


class EncodedPolyline(TypedDict, total=False):
  """Represents an encoded polyline in the JSON CFR results."""

  points: str


class TravelStep(TypedDict, total=False):
  """Represents a single travel step of a route in the JSON CFR results."""

  duration: DurationString
  distanceMeters: float
  trafficInfoUnavailable: bool
  routePolyline: EncodedPolyline


class Transition(TypedDict, total=False):
  """Represents a single transition on a route in the JSON CFR results."""

  travelDuration: DurationString
  travelDistanceMeters: float
  delayDuration: DurationString
  waitDuration: DurationString
  breakDuration: DurationString
  totalDuration: DurationString
  startTime: TimeString
  routePolyline: EncodedPolyline

  # The following two fields are optionally added to the merged routes by the
  # two_step_routing library, but they are not part of the official CFR API, and
  # they may break conversion of the JSON data to a proto or cause input
  # validation when used with tools that do not recognize them.
  travelMode: int
  travelDurationMultiple: float


class AggregatedMetrics(TypedDict, total=False):
  """Represents aggregated route metrics in the JSON CFR results."""

  performedShipmentCount: int
  performedMandatoryShipmentCount: int
  travelDuration: DurationString
  waitDuration: DurationString
  delayDuration: DurationString
  breakDuration: DurationString
  visitDuration: DurationString
  totalDuration: DurationString
  travelDistanceMeters: float


class Break(TypedDict):
  """Represents a break in the JSON CFR results."""

  startTime: TimeString
  duration: DurationString


class ShipmentRoute(TypedDict, total=False):
  """Represents a single route in the JSON CFR result."""

  vehicleIndex: int
  vehicleLabel: str

  vehicleStartTime: TimeString
  vehicleEndTime: TimeString
  vehicleDetour: DurationString

  visits: list[Visit]
  transitions: list[Transition]
  travelSteps: list[TravelStep]
  breaks: list[Break]
  metrics: AggregatedMetrics

  routeTotalCost: float

  routePolyline: EncodedPolyline
  hasTrafficInfeasibilities: bool


class SkippedShipment(TypedDict, total=False):
  """Represents a skipped shipment in the JSON CFR result."""

  index: int
  label: str


class OptimizeToursRequest(TypedDict, total=False):
  """Represents the JSON CFR request."""

  allowLargeDeadlineDespiteInterruptionRisk: bool
  considerRoadTraffic: bool
  injectedFirstSolutionRoutes: list[ShipmentRoute]
  internalParameters: str
  label: str
  model: ShipmentModel
  parent: str
  populatePolylines: bool
  populateTransitionPolylines: bool
  searchMode: int | str
  timeout: DurationString


class Metrics(TypedDict, total=False):
  """Represents the metrics in the JSON CFR response."""

  aggregatedRouteMetrics: AggregatedMetrics
  skippedMandatoryShipmentCount: int
  usedVehicleCount: int
  earliestVehicleStartTime: TimeString
  latestVehicleEndTime: TimeString
  costs: dict[str, float]
  totalCost: float


class OptimizeToursResponse(TypedDict, total=False):
  """Represents the JSON CFR result."""

  requestLabel: str
  routes: list[ShipmentRoute]
  skippedShipments: list[SkippedShipment]
  totalCost: float
  metrics: Metrics


# pylint: enable=invalid-name


def combined_penalty_cost(
    shipments: Collection[Shipment],
) -> float | None:
  """Returns the combined skipped shipment penalty cost of a group of shipments.

  The group of shipments is mandatory when any of the shipments in the group is
  mandatory.

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


def combined_costs_per_vehicle(
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


def combined_allowed_vehicle_indices(
    shipments: Collection[Shipment],
) -> list[int] | None:
  """Returns the list of allowed vehicle indices that can serve all shipments."""
  allowed_vehicles = None
  for shipment in shipments:
    logging.debug("shipment: %r", shipment)
    shipment_allowed_vehicles = shipment.get("allowedVehicleIndices")
    if shipment_allowed_vehicles is None:
      continue
    logging.debug("allowed_vehicles = %r", allowed_vehicles)
    if allowed_vehicles is None:
      allowed_vehicles = set(shipment_allowed_vehicles)
    else:
      allowed_vehicles.intersection_update(shipment_allowed_vehicles)
      if not allowed_vehicles:
        raise ValueError("No allowed vehicles are left")
  if allowed_vehicles is None:
    return None
  return sorted(allowed_vehicles)


def combined_load_demands(shipments: Collection[Shipment]) -> dict[str, Load]:
  """Computes the combined load demands of all shipments in `shipments`.

  Assumes that shipments are shipments that are picked up and delivered at the
  same location (the same parking location), and computes load demands that are
  sufficient both for the pickups and for the deliveries (assuming that pickups
  happen before deliveries).

  For each unit, computes the amount that is delivered and the amount that is
  picked up, and takes the max of the two. The output load demands are the
  smallest load demands that need to be reserved on the vehicle for the whole
  route to guarantee that all shipments can be performed.

  Args:
    shipments: The list of shipments to be processed.

  Returns:
    The combined load demands as described above. Never contains negative
    numbers.
  """
  delivery_demands = collections.defaultdict(int)
  pickup_demands = collections.defaultdict(int)
  for shipment in shipments:
    shipment_demands = shipment.get("loadDemands")
    if shipment_demands is None:
      continue

    is_pickup = get_pickup_or_none(shipment) is not None
    combined_demands = pickup_demands if is_pickup else delivery_demands
    for unit, amount in shipment_demands.items():
      combined_demands[unit] += int(amount.get("amount", 0))

  demands = {}
  for unit in set(itertools.chain(delivery_demands, pickup_demands)):
    demands[unit] = {
        "amount": str(
            max(delivery_demands.get(unit, 0), pickup_demands.get(unit, 0))
        )
    }

  return demands


_DEFAULT_GLOBAL_START_TIME = datetime.datetime.fromtimestamp(
    0, tz=datetime.timezone.utc
)
_DEFAULT_GLOBAL_END_TIME = datetime.datetime.fromtimestamp(
    31536000, tz=datetime.timezone.utc
)


def get_shipments(model: ShipmentModel) -> Sequence[Shipment]:
  """Returns the list of shipments of a model or an empty sequence."""
  return model.get("shipments", ())


def get_delivery_or_none(
    shipment: Shipment, index: int = 0
) -> VisitRequest | None:
  """Returns the delivery visit request at the given index, or None."""
  deliveries = shipment.get("deliveries", ())
  if len(deliveries) <= index:
    return None
  return deliveries[index]


def get_pickup_or_none(
    shipment: Shipment, index: int = 0
) -> VisitRequest | None:
  """Returns the pickup visit request at the given index, or None."""
  pickups = shipment.get("pickups", ())
  if len(pickups) <= index:
    return None
  return pickups[index]


def get_routes(response: OptimizeToursResponse) -> Sequence[ShipmentRoute]:
  """Returns the list of routes from a response or an empty sequence."""
  return response.get("routes", ())


def get_vehicles(model: ShipmentModel) -> Sequence[Vehicle]:
  """Returns the list of vehicles of a model or an empty sequence."""
  return model.get("vehicles", ())


def get_visits(route: ShipmentRoute) -> Sequence[Visit]:
  """Returns the list of visits on a route or an empty sequence."""
  return route.get("visits", ())


def get_transitions(route: ShipmentRoute) -> Sequence[Transition]:
  """Returns the list of transitions on a route or an empty sequence."""
  return route.get("transitions", ())


def get_break_earliest_start_time(
    break_request: BreakRequest,
) -> datetime.datetime:
  """Returns the earliest start time of a break request."""
  return parse_time_string(break_request["earliestStartTime"])


def get_break_latest_start_time(
    break_request: BreakRequest,
) -> datetime.datetime:
  """Returns the latest start time of a break request."""
  return parse_time_string(break_request["latestStartTime"])


def get_break_min_duration(break_request: BreakRequest) -> datetime.timedelta:
  """Returns the minimal duration of a break request."""
  return parse_duration_string(break_request["minDuration"])


def get_transition_break_duration(transition: Transition) -> datetime.timedelta:
  """Returns the break time of a transition.

  Args:
    transition: The transition for which the break duration is computed.

  Returns:
    When there is a break over the given transition, returns its duration. When
    there is no break, returns zero duration.
  """
  duration_string = transition.get("breakDuration")
  if duration_string is None:
    return datetime.timedelta()
  return parse_duration_string(duration_string)


def get_visit_request(model: ShipmentModel, visit: Visit) -> VisitRequest:
  """Returns the visit request used in `visit`."""
  shipment_index = visit.get("shipmentIndex", 0)
  shipment = model["shipments"][shipment_index]
  visit_request_index = visit.get("visitRequestIndex", 0)
  is_pickup = visit.get("isPickup", False)
  visit_requests = shipment["pickups"] if is_pickup else shipment["deliveries"]
  return visit_requests[visit_request_index]


def get_visit_request_duration(
    visit_request: VisitRequest,
) -> datetime.timedelta:
  """Returns the duration of a visit on a route."""
  return parse_duration_string(visit_request.get("duration"))


def get_visit_detour(visit: Visit) -> datetime.timedelta:
  """Returns the detour of a visit on a route."""
  return parse_duration_string(visit.get("detour", "0s"))


def get_global_start_time(model: ShipmentModel) -> datetime.datetime:
  """Returns the global start time of `model`."""
  global_start_time = model.get("globalStartTime")
  if global_start_time is None:
    return _DEFAULT_GLOBAL_START_TIME
  return max(_DEFAULT_GLOBAL_START_TIME, parse_time_string(global_start_time))


def get_global_end_time(model: ShipmentModel) -> datetime.datetime:
  """Returns the global end time of `model`."""
  global_end_time = model.get("globalEndTime")
  if global_end_time is None:
    return _DEFAULT_GLOBAL_END_TIME
  return parse_time_string(global_end_time)


def get_time_windows_start(
    model: ShipmentModel,
    time_windows: Sequence[TimeWindow] | None,
    *,
    soft_limit: bool = False,
) -> datetime.datetime:
  """Returns the earliest timestamp that is inside `time_windows`.

  Assumes that the time windows in `time_windows` are sorted and disjoint. If
  `time_windows` is not None, not empty, and the earliest time window has an
  explicit start time, returns the maximum of this time and the global start
  time. Otherwise, returns the global start time.

  Args:
    model: The model, in which the earliest start time is determined.
    time_windows: The collection of time windows, for which the earliest start
      time is determined.
    soft_limit: When True and when the first time window has a soft start time,
      returns the soft end time. Otherwise, returns the "hard" end time as
      described above. Note that soft start time is allowed only when there is a
      single time window.

  Returns:
    The earliest timestamp that is inside the time windows.
  """
  global_start_time = get_global_start_time(model)
  if not time_windows:  # Covers an empty sequence and None.
    return global_start_time
  if soft_limit:
    soft_start_time = time_windows[0].get("softStartTime")
    if soft_start_time is not None:
      return parse_time_string(soft_start_time)
  start_time = time_windows[0].get("startTime")
  if start_time is None:
    return global_start_time
  return max(global_start_time, parse_time_string(start_time))


def get_time_windows_end(
    model: ShipmentModel,
    time_windows: Sequence[TimeWindow] | None,
    *,
    soft_limit: bool = False,
) -> datetime.datetime:
  """Returns the latest timestamp that is inside `time_windows`.

  Assumes that the time windows in `time_windows` are sorted and disjoint. If
  `time_windows` is not None, not empty, and the latest time window has an
  explicit end time, returns the minimum of this time and the global end time.
  Otherwise, returns the global end time.

  Args:
    model: The model, in which the latest end time is determined.
    time_windows: The collection of time windows, for which the latest end time
      is determined.
    soft_limit: When True and when the last time window has a soft end time,
      returns the soft end time. Otherwise, returns the "hard" end time as
      described above. Note that soft end time is allowed only when there is a
      single time window.

  Returns:
    The latest timestamp that is inside the time windows.
  """
  global_end_time = get_global_end_time(model)
  if not time_windows:  # Covers an empty sequence and None.
    return global_end_time
  if soft_limit:
    soft_end_time = time_windows[-1].get("softEndTime")
    if soft_end_time is not None:
      return parse_time_string(soft_end_time)
  end_time = time_windows[-1].get("endTime")
  if end_time is None:
    return global_end_time
  return min(global_end_time, parse_time_string(end_time))


def get_shipment_earliest_pickup(
    model: ShipmentModel, shipment: Shipment, include_duration: bool = False
) -> datetime.datetime:
  """Returns the earliest pickup time of a shipment.

  When the shipment doesn't have a pickup, assumes that the shipment has been
  picked up at/before the global start, and returns global start.

  Args:
    model: The model, in which the earliest pickup time is determined.
    shipment: The shipment, for which the earliest pickup time is determined.
    include_duration: When True, returns the earliest end time of a pickup visit
      for the shipment. Otherwise, returns the earliest start time of a pickup
      visit.
  """
  pickups = shipment.get("pickups")
  if not pickups:
    return get_global_start_time(model)

  earliest_pickup_start = get_global_end_time(model)
  for pickup in pickups:
    pickup_start = get_time_windows_start(model, pickup.get("timeWindows"))
    if include_duration:
      pickup_start += get_visit_request_duration(pickup)
    earliest_pickup_start = min(earliest_pickup_start, pickup_start)

  return earliest_pickup_start


def get_shipment_load_demand(shipment: Shipment, load_key: str) -> int:
  """Returns the load demand of a particular load type."""
  load_demands = shipment.get("loadDemands")
  if load_demands is None:
    return 0
  unit_demands = load_demands.get(load_key)
  if unit_demands is None:
    return 0
  return int(unit_demands.get("amount", 0))


def get_performed_shipments_from_routes(
    routes: Sequence[ShipmentRoute],
) -> Set[int]:
  """Returns indices of shipments performed on `routes`."""
  performed_shipments = set()
  for route in routes:
    performed_shipments.update(
        visit.get("shipmentIndex", 0) for visit in get_visits(route)
    )
  return performed_shipments


def get_skipped_shipments_from_routes(
    model: ShipmentModel, routes: Sequence[ShipmentRoute]
) -> Set[int]:
  """Returns indices of shipments that are not performed in `routes`."""
  shipments = get_shipments(model)
  performed_shipments = get_performed_shipments_from_routes(routes)
  skipped_shipment_indices = set(range(len(shipments)))
  skipped_shipment_indices.difference_update(performed_shipments)
  return skipped_shipment_indices


def get_vehicle_earliest_start(
    model: ShipmentModel, vehicle: Vehicle, *, soft_limit: bool = False
) -> datetime.datetime:
  """Returns the earliest start time of `vehicle` in `model`.

  The function follows the algorithm for determining the earliest start time by
  taking the maximum of the following three times:
    1. the hard start time of the first start time window of `vehicle`, if
       defined,
    2. the global start time in `model`, if defined,
    3. Jan 1, 1970, 00:00:00 UTC.

  Args:
    model: The model, in which the earliest start time is determined.
    vehicle: The vehicle, for which the earliest start time is determined.
    soft_limit: When True and the vehicle has a soft start time, returns the
      soft start time of the vehicle. Otherwise, returns the "hard" start time.

  Returns:
    The earliest vehicle start time.
  """
  return get_time_windows_start(
      model, vehicle.get("startTimeWindows"), soft_limit=soft_limit
  )


def get_vehicle_latest_end(
    model: ShipmentModel, vehicle: Vehicle, *, soft_limit: bool = False
) -> datetime.datetime:
  """Returns the latest end time of `vehicle` in `model`.

  The function follows the algorithm for determining the latest end time by
  taking the minimum of the following:
    1. the hard end time of the last end time window of `vehicle`,
    2. the global end time in `model`.
  If neither of the two above is defined, Jan 1, 1971, 00:00:00 UTC is used.

  Args:
    model: The model, in which the latest end time is determined.
    vehicle: The vehicle, for which the latest end time is determined.
    soft_limit: When True and the vehicle has a soft end time, returns the soft
      end time of the vehicle. Otherwise, returns the "hard" end time.

  Returns:
    The latest vehicle end time.
  """
  return get_time_windows_end(
      model, vehicle.get("endTimeWindows"), soft_limit=soft_limit
  )


def get_unavoidable_breaks(
    break_requests: Sequence[BreakRequest],
    start_time: datetime.datetime,
    end_time: datetime.datetime,
) -> tuple[int, int] | None:
  """Finds the smallest set of breaks that fall into (start_time, end_time).

  Computes which breaks can be pushed outside of working hours, either by having
  them start and end before `start_time`, or by having them start after
  `end_time`. Respects the CFR invariant that breaks must be scheduled in the
  order in which they appear in `break_requests` and that they can't overlap.
  Uses the shortest possible duration for all breaks.

  Args:
    break_requests: The sequence of break requests.
    start_time: The start time of the interval.
    end_time: The end time of the interval. Must be greater or equal to
      start_time.

  Returns:
    None when all breaks can be avoided. Otherwise, returns a tuple
    `(first_break, last_break)` where `first_break`, resp. `last_break`, are the
    indices of the first, resp. last, break that intersect the interval.
  """
  if not break_requests:
    return None
  num_break_requests = len(break_requests)

  first_break_index = 0
  earliest_break_start = get_break_earliest_start_time(break_requests[0])
  while first_break_index < num_break_requests:
    break_request = break_requests[first_break_index]
    earliest_break_start = max(
        get_break_earliest_start_time(break_request),
        earliest_break_start,
    )
    min_duration = get_break_min_duration(break_request)
    break_end_time = earliest_break_start + min_duration

    if break_end_time > start_time:
      break
    first_break_index += 1
    earliest_break_start = break_end_time

  if first_break_index == num_break_requests:
    # All breaks can end before `start_time`.
    return None

  last_break_index = num_break_requests - 1
  latest_break_start = get_break_latest_start_time(
      break_requests[last_break_index]
  )
  latest_break_end = latest_break_start + get_break_min_duration(
      break_requests[last_break_index]
  )
  while last_break_index >= first_break_index:
    break_request = break_requests[last_break_index]
    min_duration = get_break_min_duration(break_request)
    latest_break_start = min(
        get_break_latest_start_time(break_request),
        latest_break_end - min_duration,
    )
    if latest_break_start < end_time:
      break
    last_break_index -= 1
    latest_break_end = latest_break_start

  if last_break_index < first_break_index:
    # All breaks can end before `start_time` or start after `end_time`.
    return None

  return first_break_index, last_break_index


def get_vehicle_max_working_hours(
    model: ShipmentModel, vehicle: Vehicle, *, soft_limit: bool = False
) -> datetime.timedelta:
  """Computes the maximal total working hours of `vehicle` in `model`.

  First determines the earliest start time and the latest end time of the
  vehicle; then considers all breaks that overlap with this time interval, and
  subtracts their full min duration from the length of the interval.

  Limitations of this algorithm (as of 2023-10-30):
  - it doesn't take into account the max route length of the vehicle, the
    computation is based only on the start/end time. When the route has a
    flexible start but a fixed maximal duration, this function will overestimate
    the maximal working time.
  - when a break request may overlap with the start time or the end time, it
    assumes that the break is taken in full within the working hours of the
    vehicle. This may underestimate the maximal working hours in case where the
    start time or end time are flexible and some breaks may be avoided by moving
    them.
  Both limitations would require solving an optimization problem to determine
  the max working hours correctly.

  Args:
    model: The model in which the working hours are computed.
    vehicle: The vehicle for which the working hours are computed.
    soft_limit: When True and the vehicle has a soft start time or soft end
      time, returns the total hours between the (potentially soft) start time
      and the (potentially soft) end time of the vehicle. Otherwise, returns the
      maximal working hours.

  Returns:
    The maximal working hours of the vehicle, obtained by taking using the
    earliest possible start time, the latest possible end time, and the minimal
    durations of all breaks.

  Raises:
    ValueError: When any of the breaks may start before the earliest vehicle
      start or end after the latest vehicle end time.
  """
  # TODO(ondrasej): Also take into account Vehicle.routeDurationLimit.
  # TODO(ondrasej): It is hard to make this function really correct and precise.
  # Perhaps we should side-step the issue by counting considering breaks to be
  # part of the work and avoid getting into all of this complexity.
  start_time = get_vehicle_earliest_start(model, vehicle, soft_limit=soft_limit)
  end_time = get_vehicle_latest_end(model, vehicle, soft_limit=soft_limit)
  working_hours = end_time - start_time
  break_rule = vehicle.get("breakRule")
  if break_rule is None:
    return working_hours
  break_requests = break_rule.get("breakRequests")
  if break_requests is None:
    return working_hours
  unavoidable_breaks = get_unavoidable_breaks(
      break_requests, start_time, end_time
  )
  if unavoidable_breaks is None:
    return working_hours

  first_break_index, last_break_index = unavoidable_breaks

  for break_index in range(first_break_index, last_break_index + 1):
    break_request = break_requests[break_index]
    working_hours -= get_break_min_duration(break_request)
  return working_hours


def get_vehicle_actual_working_hours(
    route: ShipmentRoute,
) -> datetime.timedelta:
  """Returns the duration of the given route, minus all the breaks."""
  visits = get_visits(route)
  if not visits:
    # Unused vehicle.
    return datetime.timedelta()
  start_time = parse_time_string(route["vehicleStartTime"])
  end_time = parse_time_string(route["vehicleEndTime"])
  working_hours = end_time - start_time
  for route_break in route.get("breaks", ()):
    break_start = parse_time_string(route_break["startTime"])
    break_duration = parse_duration_string(route_break["duration"])
    break_end = break_start + break_duration
    if break_end <= start_time or break_start >= end_time:
      continue
    working_hours -= break_duration
  return working_hours


def update_route_start_end_time_from_transitions(
    route: ShipmentRoute, remove_delay_at_end: DurationString | None
) -> None:
  """Updates start and end time of `route` based on times from transitions.

  Sets `vehicleStartTime` to the start of the first transition. Sets
  `vehicleEndTime` to the end time of the last transition.

  When `remove_delay_at_end` is not None, removes this amount of time from the
  delay duration of the last transition. This is reflected both in the vehicle
  end time set by this function, but also the last transition of the route is
  itself modified.

  Args:
    route: The route to be modified.
    remove_delay_at_end: An optional delay duration that is subtracted from the
      last transition. It is an error if the last transition does not have at
      least this amount of delay.

  Raises:
    ValueError: When the route is empty or when `remove_delay_at_end` is greater
      than the delay duration of the last transition of the route.
  """
  transitions = route.get("transitions", ())
  if not transitions:
    raise ValueError("The route is empty")

  route["vehicleStartTime"] = transitions[0]["startTime"]

  last_transition = transitions[-1]
  last_transition_start_time = parse_time_string(last_transition["startTime"])
  last_transition_total_duration = parse_duration_string(
      last_transition.get("totalDuration")
  )
  if remove_delay_at_end is not None:
    removed_delay = parse_duration_string(remove_delay_at_end)
    last_transition_delay_duration = parse_duration_string(
        last_transition.get("delayDuration")
    )
    if last_transition_delay_duration < removed_delay:
      raise ValueError(
          "The delay duration of the last transition is smaller than"
          " remove_delay_at_end."
      )
    last_transition["delayDuration"] = as_duration_string(
        last_transition_delay_duration - removed_delay
    )
    last_transition_total_duration -= removed_delay
    last_transition["totalDuration"] = as_duration_string(
        last_transition_total_duration
    )
  route["vehicleEndTime"] = as_time_string(
      last_transition_start_time + last_transition_total_duration
  )


def recompute_route_metrics(
    model: ShipmentModel, route: ShipmentRoute, check_consistency: bool = True
) -> None:
  """Updates aggregate metrics of a route from its transitions and visits.

  Args:
    model: The model, to which the route belongs.
    route: The route to update.
    check_consistency: When True, also checks the consistency of the computed
      times and timestamps.
  """
  visits = get_visits(route)
  if not visits:
    route.pop("metrics", None)
    return

  shipments = get_shipments(model)
  performed_shipments = set()
  performed_mandatory_shipments = set()

  travel_distance_meters = 0
  route_travel_duration = datetime.timedelta(0)
  route_delay_duration = datetime.timedelta(0)
  route_wait_duration = datetime.timedelta(0)
  route_break_duration = datetime.timedelta(0)
  route_visit_duration = datetime.timedelta(0)
  route_total_duration = datetime.timedelta(0)

  for visit in visits:
    shipment_index = visit.get("shipmentIndex", 0)
    performed_shipments.add(shipment_index)
    shipment = shipments[shipment_index]
    if shipment.get("penaltyCost") is None:
      performed_mandatory_shipments.add(shipment_index)

    visit_duration = get_visit_request_duration(get_visit_request(model, visit))
    route_visit_duration += visit_duration
    route_total_duration += visit_duration

  for transition in get_transitions(route):
    travel_distance_meters += transition.get("travelDistanceMeters", 0)
    route_travel_duration += parse_duration_string(
        transition.get("travelDuration")
    )
    route_delay_duration += parse_duration_string(
        transition.get("delayDuration")
    )
    route_break_duration += parse_duration_string(
        transition.get("breakDuration")
    )
    route_wait_duration += parse_duration_string(transition.get("waitDuration"))
    route_total_duration += parse_duration_string(
        transition.get("totalDuration")
    )

  if check_consistency:
    assert len(visits) + 1 == len(get_transitions(route))
    if (
        route_total_duration
        != route_travel_duration
        + route_delay_duration
        + route_wait_duration
        + route_break_duration
        + route_visit_duration
    ):
      raise ValueError(
          "The durations in the transitions and visits are inconsistent."
      )
    # Check that the total time corresponds to the difference between vehicle
    # start and end times.
    start_time = parse_time_string(route["vehicleStartTime"])
    end_time = parse_time_string(route["vehicleEndTime"])
    if route_total_duration != end_time - start_time:
      raise ValueError(
          "The total duration is inconsistent with vehicle start and end"
          f" times. Start time: {start_time}, end time: {end_time}, total"
          f" duration: {route_total_duration}"
      )

  route["metrics"] = {
      "performedShipmentCount": len(performed_shipments),
      "performedMandatoryShipmentCount": len(performed_mandatory_shipments),
      "travelDuration": as_duration_string(route_travel_duration),
      "travelDistanceMeters": travel_distance_meters,
      "waitDuration": as_duration_string(route_wait_duration),
      "delayDuration": as_duration_string(route_delay_duration),
      "breakDuration": as_duration_string(route_break_duration),
      "visitDuration": as_duration_string(route_visit_duration),
      "totalDuration": as_duration_string(route_total_duration),
  }


def _recompute_one_transition_start_and_durations(
    transition: Transition,
    start_time: datetime.datetime,
    end_time: datetime.datetime,
    allow_negative_wait_duration: bool,
) -> None:
  """Updates `startTime` and `totalDuration` of one transition.

  Updates the transition to fit between `start_time` and `end_time`. Updates
  `startTime`, `waitDuration` and `totalDuration` of the transition so that the
  transition starts at `start_time` and the next visit starts at `end_time`.
  Other durations of the transition are preserved.

  Args:
    transition: The transition to be updated.
    start_time: The requested start time of the transition.
    end_time: The requested end time of the transition.
    allow_negative_wait_duration: Allow that the time slot betwen start_time and
      end_time is smaller than the required minimal duration of the transition.
      When this happens, the function adds a negative wait time so that the
      total duration of the transition matches the time between the two visits.

  Raises:
    ValueError: When sum of the other durations of the transition is greater
      than the duration between `start_time` and `end_time`, and
      allow_negative_wait_duration is False.
  """
  non_wait_duration = (
      parse_duration_string(transition.get("travelDuration", "0s"))
      + parse_duration_string(transition.get("delayDuration", "0s"))
      + parse_duration_string(transition.get("breakDuration", "0s"))
  )
  required_total_duration = end_time - start_time
  if (
      non_wait_duration > required_total_duration
      and not allow_negative_wait_duration
  ):
    raise ValueError(
        f"The minimal duration of the transition ({non_wait_duration}) is"
        f" greater than the available time slot ({required_total_duration})."
    )
  wait_duration = required_total_duration - non_wait_duration
  transition["startTime"] = as_time_string(start_time)
  transition["totalDuration"] = as_duration_string(required_total_duration)
  transition["waitDuration"] = as_duration_string(wait_duration)


def recompute_transition_starts_and_durations(
    model: ShipmentModel,
    route: ShipmentRoute,
    allow_negative_wait_duration: bool,
) -> None:
  """Recomputes transition start times and wait durations based on visit times.

  Assumes that the list of visits of `route` is complete and that the visit
  start times are correct. Updates transition start times so that they match the
  visit start times, and adds wait time as needed for padding.

  Args:
    model: The model in which the transition times are recomputed.
    route: The route, for which the transition times are recomputed. Modified in
      place.
    allow_negative_wait_duration: Allow that the time slot between two visits is
      shorter than the minimal duration of a transition. The missing time is
      "fixed" by using a negative wait time. This is the approach taken by the
      CFR solver when there is a traffic infeasibility; setting this to true
      allows the computation to proceed also on results computed with live
      traffic that may have traffic infeasibilities.

  Raises:
    ValueError: When the time between two visits is shorter than then time
      required by the transition between them, and allow_negative_wait_duration
      is False.
  """
  visits = get_visits(route)
  if not visits:
    # Unused vehicle.
    return

  transitions = get_transitions(route)

  previous_visit_end_time = parse_time_string(route["vehicleStartTime"])
  transition_index = None
  try:
    for transition_index, visit in enumerate(visits):
      current_visit_start_time = parse_time_string(visit["startTime"])
      transition_in = transitions[transition_index]
      _recompute_one_transition_start_and_durations(
          transition_in,
          previous_visit_end_time,
          current_visit_start_time,
          allow_negative_wait_duration,
      )

      visit_duration = get_visit_request_duration(
          get_visit_request(model, visit)
      )
      previous_visit_end_time = current_visit_start_time + visit_duration

    transition_index = len(visits)
    _recompute_one_transition_start_and_durations(
        transitions[-1],
        previous_visit_end_time,
        parse_time_string(route["vehicleEndTime"]),
        allow_negative_wait_duration,
    )
  except ValueError as err:
    raise ValueError(
        "Recomputing transition failed for transition_index ="
        f" {transition_index}, vehicle_index = {route.get('vehicleIndex', 0)}:"
        f" {err}"
    ) from err


def recompute_travel_steps_from_transitions(route: ShipmentRoute) -> None:
  """Re-creates travel steps in `route` from its transitions."""
  transitions = get_transitions(route)
  if not transitions:
    # Unused vehicle. Remove previous travelSteps if there were any.
    route.pop("travelSteps", None)
    return
  travel_steps: list[TravelStep] = []
  route["travelSteps"] = travel_steps

  for transition in transitions:
    travel_step = {
        "duration": transition.get("travelDuration", "0s"),
        "distanceMeters": transition.get("travelDistanceMeters", 0),
    }
    if (polyline := transition.get("routePolyline")) is not None:
      travel_step["routePolyline"] = polyline
    travel_steps.append(travel_step)


def get_num_decreasing_visit_times(
    model: ShipmentModel,
    route: ShipmentRoute,
    consider_visit_duration: bool,
) -> int:
  """Computes the number of occurrences of decreasing visit time on a route.

  A decreasing visit time happens when the start time of visit N is smaller than
  the start time of visit N - 1 + the duration of visit N - 1. This is typically
  a consequence of injecting live traffic information into a solution, where a
  previously feasible solution becomes infeasible due to increased travel times.

  Args:
    model: The model in which the computation is done.
    route: The route for which the computation is done.
    consider_visit_duration: When True, the start of visit N is compared with
      the start of visit N - 1 + its duration; when False, only the starts of
      both visits are compared.

  Returns:
    The number of occurrences of decreasing visit time on the route.
  """
  visits = get_visits(route)
  if not visits:
    return 0
  last_visit_time = parse_time_string(route["vehicleStartTime"])
  num_decreasing_visit_times = 0
  for visit in visits:
    visit_time = parse_time_string(visit["startTime"])
    if visit_time < last_visit_time:
      num_decreasing_visit_times += 1
    last_visit_time = visit_time
    if consider_visit_duration:
      last_visit_time += get_visit_request_duration(
          get_visit_request(model, visit)
      )
  if parse_time_string(route["vehicleEndTime"]) < last_visit_time:
    num_decreasing_visit_times += 1
  return num_decreasing_visit_times


def update_time_string(
    time_string: TimeString, delta: datetime.timedelta
) -> TimeString:
  """Takes the time from `times_string` and adds `delta` to it."""
  timestamp = parse_time_string(time_string)
  updated_timestamp = timestamp + delta
  return as_time_string(updated_timestamp)


def parse_time_string(time_string: TimeString) -> datetime.datetime:
  """Parses the time string and converts it into a datetime."""
  if time_string.endswith("Z") or time_string.endswith("z"):
    # datetime.fromisoformat() doesn't understand the Zulu suffix; replace it
    # with an explicit UTC time zone suffix.
    time_string = time_string[:-1] + "+00:00"
  timestamp = datetime.datetime.fromisoformat(time_string)
  if timestamp.tzinfo is None:
    # If the timestamp did not have an explicit time zone, assume that it is in
    # the local time zone, convert it to UTC and add an explicit time zone.
    timestamp = timestamp.astimezone(datetime.timezone.utc)
  return timestamp


def as_time_string(timestamp: datetime.datetime) -> TimeString:
  """Formats timestampt to a string format used in the CFR JSON API."""
  if timestamp.tzinfo is None:
    # If `timestamp` is a naive time, assume that it is in the local time zone,
    # convert it to UTC, and add explicit time zone information.
    timestamp = timestamp.astimezone(datetime.timezone.utc)
  date_string = timestamp.isoformat()
  if date_string.endswith("+00:00"):
    # If the time is in UTC, replace the numeric time zone suffix with the Zulu
    # suffix.
    date_string = date_string[:-6] + "Z"
  return date_string


def parse_duration_string(
    duration: DurationString | None,
) -> datetime.timedelta:
  """Parses the duration string and converts it to a timedelta.

  Args:
    duration: The duration in the string format "{number_of_seconds}s" or None.

  Returns:
    The duration as a timedelta object. Returns a zero timedelta if `duration`
    is None.

  Raises:
    ValueError: When the duration string does not have the right format.
  """
  if duration is None:
    return datetime.timedelta(0)
  if not duration.endswith("s"):
    raise ValueError(f"Unexpected duration string format: '{duration}'")
  seconds = float(duration[:-1])
  return datetime.timedelta(seconds=seconds)


def as_duration_string(delta: datetime.timedelta) -> DurationString:
  """Converts a timedelta to a duration string."""
  return f"{delta.total_seconds():g}s"


def encode_polyline(polyline: Sequence[LatLng]) -> str:
  """Encodes a sequence of latlng pairs to a string.

  Uses the encoding algorithm as described in the Google maps documentation at
  https://developers.google.com/maps/documentation/utilities/polylinealgorithm.

  Args:
    polyline: A sequence of latlng pairs to be encoded.

  Returns:
    A string that contains the encoded polyline.
  """
  chunks = []

  def encode_varint(value: int):
    value = value << 1
    if value < 0:
      value = ~value
    if value == 0:
      chunks.append(63)
    else:
      while value != 0:
        chunk = value & 31
        value = value >> 5
        if value != 0:
          chunk = chunk | 32
        chunks.append(chunk + 63)

  previous_lat = 0
  previous_lng = 0
  for latlng in polyline:
    lat = round(latlng["latitude"] * 1e5)
    lng = round(latlng["longitude"] * 1e5)
    encode_varint(lat - previous_lat)
    encode_varint(lng - previous_lng)
    previous_lat = lat
    previous_lng = lng

  return bytes(chunks).decode("ascii")


def _decoded_varints(encoded_string: str) -> Iterable[int]:
  """Extracts int values from a varint-encoded string."""
  decoded_int = 0
  shift_bits = 0
  for chunk in encoded_string.encode("ascii"):
    chunk -= 63
    if chunk < 0:
      raise ValueError("Invalid varint encoding")
    decoded_int += (chunk & 31) << shift_bits
    is_last_chunk = chunk & 32 == 0
    if is_last_chunk:
      if decoded_int & 1 == 1:
        decoded_int = ~decoded_int
      yield decoded_int >> 1
      decoded_int = 0
      shift_bits = 0
    else:
      shift_bits += 5
  if shift_bits != 0:
    # The last chunk had the "another chunk follows" bit set.
    raise ValueError("Invalid varint encoding")


def decode_polyline(encoded_polyline: str) -> Sequence[LatLng]:
  """Decodes a sequence of latlng pairs from a string.

  Uses the encoding algorithm as described in the Google Maps documentation at
  https://developers.google.com/maps/documentation/utilities/polylinealgorithm.

  Args:
    encoded_polyline: The encoded polyline in the string format.

  Returns:
    The polyline as a sequence of points.

  Raises:
    ValueError: When the string has incorrect format.
  """
  lat_lngs = []
  lat_e5 = 0
  lng_e5 = 0
  varint_iter = iter(_decoded_varints(encoded_polyline))
  try:
    for lat_e5_delta, lng_e5_delta in zip(
        varint_iter, varint_iter, strict=True
    ):
      lat_e5 += lat_e5_delta
      lng_e5 += lng_e5_delta
      lat_lngs.append({"latitude": lat_e5 / 1e5, "longitude": lng_e5 / 1e5})
  except ValueError as err:
    if "zip()" in str(err):
      raise ValueError("Longitude is missing.") from None
    raise

  return lat_lngs


def _get_route_polyline_points(
    transition: Transition,
) -> Sequence[LatLng] | None:
  route_polyline = transition.get("routePolyline")
  if route_polyline is None:
    return None
  polyline_points = route_polyline.get("points")
  if polyline_points is None:
    return None
  return decode_polyline(polyline_points)


def merge_polylines_from_transitions(
    transitions: Sequence[Transition],
) -> EncodedPolyline | None:
  """Returns an encoded polyline that merges polylines from `transitions`.

  The merged polyline is a polyline that contains points from all the polylines
  of `transitions`, in the order in which they appear in `transitions`. Removes
  duplicate points from the merged polylines (i.e. it is safe that the end of
  the polyline of transitions[i] has the same coordinates as the start of the
  polyline of transitions[i+1]).

  Requires that either all transitions with non-zero traveled distance have a
  polyline (and in this case returns a merged polyline) or that none has it (and
  returns None).

  Args:
    transitions: The sequence of transitions to merge polylines from.

  Returns:
    When all transitions have a polyline, returns an encoded merged polyline for
    all the transitions. When neither of them has it, returns None.

  Raises:
    ValueError: When some but not all transitions with non-zero traveled
      distance have a polyline.
  """
  merged_points: list[LatLng] = []
  num_present_polylines = 0
  num_absent_polylines = 0
  for transition in transitions:
    route_points = _get_route_polyline_points(transition)
    transition_distance = transition.get("travelDistanceMeters", 0)
    if route_points is None and transition_distance == 0:
      # When the next visit is at the same location, there is no polyline even
      # if all other transitions have one. Just move on to the next transition.
      continue
    if route_points is None:
      num_absent_polylines += 1
      continue
    assert route_points is not None
    num_present_polylines += 1
    for lat_lng in route_points:
      if not merged_points or merged_points[-1] != lat_lng:
        merged_points.append(lat_lng)
  if num_present_polylines > 0 and num_absent_polylines > 0:
    raise ValueError(
        "Either all transitions with non-zero traveled distance must have a"
        " polyline or none may have it."
    )
  if not merged_points:
    return None
  return {"points": encode_polyline(merged_points)}


def make_optional_time_window(
    start_time: TimeString | None, end_time: TimeString | None
) -> TimeWindow | None:
  """Creates a time window from start/end times if possible.

  Args:
    start_time: An optional start time of the time window.
    end_time: An optional end time of the time window.

  Returns:
    None when both arguments are None. Otherwise, returns a time window that
    uses the times that were provided as its bounds.
  """
  if start_time is None and end_time is None:
    return None
  time_window = {}
  if start_time is not None:
    time_window["startTime"] = start_time
  if end_time is not None:
    time_window["endTime"] = end_time
  return time_window


def make_optional_visit(
    latlng: tuple[float, float] | None = None,
    duration: DurationString | None = None,
    start: TimeString | None = None,
    end: TimeString | None = None,
    tags: Collection[str] | None = None,
) -> VisitRequest | None:
  """Creates a VisitRequest from parameters if possible.

  Args:
    latlng: The coordinates of the visit.
    duration: An optional duration of the visit.
    start: An optional start of a time window for the visit.
    end: An optional end of a time window for the visit.
    tags: An optional collection of tags added to the visit.

  Returns:
    None when all arguments are None. Otherwise, returns a visit request for the
    given coordinates. When `duration` is not None, the visit has the given
    duration. When `start` or `end` are not None, the visit has a time window
    that uses `start` and `end` as its hard bounds.
  """
  if latlng is None:
    if (
        duration is not None
        or start is not None
        or end is not None
        or tags is not None
    ):
      raise ValueError(
          "latlng must be provided when any other argument is not None"
      )
    return None

  visit = {
      "arrivalWaypoint": {
          "location": {
              "latLng": {
                  "latitude": latlng[0],
                  "longitude": latlng[1],
              }
          }
      },
  }
  if duration is not None:
    visit["duration"] = duration
  time_window = make_optional_time_window(start, end)
  if time_window is not None:
    visit["timeWindows"] = [time_window]
  if tags is not None:
    visit["tags"] = list(tags)
  return visit


def make_shipment(
    label: str,
    *,
    pickup_latlng: tuple[float, float] | None = None,
    pickup_duration: DurationString | None = None,
    pickup_start: TimeString | None = None,
    pickup_end: TimeString | None = None,
    pickup_tags: Collection[str] | None = None,
    delivery_latlng: tuple[float, float] | None = None,
    delivery_duration: DurationString | None = None,
    delivery_start: TimeString | None = None,
    delivery_end: TimeString | None = None,
    delivery_tags: Collection[str] | None = None,
    load_demands: Mapping[str, int] | None = None,
    allowed_vehicle_indices: Sequence[int] | None = None,
    cost_per_vehicle: Mapping[int, float] | None = None,
) -> Shipment:
  """Creates a shipment from simplified arguments.

  This function is intended mainly for creation of inputs for tests and does not
  support all features provided by the API. In particular, the new shipment can
  have at most one delivery location which can have at most one time window.
  When more complex setup is required, the data must be modified afterwards.

  When `delivery_start` or `delivery_end` are not None, the shipment will have a
  single delivery time window that is bounded by these times. When only one of
  them is provided, the delivery time window will be bounded only from that
  side. When neither is provided, the shipment will not have a delivery time
  window and it will be deliverable at any time.

  Args:
    label: The label of the new shipment.
    pickup_latlng: The (lat, lng) coordinates of the pickup, in degrees. Must be
      provided when any other pickup args are provided.
    pickup_duration: An optional pickup duration of the shipment.
    pickup_start: An optional start time of the pickup time window.
    pickup_end: An optional end time of the pickup time window.
    pickup_tags: An optional collection of visit tags applied to the pickup.
    delivery_latlng: The (lat, lng) coordinates of the delivery, in degrees.
      Must be provided when any other delivery args are provided.
    delivery_duration: An optional delivery duration of the shipment.
    delivery_start: An optional start of the delivery time window.
    delivery_end: An optional end of the delivery time window.
    delivery_tags: An optional collection of visit tags applied to the delivery.
    load_demands: Optional load demands of the shipment in the form of a mapping
      from load name to the required amount. When None, the shipment does not
      have any load demands.
    allowed_vehicle_indices: The list of allowed vehicle indices. When None, the
      new shipment will not have an explicit list of allowed vehicle indices.
    cost_per_vehicle: Optional costs per vehicle for the shipment in the form of
      a mapping from vehicle indices to their cost.

  Returns:
    A new Shipment object following the specification from the arguments.

  Raises:
    ValueError: When the shipment parameters are inconsistent. See the error
      message of the raised exception for more details.
  """
  shipment = {
      "label": label,
  }

  try:
    pickup = make_optional_visit(
        latlng=pickup_latlng,
        duration=pickup_duration,
        start=pickup_start,
        end=pickup_end,
        tags=pickup_tags,
    )
    if pickup is not None:
      shipment["pickups"] = [pickup]
  except ValueError as e:
    raise ValueError("Pickup args are inconsistent.") from e

  try:
    delivery = make_optional_visit(
        latlng=delivery_latlng,
        duration=delivery_duration,
        start=delivery_start,
        end=delivery_end,
        tags=delivery_tags,
    )
    if delivery is not None:
      shipment["deliveries"] = [delivery]
  except ValueError as e:
    raise ValueError("Delivery args are inconsistent.") from e

  if allowed_vehicle_indices is not None:
    shipment["allowedVehicleIndices"] = list(allowed_vehicle_indices)
  if load_demands is not None:
    shipment["loadDemands"] = {
        unit: {"amount": str(amount)} for unit, amount in load_demands.items()
    }
  if cost_per_vehicle is not None:
    vehicle_indices, costs = zip(*cost_per_vehicle.items())
    shipment["costsPerVehicle"] = list(costs)
    shipment["costsPerVehicleIndices"] = list(vehicle_indices)
  return shipment


def make_vehicle(
    label: str,
    depot_latlng: tuple[float, float],
    start_time: tuple[TimeString | None, TimeString | None] | None = None,
    start_tags: Collection[str] | None = None,
    end_time: tuple[TimeString | None, TimeString | None] | None = None,
    end_tags: Collection[str] | None = None,
    travel_mode: int = 1,
    cost_per_hour: float = 60,
    cost_per_kilometer: float = 1,
) -> Vehicle:
  """Creates a vehicle from simplified arguments.

  This function is intended mainly for creation of inputs for tests and does not
  support all features provided by the API.

  Args:
    label: The label of the new vehicle.
    depot_latlng: The (lat, lng) coordinates of the depot of the vehicle. The
      same coordinates are used as both the starting and the ending location of
      the vehicle.
    start_time: The start time window of the vehicle, specified as a pair
      (earliest_start, latest_start); both times are hard constraints.
    start_tags: The visit tags applied to the vehicle start.
    end_time: The end time window of the vehicle, specified as a pair
      (earliest_end, latest_end); both times are hard constraints.
    end_tags: The visit tags applied to the vehicle end.
    travel_mode: The travel mode of the vehicle.
    cost_per_hour: The cost per hour of the work of the vehicle.
    cost_per_kilometer: The cost per a kilometer traveled by the vehicle.

  Returns:
    A new vehicle object following the specification from the arguments.
  """
  vehicle = {
      "label": label,
      "travelMode": travel_mode,
      "travelDurationMultiple": 1,
      "costPerHour": cost_per_hour,
      "costPerKilometer": cost_per_kilometer,
      "startWaypoint": {
          "location": {
              "latLng": {
                  "latitude": depot_latlng[0],
                  "longitude": depot_latlng[1],
              }
          }
      },
      "endWaypoint": {
          "location": {
              "latLng": {
                  "latitude": depot_latlng[0],
                  "longitude": depot_latlng[1],
              }
          }
      },
  }
  start_time_window = (
      None if start_time is None else make_optional_time_window(*start_time)
  )
  if start_time_window is not None:
    vehicle["startTimeWindows"] = [start_time_window]
  if start_tags is not None:
    vehicle["startTags"] = list(start_tags)
  end_time_window = (
      None if end_time is None else make_optional_time_window(*end_time)
  )
  if end_time_window is not None:
    vehicle["endTimeWindows"] = [end_time_window]
  if end_tags is not None:
    vehicle["endTags"] = list(end_tags)
  return vehicle


def get_all_visit_tags(model: ShipmentModel) -> Set[str]:
  """Returns the set of all visit tags that appear in the model."""
  tags = set()
  for shipment in get_shipments(model):
    pickups = shipment.get("pickups", ())
    deliveries = shipment.get("deliveries", ())
    for visit in itertools.chain(pickups, deliveries):
      tags.update(visit.get("tags", ()))

  for vehicle in model.get("vehicles", ()):
    tags.update(vehicle.get("startTags", ()))
    tags.update(vehicle.get("endTags", ()))

  return tags


def get_num_elements_in_label(shipment: Shipment) -> int:
  """Returns the number of elements in the label of a shipment.

  Assumes that the label of a shipment contains a comma-separated list of
  elements.

  Args:
    shipment: The shipment for which the number of elements is computed.

  Returns:
    The number of elements in the label. If the shipment doesn't have a label,
    the label is an empty string or it does not contain a comma, returns 1.
  """
  label = shipment.get("label", "")
  return label.count(",") + 1
