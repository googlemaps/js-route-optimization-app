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

"""Contains helper functions for the local models in two-step routing."""

from collections.abc import Iterable, Mapping, Sequence
import datetime
from typing import Any, TypeVar

from . import _parking
from . import _shared
from ..json import cfr_json


def make_shipment(
    original_shipment_index: int,
    original_shipment: cfr_json.Shipment,
    parking: _parking.ParkingLocation,
    parking_vehicle_indices: list[int],
    parking_tags: _parking.ParkingLocationTags,
) -> cfr_json.Shipment:
  """Creates a shipment for a local pickup & delivery model.

  Assumes that `original_shipment` is a shipment from the original model and
  that it has either a single pickup or a single delivery at a customer address.
  Creates a new shipment that has the same load requirement, the same pickup or
  delivery, and a delivery or pickup to match it at the parking location.

  Args:
    original_shipment_index: The index of the shipment in the original model.
    original_shipment: The shipment definition in the original model.
    parking: The parking location from which the shipment is delivered or picked
      up.
    parking_vehicle_indices: The indices of the vehicles in the local model that
      can perform this shipment.
    parking_tags: The transition attribute tags used for the parking location.

  Returns:
    A new pickup & delivery shipment that can be used in a pickup & delivery
    local model.

  Raises:
    ValueError: When the inputs are invalid or when the original shipment does
      not have the required information.
  """
  delivery = cfr_json.get_delivery_or_none(original_shipment)
  pickup = cfr_json.get_pickup_or_none(original_shipment)
  is_pickup = pickup is not None
  if (delivery is None) == (pickup is None):
    raise ValueError(
        "A shipment must have either a just pickup or just a delivery."
    )

  # Create a visit request for the shipment address.
  shipment_visit = pickup or delivery
  assert shipment_visit is not None

  local_shipment_visit: cfr_json.VisitRequest = {
      "arrivalWaypoint": cfr_json.get_arrival_waypoint(shipment_visit),
  }
  if (duration := shipment_visit.get("duration")) is not None:
    local_shipment_visit["duration"] = duration
  if (tags := shipment_visit.get("tags")) is not None:
    local_shipment_visit["tags"] = [*tags, parking_tags.local_visit_tag]
  else:
    local_shipment_visit["tags"] = [parking_tags.local_visit_tag]
  if (time_windows := shipment_visit.get("timeWindows")) is not None:
    local_shipment_visit["timeWindows"] = time_windows

  # Create a visit request for the parking location.
  parking_visit: cfr_json.VisitRequest = {
      "arrivalWaypoint": parking.waypoint_for_local_model,
      "tags": [
          parking.tag,
          parking_tags.local_load_to_vehicle_tag
          if is_pickup
          else parking_tags.local_unload_from_vehicle_tag,
      ],
  }
  parking_visit_duration = (
      parking.load_duration_per_item
      if is_pickup
      else parking.unload_duration_per_item
  )
  if parking_visit_duration is not None and parking_visit_duration != "0s":
    parking_visit["duration"] = parking_visit_duration

  local_pickup = local_shipment_visit if is_pickup else parking_visit
  local_delivery = parking_visit if is_pickup else local_shipment_visit

  local_shipment: cfr_json.Shipment = {
      "pickups": [local_pickup],
      "deliveries": [local_delivery],
      "label": (
          f"{original_shipment_index}: {original_shipment.get('label', '')}"
      ),
      "allowedVehicleIndices": parking_vehicle_indices,
  }
  # Preserve load demands.
  if (load_demands := original_shipment.get("loadDemands")) is not None:
    local_shipment["loadDemands"] = load_demands

  return local_shipment


