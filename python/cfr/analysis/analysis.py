"""Contains helper functions and classes for CFR reuqest/response analysis."""

import collections
from collections.abc import Mapping, Sequence, Set
import dataclasses
import datetime
import functools
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
  """

  all_parking_tags: Set[str]
  vehicles_by_parking: Mapping[str, Mapping[int, Sequence[int]]]
  consecutive_visits: Mapping[int, Sequence[tuple[str, int]]]
  non_consecutive_visits: Mapping[int, Sequence[tuple[str, int]]]
  shipments_by_parking: Mapping[str, Sequence[Sequence[int]]]


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

  vehicle_consecutive_visits = collections.defaultdict(list)
  vehicle_non_consecutive_visits = collections.defaultdict(list)

  shipments_by_parking = collections.defaultdict(list)

  for vehicle_index, route in enumerate(routes):
    visits = route.get("visits", ())
    vehicle_label = route.get("vehicleLabel", f"vehicle {vehicle_index}")
    current_parking_tag = None
    parking_tag_left_in_previous_visit = None
    for visit in visits:
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

      if (
          arrival_tag is None
          and departure_tag is None
          and current_parking_tag is not None
      ):
        # This is a shipment served from a parking location.
        shipments_by_parking[current_parking_tag][-1].append(shipment_index)
        pass

      parking_tag_left_in_previous_visit = None

  return ParkingLocationData(
      all_parking_tags=all_parking_tags,
      vehicles_by_parking=vehicles_by_parking,
      consecutive_visits=vehicle_consecutive_visits,
      non_consecutive_visits=vehicle_non_consecutive_visits,
      shipments_by_parking=shipments_by_parking,
  )


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
