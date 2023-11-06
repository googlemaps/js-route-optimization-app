"""Contains helper functions and classes for CFR reuqest/response analysis."""

import collections
from collections.abc import Collection, Iterable, Mapping, Sequence, Set
import dataclasses
import datetime
import functools
import math
from typing import Any

from ..json import cfr_json
from ..two_step_routing import two_step_routing


@dataclasses.dataclass(frozen=True)
class ParkingLocationData:
  """Contains aggregated data about parking locations.

  Attributes:
    all_parking_tags: The set of all parking location tags that are visited in
      the solution. Note that parking locations that are not visited by any
      vehicle do not appear in the solution and by consequence, do not appear in
      this set.
    vehicles_by_parking: For each parking tag, contains a mapping from vehicle
      indices to the list of indices of the visits made by this vehicle.
    consecutive_visits: The per-vehicle list of consecutive visits to a parking
      location. The key of the mapping is the vehicle index, values are lists of
      visits to a parking location. Each element of this list is a pair
      (parking_tag, visit_index) such that
      `shipments_by_parking[parking_tag][visit_index]` is the visit that
      generated the entry.
    non_consecutive_visits: The per-vehicle list of non-consecutive visits to a
      parking location. The format is the same as for consecutive_visits.
    shipments_by_parking: The list of parking location visits, indexed by the
      parking tag. The value is a list of lists of shipment indices. Each
      element of the outer list corresponds to one visit to the parking location
      and the elements of the inner list are the shipments delivered during this
      visit.
    global_visits: The list of visits from the global model, i.e. visits made by
      the vehicle while driving. The keys of the mapping are vehicle indices,
      the values are the list of global visit for each vehicle. Each visit is
      represented as a triple `(parking_tag, arrival_visit, departure_visit)`.
      When the global visit is a shipment delivered directly, `parking_tag` is
      `None`, and `arrival_visit` and `departure_visit` are both the index of
      the visit in the route. When the global visit is a sequence of deliveries
      through a parking location, then `parking_tag` is the tag of the parking
      location, `arrival_visit` is the index of the visit to the "arrival to
      parking" virtual shipment, and `departure_visit` is the index of the visit
      to the "departure from parking" virtual shipment. When there are multiple
      visits to the same parking location (a "parking ping-pong"), each delivery
      round has its own entry in the list.
  """

  all_parking_tags: Set[str]
  vehicles_by_parking: Mapping[str, Mapping[int, Sequence[int]]]
  consecutive_visits: Mapping[int, Sequence[tuple[str, int]]]
  non_consecutive_visits: Mapping[int, Sequence[tuple[str, int]]]
  shipments_by_parking: Mapping[str, Sequence[Sequence[int]]]
  global_visits: Mapping[
      int, Sequence[tuple[two_step_routing.ParkingTag | None, int, int]]
  ]


