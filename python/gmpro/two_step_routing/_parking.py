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

"""Parking location data structures and functions for two-step routing.

This module should not be imported directly. Use the interfaces provided by
two_step_routing.py instead.
"""

import argparse
from collections.abc import Callable, Mapping, Sequence
import copy
import dataclasses
import functools
from typing import Any, TypeAlias

from ..json import cfr_json


@dataclasses.dataclass(frozen=True)
class GroupKey:
  """A key used to group shipments into parking groups.

  A parking group is a group of shipments that are delivered from the same
  parking location and that are planned as a group by the global model. The goal
  of this class is that shipments with the same key can be grouped in the local
  and global models.

  Attributes:
    parking_tag: The tag of the parking location from which the shipment is
      delivered.
    time_windows: The list of delivery time windows for the shipment. Empty when
      the shipment does not have a delivery time window.
    allowed_vehicle_indices: The list of vehicle indices that can deliver the
      shipment.
    penalty_cost_group: The penalty cost/penalty cost group of the shipment.
      Contains `None` when grouping by penalty cost is not used or the value
      returned by `InitialLocalModelGrouping.get_penalty_cost_group` when it is
      provided.
  """

  parking_tag: str | None = None
  time_windows: tuple[tuple[str | None, str | None], ...] = ()
  allowed_vehicle_indices: tuple[int, ...] | None = None
  penalty_cost_group: str | None = None


def _no_penalty_cost_grouping(shipment: cfr_json.Shipment) -> str | None:
  """Implements "no grouping by penalty cost"."""
  del shipment  # Unused.
  return None


def _penalty_cost_per_item(shipment: cfr_json.Shipment) -> str | None:
  """Groups shipments by their penalty cost per item in the shipment.

  The number of items in a shipment is determined as the number of
  comma-separated components in the label of the shipment. The group name is the
  penalty cost per item in a string format, or None when the shipment is
  mandatory.

  Args:
    shipment: The shipment for which the penalty cost per item is computed.

  Returns:
    None for mandatory shipments. Otherwise, returns a string that contains the
    penaltyCost per item of the shipment in a string format.
  """
  penalty_cost = shipment.get("penaltyCost")
  if penalty_cost is None:
    return None
  # TODO(ondrasej): Allow other ways to determine the number of items in the
  # shipment.
  num_items = shipment.get("label", "").count(",") + 1
  return str(penalty_cost / num_items)


@dataclasses.dataclass(frozen=True)
class InitialLocalModelGrouping:
  """Specifies how shipments are grouped in the initial local model.

  Shipments are always grouped by parking location and allowed vehicle indices.
  The fields of this class allow additional grouping.

  Attributes:
    time_windows: The shipments are grouped by their delivery time windows.
    get_penalty_cost_group: A function that returns the transformed penalty cost
      of the shipment used for the initial grouping of the shipments in the
      local model.
  """

  time_windows: bool = False
  get_penalty_cost_group: Callable[[cfr_json.Shipment], str | None] = (
      _no_penalty_cost_grouping
  )

  @classmethod
  def from_string(cls, options: str) -> "InitialLocalModelGrouping":
    """Creates the grouping specification from command-line flags.

    Args:
      options: The grouping options in a string format. Expects a
        comma-separated list of option names.

    Returns:
      A new instance of this class.

    Raises:
      ArgumentTypeError: When parsing of the options fails.
    """
    time_windows = False
    get_penalty_cost_group = _no_penalty_cost_grouping
    for option in options.split(","):
      match option:
        case "":
          break
        case "time_windows":
          time_windows = True
        case "penalty_cost_per_item":
          get_penalty_cost_group = _penalty_cost_per_item
        case _:
          raise argparse.ArgumentTypeError(
              f"Unknown grouping option {option!r}, possible values are"
              " 'time_windows' and 'penalty_cost_per_item'"
          )
    return cls(
        time_windows=time_windows,
        get_penalty_cost_group=get_penalty_cost_group,
    )


# The type of parking location tags. Technically, this is a string, but we use
# an alias with a different name to make this apparent from type annotations
# alone.
ParkingTag: TypeAlias = str


