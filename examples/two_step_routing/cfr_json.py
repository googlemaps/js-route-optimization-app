# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

"""Data structures and functions for working with CFR JSON requests."""

import collections
from collections.abc import Collection, Iterable, Mapping, Sequence
import datetime
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
  allowLargeDeadlineDespiteInterruptionRisk: bool

  populatePolylines: bool
  populateTransitionPolylines: bool


class Visit(TypedDict, total=False):
  """Represents a single visit on a route in the JSON CFR results."""

  shipmentIndex: int
  shipmentLabel: str
  startTime: TimeString
  detour: str
  isPickup: bool


class EncodedPolyline(TypedDict, total=False):
  """Represents an encoded polyline in the JSON CFR results."""

  points: str


class Transition(TypedDict, total=False):
  """Represents a single transition on a route in the JSON CFR results."""

  travelDuration: DurationString
  travelDistanceMeters: int
  waitDuration: DurationString
  totalDuration: DurationString
  startTime: TimeString
  routePolyline: EncodedPolyline


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

  routePolyline: EncodedPolyline


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


def combined_load_demands(shipments: Collection[Shipment]) -> dict[str, Load]:
  """Computes the combined load demands of all shipments in `shipments`."""
  demands = collections.defaultdict(int)
  for shipment in shipments:
    shipment_demands = shipment.get("loadDemands")
    if shipment_demands is None:
      continue
    for unit, amount in shipment_demands.items():
      demands[unit] += int(amount.get("amount", 0))
  return {unit: {"amount": str(amount)} for unit, amount in demands.items()}


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
    # Drop the 'Z', we do not need it for parsing.
    time_string = time_string[:-1]
  return datetime.datetime.fromisoformat(time_string)


def as_time_string(timestamp: datetime.datetime) -> TimeString:
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
) -> VisitRequest | None:
  """Creates a VisitRequest from parameters if possible.

  Args:
    latlng: The coordinates of the visit.
    duration: An optional duration of the visit.
    start: An optional start of a time window for the visit.
    end: An optional end of a time window for the visit.

  Returns:
    None when all arguments are None. Otherwise, returns a visit request for the
    given coordinates. When `duration` is not None, the visit has the given
    duration. When `start` or `end` are not None, the visit has a time window
    that uses `start` and `end` as its hard bounds.
  """
  if latlng is None:
    if duration is not None or start is not None or end is not None:
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
  return visit


def make_shipment(
    label: str,
    *,
    pickup_latlng: tuple[float, float] | None = None,
    pickup_duration: DurationString | None = None,
    pickup_start: TimeString | None = None,
    pickup_end: TimeString | None = None,
    delivery_latlng: tuple[float, float] | None = None,
    delivery_duration: DurationString | None = None,
    delivery_start: TimeString | None = None,
    delivery_end: TimeString | None = None,
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
    delivery_latlng: The (lat, lng) coordinates of the delivery, in degrees.
      Must be provided when any other delivery args are provided.
    delivery_duration: An optional delivery duration of the shipment.
    delivery_start: An optional start of the delivery time window.
    delivery_end: An optional end of the delivery time window.
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
    end_time: tuple[TimeString | None, TimeString | None] | None = None,
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
    end_time: The end time window of the vehicle, specified as a pair
      (earliest_end, latest_end); both times are hard constraints.
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
  end_time_window = (
      None if end_time is None else make_optional_time_window(*end_time)
  )
  if end_time_window is not None:
    vehicle["endTimeWindows"] = [end_time_window]
  return vehicle