@dataclasses.dataclass
class Scenario:
  """Holds data from a single scenario.

  Attributes:
    name: A unique name of the scenario. Used as unique key for the scenario,
      and as an index in the data frames used throughout the notebook.
    scenario: The JSON data of the scenario.
    solution: The JSON data of the solution.
    parking_json: The parking location data in the JSON format.
    parking_locations: The list of parking locations indexed by the parking
      location tags.
    parking_for_shipment: The assignment of shipments to parking locations. The
      keys are shipment indices; the values are the parking location tags for
      the shipments.
    parking_location_data: Contains aggregated data about parking locations for
      the scenario.
  """

  name: str
  scenario: cfr_json.OptimizeToursRequest
  solution: cfr_json.OptimizeToursResponse
  parking_json: dataclasses.InitVar[Any] = None
  parking_locations: Mapping[str, two_step_routing.ParkingLocation] | None = (
      None
  )
  parking_for_shipment: Mapping[int, str] | None = None
  parking_location_data: ParkingLocationData = dataclasses.field(init=False)

  def __post_init__(self, parking_json: Any | None) -> None:
    super().__init__()
    self.parking_location_data = get_parking_location_aggregate_data(self)
    if parking_json is not None:
      if (
          self.parking_locations is not None
          or self.parking_for_shipment is not None
      ):
        raise ValueError(
            "Either only parking_json or only parking_locations and"
            " parking_for_shipment can not be None."
        )
      parking_locations, self.parking_for_shipment = (
          two_step_routing.load_parking_from_json(parking_json)
      )
      self.parking_locations = {}
      for parking_location in parking_locations:
        if parking_location.tag in self.parking_locations:
          raise ValueError(
              f"Duplicate parking location tag: {parking_location.tag}"
          )
        self.parking_locations[parking_location.tag] = parking_location
    if (self.parking_locations is not None) != (
        self.parking_for_shipment is not None
    ):
      raise ValueError(
          "parking_locations and parking_for_shipment must either both be None"
          " or both be not None."
      )
    if self.parking_locations is None:
      # Create empty parking data structures, so that we do not need to do too
      # much branching in the code below.
      self.parking_locations = {}
      self.parking_for_shipment = {}

  @property
  def model(self) -> cfr_json.ShipmentModel:
    """Returns model of the scenario."""
    return self.scenario["model"]

  @property
  def shipments(self) -> Sequence[cfr_json.Shipment]:
    """Returns the list of shipments in the scenario."""
    return self.model.get("shipments", ())

  @property
  def vehicles(self) -> Sequence[cfr_json.Vehicle]:
    """Returns the list of vehicles in the scenario."""
    return self.model.get("vehicles", ())

  @property
  def routes(self) -> Sequence[cfr_json.ShipmentRoute]:
    """Returns the list of routes in the scenario."""
    return self.solution.get("routes", ())

  @property
  def skipped_shipments(self) -> Sequence[cfr_json.SkippedShipment]:
    """Returns the list of skipped shipments in the scenario."""
    return self.solution.get("skippedShipments", ())

  @functools.cached_property
  def skipped_shipment_indices(self) -> Set[int]:
    """Returns the set of skipped shipment indices in the solution."""
    return set(
        skipped_shipment.get("index", 0)
        for skipped_shipment in self.skipped_shipments
    )

  @functools.cached_property
  def vehicle_for_shipment(self) -> Mapping[int, int]:
    """Returns a mapping from a shipment to the vehicle that serves it.

    Skipped shipments are not included.

    Returns:
      A mapping where the key is a shipment index and the value is a vehicle
      index.
    """
    vehicle_for_shipment = {}
    for vehicle_index, route in enumerate(self.routes):
      for visit in route.get("visits", ()):
        shipment_index = visit.get("shipmentIndex", 0)
        vehicle_for_shipment[shipment_index] = vehicle_index
    return vehicle_for_shipment

  def vehicle_label(self, vehicle_index: int) -> str:
    """Returns the label of a vehicle."""
    return self.vehicles[vehicle_index].get("label", "")