# A dummy waypoint used when no other waypoint is provided during the
# construction of a ParkingLocation. We can't use None for the initialization,
# because that would require adding `| None` to the type annotation, and then
# checking for None everywhere even though we always have a valid waypoint.
_PARKING_WAYPOINT_SENTINEL: cfr_json.Waypoint = {
    "location": {"latLng": {"latitude": 0, "longitude": 0}}
}


@dataclasses.dataclass(frozen=True)
class ParkingLocation:
  """Defines one parking location for the planner.

  Attributes:
    coordinates: Only for initialization & deprecated. The coordinates of the
      parking location. Converted to `waypoint` during the construction of the
      object. Exactly one of `coordinates` and `waypoint` must be provided.
    waypoint: The driving-specific waypoint for the parking location. When
      delivering a shipment using two-step delivery, the driver first parks
      at this waypoint, and then uses a different mode of transport to the final
      delivery locations, which may use other waypoints. Exactly one of
      `coordinates` and `waypoint` must be provided.
    local_waypoint: The local-specific waypoint for the parking location.
      When delivering a shipment using two-step delivery, after parking at the
      `waypoint`, the driver walks out to the final delivery locations using the
      `local_waypoint`. If not provided, the `waypoint` is used for local.
    avoid_u_turns: Specifies whether u-turn avoidance should be applied to the
      parking location waypoint.
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
    avoid_indoor: The value of the `routeModifiers.avoidIndoor` option used in
      local delivery routes from this parking location. When `None`, the option
      will not be set. This option can be set to True only for when walking
      directions are used, i.e. when `travel_mode` == 2.
    delivery_load_limits: The load limits applied when delivering shipments from
      the parking location. This is equivalent to Vehicle.loadLimits, and it
      restricts the number of shipments that can be delivered without returning
      to the parking location. When the number of shipments delivered from the
      parking location exceeds this limit, the model will create multiple routes
      starting and ending at the parking location that will appear as multiple
      visits to the parking location in the global model. Since the local model
      allows only very limited cost tuning, we accept only one value per unit,
      and this value is used as the hard limit.
    cost_per_load_unit_per_kilometer: The distance-based energy cost. This is
      the cost per unit of load per traveled kilometer with the load. The key in
      the dict is the name of the unit, same as in `delivery_load_limits`.
    cost_per_load_unit_per_traveled_hour: The time-based energy cost. This is
      the cost per unit of load per traveled hour with the load. The key in the
      dict is the name of the unit, same as in `delivery_load_limits`.
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
    unload_duration_per_item: The amount of time needed to pick up one item from
      the truck before delivering it to a client from the parking location. This
      duration takes place right after the arrival to the parking.
    load_duration_per_item: The amount of time needed to store one item to the
      truck after picking it up from a client from the parking location. This
      duration takes place just after the return to the parking from the local
      route.
    arrival_cost: The cost of entering the parking location. The cost is applied
      when a vehicle enters the parking location from another location.
    departure_cost: The cost of leaving the parking location. The cost is
      applied when a vehicle leaves the parking location for another location.
    reload_cost: The cost of visiting the parking location between two
      consecutive delivery rounds from the parking location.
  """

  tag: str

  waypoint: cfr_json.Waypoint = dataclasses.field(
      default_factory=lambda: _PARKING_WAYPOINT_SENTINEL
  )
  local_waypoint: cfr_json.Waypoint = dataclasses.field(
      default_factory=lambda: _PARKING_WAYPOINT_SENTINEL
  )
  coordinates: dataclasses.InitVar[cfr_json.LatLng | None] = None

  travel_mode: int = 1
  travel_duration_multiple: float = 1.0

  avoid_indoor: bool | None = None
  avoid_u_turns: bool | None = None

  delivery_load_limits: Mapping[str, int] | None = None
  cost_per_load_unit_per_kilometer: Mapping[str, cfr_json.LoadCost] | None = (
      None
  )
  cost_per_load_unit_per_traveled_hour: (
      Mapping[str, cfr_json.LoadCost] | None
  ) = None

  max_round_duration: cfr_json.DurationString | None = None

  arrival_duration: cfr_json.DurationString | None = None
  departure_duration: cfr_json.DurationString | None = None
  reload_duration: cfr_json.DurationString | None = None

  unload_duration_per_item: cfr_json.DurationString | None = None
  load_duration_per_item: cfr_json.DurationString | None = None

  arrival_cost: float = 0.0
  departure_cost: float = 0.0
  reload_cost: float = 0.0

  def __post_init__(self, coordinates: cfr_json.LatLng | None):
    has_waypoint = self.waypoint is not _PARKING_WAYPOINT_SENTINEL
    has_coordinates = coordinates is not None
    if has_waypoint == has_coordinates:
      raise ValueError(
          "Exactly one of `waypoint` and `coordinates` must be provided."
      )

    if has_coordinates:
      object.__setattr__(
          self, "waypoint", {"location": {"latLng": coordinates}}
      )

    if self.avoid_indoor and self.travel_mode != 2:
      raise ValueError("`avoid_indoor` can be True only when travel_mode == 2.")

  @functools.cached_property
  def waypoint_for_local_model(self) -> cfr_json.Waypoint:
    """Returns a waypoint for parking to be used in local models.

    Local models typically use travel modes other than DRIVE. This method
    returns the local waypoint if it is provided, otherwise it returns the
    global waypoint. It is not compatible with sideOfRoad.  To allow using
    `sideOfRoad` in parking location waypoints (so that it is used in the global
    model), we need to remove it from the waypoint when it is used in a local
    model.

    Returns:
      The waypoint for the parking location based on the travel mode. When the
      travel mode of the parking location is not DRIVE, `sideOfRoad` is removed
      from the waypoint. The returned object is cached and must not be mutated.
    """
    if self.travel_mode == 1:
      return self.waypoint
    if self.local_waypoint is not _PARKING_WAYPOINT_SENTINEL:
      return self.local_waypoint
    waypoint = copy.deepcopy(self.waypoint)
    waypoint.pop("sideOfRoad", None)
    return waypoint


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
  except (TypeError, ValueError):
    raise ValueError(
        f"Invalid parking location specification: {parking_location_json!r}"
    ) from None
  except KeyError:
    raise ValueError(
        "parking_json doesn't have the key 'parking_locations'"
    ) from None
  return parking_locations, parking_for_shipment