def make_vehicle(
    options: _shared.Options, parking: _parking.ParkingLocation, label: str
) -> cfr_json.Vehicle:
  """Creates a vehicle for the local model from a given parking location.

  Args:
    options: The options of the two-step planner.
    parking: The parking location for which the vehicle is created.
    label: The label of the new vehicle.

  Returns:
    The newly created vehicle.
  """
  vehicle: cfr_json.Vehicle = {
      "label": label,
      # Start and end waypoints.
      "endWaypoint": parking.waypoint_for_local_model,
      "startWaypoint": parking.waypoint_for_local_model,
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
  if parking.avoid_indoor is not None:
    vehicle["routeModifiers"] = {"avoidIndoor": parking.avoid_indoor}
  if parking.max_round_duration is not None:
    vehicle["routeDurationLimit"] = {
        "maxDuration": parking.max_round_duration,
    }
  load_limits: dict[str, cfr_json.LoadLimit] = {}

  def get_or_create_load_limit(unit: str) -> cfr_json.LoadLimit:
    load_limit = load_limits.get(unit)
    if load_limit is None:
      load_limit: cfr_json.LoadLimit = {}
      load_limits[unit] = load_limit
    assert load_limit is not None
    return load_limit

  if parking.delivery_load_limits is not None:
    for unit, max_load in parking.delivery_load_limits.items():
      load_limit = get_or_create_load_limit(unit)
      load_limit["maxLoad"] = str(max_load)

  if parking.cost_per_load_unit_per_kilometer is not None:
    for unit, load_cost in parking.cost_per_load_unit_per_kilometer.items():
      load_limit = get_or_create_load_limit(unit)
      load_limit["costPerKilometer"] = load_cost

  if parking.cost_per_load_unit_per_traveled_hour is not None:
    for unit, load_cost in parking.cost_per_load_unit_per_traveled_hour.items():
      load_limit = get_or_create_load_limit(unit)
      load_limit["costPerTraveledHour"] = load_cost

  if load_limits:
    vehicle["loadLimits"] = load_limits

  return vehicle


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


def get_route_start_time_windows(
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
    shipment_index = get_shipment_index_from_visit(visit)
    shipment = shipments[shipment_index]
    if visit_is_to_parking(visit, shipment=shipment):
      # Visits requests for the parking exist only in the local model; they do
      # not exist in the original model. But they also never have a time window,
      # so we can just skip them.
      continue

    deliveries = shipment.get("deliveries", ())
    pickups = shipment.get("pickups", ())

    # When True, the shipment contains only a single pickup request; otherwise,
    # the shipment contains only a single delivery request.
    shipment_is_pickup = bool(pickups)

    visit_request = pickups[0] if shipment_is_pickup else deliveries[0]
    time_windows = visit_request.get("timeWindows")
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


def visit_is_to_parking(
    local_visit: cfr_json.Visit,
    shipment: cfr_json.Shipment | None = None,
    shipments: Sequence[cfr_json.Shipment] | None = None,
) -> bool:
  """Checks whether a visit on a local route is to the parking location.

  We say that a shipment is a "pickup" if it has only one pickup and no
  deliveries; we say it's a "delivery" when it has only one delivery and no
  pickups.
  For a pickup shipment, the visit is to the parking when it is a delviery;
  For a delivery shipment, the visit is to the parking when it is a pickup.

  Args:
    local_visit: A visit in the solution of a local model.
    shipment: The shipment from the original model performed in `local_visit`.
    shipments: The list of all shipments from the original model. Exactly one of
      `shipment` and `shipments` must not be None.

  Returns:
    True when local_visit is to the parking location; False, when it is to the
    customer address.
  """
  if (shipment is None) == (shipments is None):
    raise ValueError(
        "Exactly one of `shipment` and `shipments` must be specified."
    )
  if shipment is None:
    shipment_index = get_shipment_index_from_visit(local_visit)
    shipment = shipments[shipment_index]

  deliveries = shipment.get("deliveries", ())
  pickups = shipment.get("pickups", ())
  if len(deliveries) + len(pickups) != 1:
    raise ValueError(
        "Only shipments with exactly one visit request are supported."
    )
  shipment_is_pickup = bool(pickups)
  visit_is_pickup = local_visit.get("isPickup", False)
  return visit_is_pickup != shipment_is_pickup


def remove_wait_time_from_unload_transitions(
    visits: Sequence[cfr_json.Visit],
    transitions: Sequence[cfr_json.Transition],
    shipments: Sequence[cfr_json.Shipment],
) -> None:
  """Removes any wait time in transitions between unloading items from vehicle.

  Assumes that the visits and transitions are from a pickup & delivery local
  route model, and that they are from a single visit round. When the round
  starts with unloading items from the vehicle, removes any wait time from the
  transitions between the visits, and pushes the start times towards the first
  delivery visit.

  This does not affect feasibility of the route, because the unload visits never
  have a time window.

  On the other hand, we do not need to do the same to load visits at the end of
  the delivery round (if any); they would be removed by the solver as part of
  minimizing the total route duration.

  Args:
    visits: The visits of the local visit round.
    transitions: The corresponding transitions.
    shipments: The list of shipments in the local model.
  """
  assert len(visits) + 1 == len(transitions)

  # Find the index of the first visit that is not an unload at the parking
  # location.
  unload_visit_end = 0
  for unload_visit_end, visit in enumerate(visits):
    if not visit_is_to_parking(visit, shipments=shipments):
      break

  if unload_visit_end == 0:
    return

  cumulated_wait_time = datetime.timedelta()
  for visit_index in range(unload_visit_end - 1, -2, -1):
    transition_out = transitions[visit_index + 1]
    transition_out_wait_duration = cfr_json.parse_duration_string(
        transition_out.get("waitDuration", "0s")
    )
    transition_out["totalDuration"] = cfr_json.as_duration_string(
        cfr_json.parse_duration_string(
            transition_out.get("totalDuration", "0s")
        )
        - transition_out_wait_duration
    )
    cumulated_wait_time += transition_out_wait_duration
    transition_out["waitDuration"] = "0s"
    transition_out["startTime"] = cfr_json.update_time_string(
        transition_out["startTime"], cumulated_wait_time
    )
    if visit_index >= 0:
      visit = visits[visit_index]
      visit["startTime"] = cfr_json.update_time_string(
          visit["startTime"], cumulated_wait_time
      )


def make_local_shipment_from_shipment_map(
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


def get_shipment_index_from_visit(visit: cfr_json.Visit) -> int:
  return _get_shipment_index_from_local_label(visit["shipmentLabel"])


def _get_shipment_index_from_local_shipment(
    local_shipment: cfr_json.Shipment,
) -> int:
  local_shipment_label = local_shipment.get("label", "")
  return _get_shipment_index_from_local_label(local_shipment_label)


def get_shipment_indices_from_visits(
    shipments: Sequence[cfr_json.Shipment],
    visits: Sequence[cfr_json.Visit],
) -> Sequence[int]:
  """Returns the list of shipment indices from a route in the local model.

  Args:
    shipments: The shipments from the original model.
    visits: The list of visits from a route that is from a solution of the local
      model. Shipment labels in the visit must follow the format used in the
      local model.

  Raises:
    ValueError: When some of the shipment labels do not follow the expected
      format.
  """
  shipment_indices = []
  for visit in visits:
    shipment_index = get_shipment_index_from_visit(visit)
    shipment = shipments[shipment_index]
    if not visit_is_to_parking(visit, shipment=shipment):
      shipment_indices.append(shipment_index)
  return shipment_indices


def get_parking_tag_from_route(route: cfr_json.ShipmentRoute) -> str:
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


def _format_time_window(
    time_window: tuple[str | None, str | None],
) -> Iterable[str]:
  """Formats a single time window in a parking group key."""
  start, end = time_window
  yield "("
  if start is not None:
    yield "start="
    yield start
  if start is not None and end is not None:
    yield " "
  if end is not None:
    yield "end="
    yield end
  yield ")"


def make_vehicle_label(group_key: _parking.GroupKey) -> str:
  """Creates a label for a vehicle in the local model."""
  parts = [group_key.parking_tag, " ["]
  num_initial_parts = len(parts)

  def add_part(keyword: str, value: Any):
    if len(parts) > num_initial_parts:
      parts.append(" ")
    parts.append(keyword)
    parts.append(str(value))

  if group_key.time_windows:
    parts.append("time_windows=")
    for time_window in group_key.time_windows:
      parts.extend(_format_time_window(time_window))
  if group_key.allowed_vehicle_indices is not None:
    add_part("vehicles=", group_key.allowed_vehicle_indices)
  if group_key.penalty_cost_group is not None:
    add_part("penalty_cost=", group_key.penalty_cost_group)
  parts.append("]")
  return "".join(parts)