def get_parking_location_aggregate_data(
    scenario: Scenario,
) -> ParkingLocationData:
  """Collects aggregated parking location data from a scenario."""

  routes = scenario.routes
  all_parking_tags = set()
  # The number of visits to each parking location by each vehicle.
  visits_by_vehicle = collections.defaultdict(
      functools.partial(collections.defaultdict, int)
  )
  # The set of vehicles that are used to serve the given parking.
  vehicles_by_parking = collections.defaultdict(
      functools.partial(collections.defaultdict, list)
  )
  # Visits from the global model for each vehicle.
  global_visits_by_vehicle: dict[
      int, list[tuple[two_step_routing.ParkingTag | None, int, int]]
  ] = {}

  vehicle_consecutive_visits = collections.defaultdict(list)
  vehicle_non_consecutive_visits = collections.defaultdict(list)

  shipments_by_parking = collections.defaultdict(list)

  for vehicle_index, route in enumerate(routes):
    visits = route.get("visits", ())
    vehicle_label = route.get("vehicleLabel", f"vehicle {vehicle_index}")
    current_parking_tag = None
    current_parking_arrival_visit = None
    parking_tag_left_in_previous_visit = None
    global_visits: list[tuple[two_step_routing.ParkingTag | None, int, int]] = (
        []
    )
    global_visits_by_vehicle[vehicle_index] = global_visits
    for visit_index, visit in enumerate(visits):
      label = visit.get("shipmentLabel")
      shipment_index = visit.get("shipmentIndex", 0)
      departure_tag = consume_suffix(label, " departure")
      if departure_tag is not None:
        if current_parking_tag != departure_tag:
          raise ValueError(
              "Parking tag mismatch for a departure. Expected"
              f" {current_parking_tag!r}, found {departure_tag!r}."
          )
        all_parking_tags.add(departure_tag)
        global_visits.append(
            (current_parking_tag, current_parking_arrival_visit, visit_index)
        )
        parking_tag_left_in_previous_visit = departure_tag
        current_parking_tag = None
        continue
      arrival_tag = consume_suffix(label, " arrival")
      if arrival_tag is not None:
        if current_parking_tag is not None:
          raise ValueError(
              f"Unexpected arrival to parking {arrival_tag!r}, currently in"
              f" parking {current_parking_tag!r}"
          )
        current_parking_tag = arrival_tag
        current_parking_arrival_visit = visit_index
        parking_visit_index = len(shipments_by_parking[arrival_tag])
        parking_visit_tuple = (arrival_tag, parking_visit_index)

        parking_vehicles = vehicles_by_parking[arrival_tag]
        if parking_tag_left_in_previous_visit == arrival_tag:
          # This is a consecutive visit to the parking location.
          vehicle_consecutive_visits[vehicle_index].append(parking_visit_tuple)
        elif vehicle_index in parking_vehicles:
          # parking_tag_left_in_previous_visit != arrival_tag holds because of
          # the previous if statement. This is a non-consecutive visit to this
          # parking by this vehicle.
          vehicle_non_consecutive_visits[vehicle_index].append(
              parking_visit_tuple
          )

        visits_by_vehicle[vehicle_label][arrival_tag] += 1
        parking_vehicles[vehicle_index].append(parking_visit_index)
        shipments_by_parking[arrival_tag].append([])

      if arrival_tag is None and departure_tag is None:
        # This is a "normal" shipment.
        if current_parking_tag is not None:
          # This is a shipment served from a parking location.
          shipments_by_parking[current_parking_tag][-1].append(shipment_index)
        else:
          # This is a shipment delivered directly from the vehicle.
          global_visits.append((None, visit_index, visit_index))

      parking_tag_left_in_previous_visit = None

  return ParkingLocationData(
      all_parking_tags=all_parking_tags,
      vehicles_by_parking=vehicles_by_parking,
      consecutive_visits=vehicle_consecutive_visits,
      non_consecutive_visits=vehicle_non_consecutive_visits,
      shipments_by_parking=shipments_by_parking,
      global_visits=global_visits_by_vehicle,
  )


def get_shipments_in_visit_range(
    model: cfr_json.ShipmentModel,
    route: cfr_json.ShipmentRoute,
    first_visit_index: int,
    last_visit_index: int,
) -> Iterable[cfr_json.Shipment]:
  """Iterates over shipments from a range of visits on a route.

  Args:
    model: Them model from which the shipments are taken.
    route: The route from which the shipments are taken.
    first_visit_index: The index of the first visit in the range (inclusive)
    last_visit_index: The index of the last visit in the range (inclusive).

  Yields:
    The shipment objects for the visits in the range.
  """
  shipments = cfr_json.get_shipments(model)
  visits = cfr_json.get_visits(route)
  for visit_index in range(first_visit_index, last_visit_index + 1):
    visit = visits[visit_index]
    shipment_index = visit.get("shipmentIndex", 0)
    yield shipments[shipment_index]


def get_num_shipments_in_visit_range(
    model: cfr_json.ShipmentModel,
    route: cfr_json.ShipmentRoute,
    first_visit_index: int,
    last_visit_index: int,
) -> tuple[int, int]:
  """Returns the number of CFR and actual shipments in a range of visits.

  Args:
    model: The model from which the shipments are taken.
    route: The route from which the visits are taken.
    first_visit_index: The index of the first visit in the range (inclusive)
    last_visit_index: The index of the last visit in the range (inclusive).

  Returns:
    A tuple `(num_cfr_shipments, num_actual_shipments)` where
    `num_cfr_shipments` is the number of CFR shipment objects that appear in the
    range (effectively, last_visit_index - first_visit_index + 1) and
    `num_actual_shipments` is the sum of the number of items in each shipment
    (where the number of items is determined as the number of comma-separated
    elements in the shipment label).
  """
  num_cfr_shipments = 0
  num_actual_shipments = 0
  for shipment in get_shipments_in_visit_range(
      model, route, first_visit_index, last_visit_index
  ):
    num_cfr_shipments += 1
    num_actual_shipments += cfr_json.get_num_elements_in_label(shipment)
  return num_cfr_shipments, num_actual_shipments