@dataclasses.dataclass(frozen=True)
class ParkingLocationTags:
  """Holds tags used by the library for a parking location.

  The tags are created by TransitionAttributeManager in such a way that
  they do not collide with any other tags in the original request.

  Attributes:
    global_tag: The tag used for the parking location in the global model.
    local_unload_from_vehicle_tag: The tag used for the visits in the local
      model where items that are delivered to customers from the parking are
      picked up from the vehicle.
    local_load_to_vehicle_tag: The tag used for the visits in the local model
      where items that are picked up from customers delivered to the vehicle at
      the parking.
    local_visit_tag: The tag used for the visits to customer addresses from the
      parking location.
    local_barrier_pickup_tag: The tag used for the pickup part of barrier
      shipments in the parking.
    local_barrier_delivery_tag: The tag used for the delivery part of barrier
      shipments in the parking.
    has_global_transition_attributes: True when the parking location requires
      parking-specific transition attributes at the global level.
  """

  global_tag: str
  local_unload_from_vehicle_tag: str
  local_load_to_vehicle_tag: str
  local_visit_tag: str
  local_barrier_pickup_tag: str
  local_barrier_delivery_tag: str

  has_global_transition_attributes: bool


# Defines a mapping from shipments to the parking locations from which they are
# delivered. The key of the map is the index of a shipment in the request, and
# the value is the label of the parking location through which it is delivered.
ShipmentParkingMap = Mapping[int, ParkingTag]


class TransitionAttributeManager:
  """Manages transition attributes for parking locations in the global model."""

  def __init__(self, model: cfr_json.ShipmentModel):
    """Initializes the transition attribute manager."""
    self._existing_tags = cfr_json.get_all_visit_tags(model)
    self._cached_parking_transition_tags: dict[
        ParkingTag, ParkingLocationTags
    ] = {}
    # TODO(ondrasej): Restrict the preserved transition attributes only to tags
    # that are actually used in the model, to make the model smaller.
    self._global_transition_attributes: list[cfr_json.TransitionAttributes] = (
        list(model.get("transitionAttributes", ()))
    )
    self._local_transition_attributes: list[cfr_json.TransitionAttributes] = (
        list(model.get("transitionAttributes", ()))
    )
    self._local_refinement_transition_attributes: list[
        cfr_json.TransitionAttributes
    ] = list(model.get("transitionAttributes", ()))

  @property
  def global_transition_attributes(self) -> list[cfr_json.TransitionAttributes]:
    """Returns transition attributes for the global model."""
    return self._global_transition_attributes

  @property
  def local_transition_attributes(self) -> list[cfr_json.TransitionAttributes]:
    """Returns transition attributes for the local model."""
    return self._local_transition_attributes

  @property
  def local_refinement_transition_attributes(
      self,
  ) -> list[cfr_json.TransitionAttributes]:
    """Returns the transition attributes for the local refinement model."""
    return self._local_refinement_transition_attributes

  def get_or_create(self, parking: ParkingLocation) -> ParkingLocationTags:
    """Creates parking transition attribute for a parking location if needed.

    When the parking location uses arrival/departure/reload costs or delays,
    creates transition attributes for the parking location that implement them.
    Does nothing when the parking location doesn't use any of these features.

    Can be safely called multiple times for the same parking location.

    Args:
      parking: The parking location for which the transition attributes are
        created.

    Returns:
      When the parking location has features that require transition attributes,
      returns a unique tag for visits to the parking location. Otherwise,
      returns None.
    """
    cached_tags = self._cached_parking_transition_tags.get(parking.tag)
    if cached_tags is not None:
      return cached_tags

    global_tag = self._get_non_existent_tag(f"parking: {parking.tag}")
    local_load_to_vehicle_tag = self._get_non_existent_tag(
        f"{parking.tag} load to vehicle"
    )
    local_unload_from_vehicle_tag = self._get_non_existent_tag(
        f"{parking.tag} unload from vehicle"
    )
    local_visit_tag = self._get_non_existent_tag(f"{parking.tag} visit")
    local_barrier_pickup_tag = self._get_non_existent_tag(
        f"{parking.tag} barrier pickup"
    )
    local_barrier_delivery_tag = self._get_non_existent_tag(
        f"{parking.tag} barrier delivery"
    )

    has_global_transition_attributes = self._add_transition_attribute_if_needed(
        self._global_transition_attributes,
        delay=parking.arrival_duration,
        cost=parking.arrival_cost,
        excluded_src_tag=global_tag,
        dst_tag=global_tag,
    )
    has_global_transition_attributes |= (
        self._add_transition_attribute_if_needed(
            self._global_transition_attributes,
            delay=parking.departure_duration,
            cost=parking.departure_cost,
            src_tag=global_tag,
            excluded_dst_tag=global_tag,
        )
    )
    has_global_transition_attributes |= (
        self._add_transition_attribute_if_needed(
            self._global_transition_attributes,
            delay=parking.reload_duration,
            cost=parking.reload_cost,
            src_tag=global_tag,
            dst_tag=global_tag,
        )
    )

    # Add transition attributes that make multi-round local routes more
    # expensive than splitting them into two routes. This way, we can depend on
    # the solver to split them instead of having to implement the route
    # splitting logic when working with the local model.
    # The two transition attributes below cover the two cases that can
    # happen when returning to the parking location after a visit round, and
    # before the start of another visit round.
    # TODO(ondrasej): Parameterize the cost and delay.

    # 1. Avoid picking up more items from the vehicle after storing items picked
    # up from customers.
    self._add_transition_attribute_if_needed(
        self._local_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_load_to_vehicle_tag,
        dst_tag=local_unload_from_vehicle_tag,
    )
    # 2. Avoid picking up more items from the vehicle after delivering items to
    # the customers.
    self._add_transition_attribute_if_needed(
        self._local_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_visit_tag,
        dst_tag=local_unload_from_vehicle_tag,
    )
    # 3. Avoid visiting customer locations after loading items collected from
    # customers to the truck.
    self._add_transition_attribute_if_needed(
        self._local_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_load_to_vehicle_tag,
        dst_tag=local_visit_tag,
    )

    # Add transition attributes for local refinement models:
    #
    # Add transition attributes for a reload, if needed. The reload cost and
    # delay apply either between the last visit and the first unloaded item in
    # the next round, or between the last loaded item and the first unloaded
    # items. By definition, only one of the situations can happen, and the delay
    # and cost are applied only once, and only when there are multiple rounds.
    self._add_transition_attribute_if_needed(
        self._local_refinement_transition_attributes,
        delay=parking.reload_duration,
        cost=parking.reload_cost,
        src_tag=local_visit_tag,
        dst_tag=local_barrier_pickup_tag,
    )
    self._add_transition_attribute_if_needed(
        self._local_refinement_transition_attributes,
        delay=parking.reload_duration,
        cost=parking.reload_cost,
        src_tag=local_load_to_vehicle_tag,
        dst_tag=local_barrier_pickup_tag,
    )
    # Make the barrier the only viable way from a customer location visit or
    # loading items to the vehicle to unloading items from the vehicle.
    self._add_transition_attribute_if_needed(
        self._local_refinement_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_visit_tag,
        dst_tag=local_unload_from_vehicle_tag,
    )
    self._add_transition_attribute_if_needed(
        self._local_refinement_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_load_to_vehicle_tag,
        dst_tag=local_unload_from_vehicle_tag,
    )
    self._add_transition_attribute_if_needed(
        self._local_refinement_transition_attributes,
        delay="7200s",
        cost=1000000,
        src_tag=local_load_to_vehicle_tag,
        dst_tag=local_visit_tag,
    )

    cached_tags = ParkingLocationTags(
        global_tag=global_tag,
        local_load_to_vehicle_tag=local_load_to_vehicle_tag,
        local_unload_from_vehicle_tag=local_unload_from_vehicle_tag,
        local_visit_tag=local_visit_tag,
        local_barrier_pickup_tag=local_barrier_pickup_tag,
        local_barrier_delivery_tag=local_barrier_delivery_tag,
        has_global_transition_attributes=has_global_transition_attributes,
    )

    self._cached_parking_transition_tags[parking.tag] = cached_tags
    return cached_tags

  def _add_transition_attribute_if_needed(
      self,
      transition_attribute_list: list[cfr_json.TransitionAttributes],
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
    transition_attribute_list.append(transition_attributes)
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


# TODO(ondrasej): Move this function to a better place.
def get_visit_request(
    shipment: cfr_json.Shipment,
) -> tuple[cfr_json.VisitRequest, bool]:
  """Returns the pickup or delivery request of shipment.

  Args:
    shipment: The shipment to return the visit request from.

  Returns:
    A tuple (visit_request, is_pickup) where `visit_request` is the visit
    request from the shipment, and `is_pickup` is True when the shipment is a
    pickup shipment.

  Raises:
    ValueError: When the shipment has no visit requests or when it has multiple
      visit requests.
  """
  pickups = shipment.get("pickups", ())
  deliveries = shipment.get("deliveries", ())
  if len(pickups) + len(deliveries) != 1:
    raise ValueError(
        "Expected the shipment to have either a single pickup request or a"
        f" single delivery request. Got:\n{shipment}"
    )
  return (pickups[0], True) if pickups else (deliveries[0], False)


def shipment_group_key(
    grouping: InitialLocalModelGrouping,
    shipment: cfr_json.Shipment,
    parking: ParkingLocation | None,
) -> GroupKey:
  """Creates a key that groups shipments with the same time window and parking."""
  if parking is None:
    return GroupKey()
  parking_tag = parking.tag

  allowed_vehicle_indices = shipment.get("allowedVehicleIndices")
  if allowed_vehicle_indices is not None:
    allowed_vehicle_indices = tuple(sorted(allowed_vehicle_indices))

  time_windows = ()
  if grouping.time_windows:
    delivery, _ = get_visit_request(shipment)
    time_windows = tuple(
        (time_window.get("startTime"), time_window.get("endTime"))
        for time_window in delivery.get("timeWindows", ())
    )

  return GroupKey(
      parking_tag=parking_tag,
      time_windows=time_windows,
      allowed_vehicle_indices=allowed_vehicle_indices,
      penalty_cost_group=grouping.get_penalty_cost_group(shipment),
  )