def group_global_visits(
    scenario: Scenario,
    vehicle_index: int,
) -> Iterable[
    tuple[two_step_routing.ParkingTag, int, Sequence[cfr_json.Shipment]]
]:
  """Iterates over groups of "global" visits and their shipments on a route.

  Each item yielded by this function is either a single shipment that is
  delivered directly from the truck or a visit to a parking location covering
  all delivery rounds from this location.

  Args:
    scenario: The scenario from which this data is taken.
    vehicle_index: The index of the vehicle for which the iteration is done.

  Yields:
    A sequence of triples `(parking_tag, num_rounds, shipments)` where each
    triple represents one group of "global" visits.

    When the global visit is a shipment that is delivered directly,
    `parking_tag` is `None`, `num_rounds` is 1, and `shipments` is a list that
    contains only one shipment.

    When the global visit is a sequence of visits to a parking location, then
    `parking_tag` is the tag of the parking location, `num_rounds` is the number
    of delivery rounds in the sequence (the number of visits in the global model
    used by the two_step_routing library), and `shipments` is the list of
    shipments delivered in all delivery rounds in the group.
  """
  parking_data = scenario.parking_location_data
  route = scenario.routes[vehicle_index]
  visits = cfr_json.get_visits(route)
  shipments = scenario.shipments

  global_visits = parking_data.global_visits.get(vehicle_index, ())
  num_global_visits = len(global_visits)

  global_visit_index = 0
  while global_visit_index < num_global_visits:
    parking_tag, arrival_visit_index, departure_visit_index = global_visits[
        global_visit_index
    ]
    if parking_tag is None:
      # Shipment delivered directly.
      shipment_index = visits[arrival_visit_index].get("shipmentIndex", 0)
      yield (None, 1, (shipments[shipment_index],))
      global_visit_index += 1
      continue

    group_shipments = list(
        get_shipments_in_visit_range(
            scenario.model,
            route,
            arrival_visit_index + 1,
            departure_visit_index - 1,
        )
    )
    num_rounds = 1
    for i in range(global_visit_index + 1, num_global_visits):
      next_parking_tag, arrival_visit_index, departure_visit_index = (
          global_visits[i]
      )
      if next_parking_tag != parking_tag:
        break
      group_shipments.extend(
          get_shipments_in_visit_range(
              scenario.model,
              route,
              arrival_visit_index + 1,
              departure_visit_index - 1,
          )
      )
      num_rounds += 1
      # After the last iteration of this loop, global_visit_index will be the
      # index of the last global visit in this (potential) ping-pong.
      global_visit_index += 1

    yield (parking_tag, num_rounds, group_shipments)

    global_visit_index += 1


def get_num_ping_pongs(
    scenario: Scenario,
    vehicle_index: int,
) -> tuple[int, int]:
  """Computes the number of "parking ping-pongs" on a single route.

  A "parking ping-pong" is the situation where the vehicle visits a parking
  location multiple times in a row. This is typically needed when there are more
  shipments delivered from this parking location than what can be delivered in
  one round, but it may also appear as an artifact of the two_step_routing
  planner that may split deliveries from a parking location to smaller groups to
  make planning easier.

  This function computes the total number of ping-pongs on the route, and
  estimates the number of "undesirable" cases where the driver returns to the
  parking location more often than required by the delivery capacity from the
  parking.

  Args:
    scenario: The scenario in which the number of ping-pongs is computed.
    vehicle_index: The index of the vehicle for which the number of ping-pongs
      is computed.

  Returns:
    A tuple `(num_ping_pongs, num_bad_ping_pongs)` where `num_ping_pongs` is the
    total number of ping-pong cases on the route, and `num_bad_ping_pongs` is
    the number of bad ping-pongs on the route.
  """
  num_ping_pongs = 0
  num_bad_ping_pongs = 0
  for parking_tag, num_rounds, group_shipments in group_global_visits(
      scenario, vehicle_index
  ):
    if num_rounds == 1:
      # Not a ping-pong: either a shipment delivered directly from the vehicle,
      # or there is just one round of deliveries.
      continue

    assert parking_tag is not None
    parking = scenario.parking_locations[parking_tag]
    num_ping_pongs += 1

    num_shipments = 0
    for shipment in group_shipments:
      num_shipments += cfr_json.get_num_elements_in_label(shipment)

    # TODO(ondrasej): For simplicity, we assume that the highest delivery load
    # limit of the parking uses the number of shipments as a unit. This is a
    # very crude situation of the approximation, and we need to find a better
    # way to compute the actual delivery limits.
    max_shipments_per_round = (
        max(parking.delivery_load_limits.values())
        if parking.delivery_load_limits is not None
        else math.inf
    )
    max_allowed_rounds = math.ceil(num_shipments / max_shipments_per_round)
    if num_rounds > max_allowed_rounds:
      num_bad_ping_pongs += 1

  return num_ping_pongs, num_bad_ping_pongs


def get_time_windows_end(
    shipments: Collection[cfr_json.Shipment],
) -> datetime.datetime | None:
  """Returns the latest end of a delivery time window in `shipments`.

  Finds all shipments in `shipments` that have a delivery time window that is
  bounded from both sides, and returns the latest end time of such a time
  window.

  Args:
    shipments: The collection of shipments to inspect.

  Returns:
    The latest end of a delivery time window of `shipments`. Returns None when
    all shipments either do not have a delivery time window or their time
    windows are unbounded.
  """
  end = datetime.datetime.min.replace(tzinfo=datetime.timezone.utc)
  has_time_windows = False
  for shipment in shipments:
    for delivery in shipment.get("deliveries", ()):
      time_windows = delivery.get("timeWindows")
      if not time_windows:
        continue
      time_windows_start = time_windows[0].get("startTime")
      time_windows_end = time_windows[-1].get("endTime")
      if time_windows_end is None or time_windows_start is None:
        # NOTE(ondrasej): We consider a time window bounded only on one side as
        # "unbounded". This is necessarily an approximation but it may be
        # sufficient for simple cases.
        # TODO(ondrasej): Replace this computation with a computation similar to
        # two_step_routing._get_local_model_route_start_time_windows() to
        # compute how much the shipment can be moved forward or backwards.
        # The same TODO note applies also to get_time_windows_start() below.
        continue

      has_time_windows = True
      end = max(end, cfr_json.parse_time_string(time_windows_end))

  if has_time_windows:
    return end
  return None


def get_time_windows_start(
    shipments: Collection[cfr_json.Shipment],
) -> datetime.datetime | None:
  """Returns the earilest start of a time window in `shipments`.

  Finds all shipments in `shipments` that have a delivery time window that is
  bounded from both sides, and returns the earliest end time of such a time
  window.

  Args:
    shipments: The collection of shipments to inspect.

  Returns:
    The earliest start of a delivery time window of `shipments`. Returns None
    when all shipments either do not have a delivery time window or their time
    windows are unbounded.
  """
  start = datetime.datetime.max.replace(tzinfo=datetime.timezone.utc)
  has_time_windows = False
  for shipment in shipments:
    for delivery in shipment.get("deliveries", ()):
      time_windows = delivery.get("timeWindows")
      if not time_windows:
        continue
      time_windows_start = time_windows[0].get("startTime")
      time_windows_end = time_windows[-1].get("endTime")
      if time_windows_start is None or time_windows_end is None:
        # NOTE(ondrasej): Same note as in get_time_windows_end() applies also to
        # this function.
        continue

      has_time_windows = True
      start = min(start, cfr_json.parse_time_string(time_windows_start))

  if has_time_windows:
    return start
  return None


def get_num_sandwiches(
    scenario: Scenario, vehicle_index: int
) -> tuple[int, int]:
  """Returns the number of "parking sandwiches" on a single route.

  A "parking sandwich" is the situation where the vehicle visits a parking
  location A, then leaves it for other parking location B or a direct delivery,
  and only then comes back to parking A for another round of deliveries. This
  behavior is generally not desired, because it is confusing for the drivers.
  However, some parking sandwiches are unavoidable, because of delivery time
  windows. For example, when there are shipments with a morning delivery time
  window and shipments with an evening delivery time window, it is acceptable
  that the vehicle performs other shipments between these two time windows.

  This function computes the total number of sandwiches on the route, and
  estimates the number of "undesirable" cases when there is no time window
  forcing the driver to leave the parking and return to it later. In models with
  more complex constraints, it is very difficult to determine whether a sandwich
  is necessary or not.

  In this function, we estimate the undesirable ones purely on the basis of time
  windows of the shipments from the parking, for simplicity. We do this by
  looking at the latest end of a time window in the earlier visit to the
  parking, and at the earliest start of a time window in the later visit to the
  parking, and compare the two. If we see an overlap, we consider this the case
  of "bad" sandwich.

  However, note that the result is an approximation and there may be other
  reasons that lead to a parking sandwich, including time windows on other
  shipments (shipments delivered from other parking locations) or break requests
  of the vehicle, and finding an explanation for a certain parking sandwich may
  be very difficult.

  Args:
    scenario: The scenario in which the number of sandwiches is computed.
    vehicle_index: The index of the vehicle for which the number of sandwiches
      is computed.
  """
  num_sandwiches = 0
  num_bad_sandwiches = 0
  last_visit_to_parking = {}

  for parking_tag, _, group_shipments in group_global_visits(
      scenario, vehicle_index
  ):
    last_visit_shipments = last_visit_to_parking.get(parking_tag)
    if parking_tag is not None:
      last_visit_to_parking[parking_tag] = group_shipments
    if last_visit_shipments is None:
      # This is the first visit to this parking location.
      continue

    num_sandwiches += 1
    current_time_window_start = get_time_windows_start(group_shipments)
    previous_time_window_end = get_time_windows_end(last_visit_shipments)
    if (
        current_time_window_start is None
        or previous_time_window_end is None
        or current_time_window_start <= previous_time_window_end
    ):
      # Bad sandwich, at least one of them doesn't have a time window or they
      # overlap.
      # TODO(ondrasej): Replace this with a more precise computation based on
      # the possibility to shift the visit to the parking.
      num_bad_sandwiches += 1

  return num_sandwiches, num_bad_sandwiches


def get_vehicle_shipment_groups(
    model: cfr_json.ShipmentModel,
) -> Sequence[tuple[Set[int], Set[int]]]:
  """Returns grouping of vehicles and shipments by vehicle-shipment constraints.

  Uses `Shipment.allowedVehicleIndices` to group shipments by the vehicles that
  can serve them. The output of the function is a collection of pairs
  `(vehicles, shipments)` where `shipments` is a set of shipment indices, and
  `vehicles` is a set of vehicle indices such that for each shipment in
  `shipments`, its `allowedVehicleIndices` are exactly `vehicles`.

  As a consequence of this computation:
  - each shipment in the model appears in exactly one group.
  - each vehicle appears can appear in zero or more groups.

  Args:
    model: The model for which the grouping is computed.

  Returns:
    A collection of vehicle group/shipment group pairs. See above for a detailed
    description.
  """
  shipments = cfr_json.get_shipments(model)
  vehicles = cfr_json.get_vehicles(model)

  all_vehicles = frozenset(range(len(vehicles)))

  shipments_by_allowed_vehicles = collections.defaultdict(set)
  for shipment_index, shipment in enumerate(shipments):
    shipment_label = shipment.get("label", "")
    if shipment_label.endswith(" arrival") or shipment_label.endswith(
        " departure"
    ):
      continue
    allowed_vehicles = frozenset(
        shipment.get("allowedVehicleIndices", all_vehicles)
    )
    shipments_by_allowed_vehicles[allowed_vehicles].add(shipment_index)

  return tuple(shipments_by_allowed_vehicles.items())


def consume_suffix(text: str, suffix: str) -> str | None:
  """Consumes the suffix of a text.

  Args:
    text: The text from which the suffix is consumed.
    suffix: The suffix to be consumed.

  Returns:
    When `text` ends with `suffix`, returns `text` with `suffix` removed from
    the end. Otherwise, returns `None`.
  """
  if not text.endswith(suffix):
    return None
  return text[: -len(suffix)]


def get_vehicle_wait_hours(route: cfr_json.ShipmentRoute) -> datetime.timedelta:
  """Returns the amount of time the vehicle spends waiting along the route."""
  # NOTE(ondrasej): The two-step routing library did not always fill in metrics.
  # We need to be careful before reporting a zero if we don't see the metrics.
  # TODO(ondrasej): Raise an exception instead of this workaround, once we know
  # that the routes without metrics are rare enough.
  metrics = route.get("metrics")
  if metrics is not None:
    wait_duration = metrics.get("waitDuration")
    if wait_duration is not None:
      return cfr_json.parse_duration_string(wait_duration)

  wait_time = datetime.timedelta(0)
  for transition in cfr_json.get_transitions(route):
    wait_duration = transition.get("waitDuration", "0s")
    wait_time += cfr_json.parse_duration_string(wait_duration)

  return wait_time


def get_percentile_visit_time(
    model: cfr_json.ShipmentModel,
    route: cfr_json.ShipmentRoute,
    percent_rank: float,
    include_virtual_shipments: bool = False,
) -> tuple[datetime.datetime, datetime.datetime]:
  """Computes a percentile of shipment delivery times for a route.

  The percentile is computed both for CFR shipments (visits) and actual
  shipments.

  The percentile is the time by which at least `percent_rank`% of the shipments
  of the route are delivered (resp. at least `percent_rank`% of the visits of
  the route are made). Tracks the number of shipments delivered at each visit
  and returns the visit end time (i.e. the visit start time + duration) of the
  visit at which the last required shipment(s) (resp. visits) were performed.

  Note that for `percentile_rank` == 0, returns the start time of the route; for
  `percentile_rank` == 100, returns the end time of the last visit.

  Args:
    model: The model in which the percentile is computed.
    route: The route for which the percentile is computed.
    percent_rank: The rank of the computed percentile. This is a percent value
      that must be between 1 and 100.
    include_virtual_shipments: When False, the virtual "arrival" and "departure"
      shipments created by the two_step_routing library are not included in the
      stats; when True, they are included.

  Returns:
    A tuple `(visit_percentile_time, shipment_percentile_time)` where
    `visit_percentile_time` is the time when the vehicle completed at least
    `percentile_rank`% of visits on the route (i.e. CFR shipments), and
    `shipment_percentile_time` is the time when the vehicle delivered at least
    `percentile_rank`% of actual shipments (as determined by the number of
    comma-separated elements of shipment labels).

  Raises:
    ValueError: When percent_rank is outside of the interval [0, 100].
  """
  visits = cfr_json.get_visits(route)
  if not include_virtual_shipments:
    filtered_visits = []
    for visit in visits:
      shipment_label = visit.get("ShipmentLabel", "")
      if shipment_label.endswith(" arrival") or shipment_label.endswith(
          " departure"
      ):
        continue
      filtered_visits.append(visit)
    visits = filtered_visits

  if percent_rank == 0:
    start_time = cfr_json.parse_time_string(route["vehicleStartTime"])
    return start_time, start_time
  if percent_rank < 0 or percent_rank > 100:
    raise ValueError(f"Invalid percent rank {percent_rank}")

  num_visits = len(visits)
  num_shipments = 0
  for visit in visits:
    shipment_label = visit.get("label", "")
    num_shipments += shipment_label.count(",") + 1

  shipment_percentile = math.ceil(percent_rank * num_shipments / 100)
  visit_percentile = math.ceil(percent_rank * num_visits / 100)

  shipment_percentile_time = None
  visit_percentile_time = None
  seen_visits = 0
  seen_shipments = 0
  for visit in visits:
    seen_visits += 1
    shipment_label = visit.get("label", "")
    seen_shipments += shipment_label.count(",") + 1
    if seen_visits >= visit_percentile and visit_percentile_time is None:
      visit_request = cfr_json.get_visit_request(model, visit)
      visit_percentile_time = cfr_json.parse_time_string(
          visit["startTime"]
      ) + cfr_json.get_visit_request_duration(visit_request)
    if (
        seen_shipments >= shipment_percentile
        and shipment_percentile_time is None
    ):
      visit_request = cfr_json.get_visit_request(model, visit)
      shipment_percentile_time = cfr_json.parse_time_string(
          visit["startTime"]
      ) + cfr_json.get_visit_request_duration(visit_request)

  assert shipment_percentile_time is not None
  assert visit_percentile_time is not None

  return visit_percentile_time, shipment_percentile_time
