# Copyright 2025 Google LLC
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

"""Defines functions and data structures for merging shipments in a model.

Merging shipments may be a useful technique to reduce the size of GMPRO requests
and get better optimized routes faster:
- the complexity of the optimization problem grows very quickly with the input
  size. By reducing the number of shipments, you usually get either better
  optimization quality within the same deadline, or similar optimization quality
  in a shorter deadline.
- merging should be used for shipments that are usually performed together, i.e.
  they are for the same recipient or delivered to the same address within the
  same time windows and with the same other constraints. By merging them, you
  make the optimized routes closer to the expectations/preferences of the
  drivers.

On the other hand, merging shipments carries some risks, and it should be used
carefully:
- it decreases the granularity at which the solver can optimize. Merged
  shipments are either all performed, or all skipped, even if the vehicle would
  have time/resources to perform a subset of the merged shipment.
- when the durations or load demands of merged shipments are too large, it may
  be difficult to pack them to a vehicle, and this may create skipped shipments
  and vehicles used below capacity.
"""

from collections.abc import Collection, Iterable, Sequence
import dataclasses
import datetime
from typing import Self

from . import cfr_json
from . import human_readable


@dataclasses.dataclass(frozen=True)
class _VisitRequestToken:
  """A hashable token that represents a class of compatible visit requests.

  The main purpose of this (data)class is to be a small and immutable (hashable)
  object that can be used as a key in a dict, to group visit requests that are
  compatible for merging.

  Two visit requests are compatible for merging when they:
    - have the same time windows.
    - have the same arrival/departure locations.
    - have the same tags.
    - have the same visit types.
    - have the same u-turn avoidance configuration.

  Attributes:
    location_token: Contains a string representation of the location(s) of the
      visit request.
    time_windows_token: Contains a string representation of the time windows
      used by the visit request.
    tags: The set of tags applied to the visit request.
    visit_types: The set of visit types attached to the visit request.
    avoid_u_turns: The value of the avoid u-turns flag on the visit request.
  """

  location_token: str
  time_windows_token: str
  tags: frozenset[str] | None
  visit_types: frozenset[str] | None
  avoid_u_turns: bool

  @classmethod
  def from_visit_request(cls, visit_request: cfr_json.VisitRequest) -> Self:
    """Creates the token from a visit request in the JSON format."""
    tags = visit_request.get("tags")
    visit_types = visit_request.get("visitTypes")
    return cls(
        location_token=human_readable.visit_request_location(visit_request),
        time_windows_token=human_readable.time_windows(
            visit_request.get("timeWindows", ())
        ),
        tags=None if tags is None else frozenset(tags),
        visit_types=None if visit_types is None else frozenset(visit_types),
        avoid_u_turns=visit_request.get("avoidUTurns", False),
    )


@dataclasses.dataclass(frozen=True)
class _ShipmentToken:
  """A hashable token that represents a class of compatible shipments.

  The main purpose of this (data)class is to be a small and immutable (hashable)
  object that can be used as a key in a dict, to group shipments that are
  compatible for merging.

  Two shipments are compatible for merging when they:
    - have the same number of pickup visit requests, and their pickup visit
      requests at the same index are compatible for merging.
    - have the same number of delivery visit requests, and their delivery visit
      requests at the same index are compatible for merging.
    - have the same set of allowed vehicles.
    - are either both mandatory or both optional (their penalty costs may
      differ).
    - have the same shipment type (or they both do not have a shipment type).
    - have the same costs per vehicle (or they both do not specify costs per
      vehicle).

  Attributes:
    pickup_tokens: Sequence of tokens for the pickup visit requests, one token
      for each request, in the same order.
    delivery_tokens: Sequence of tokens for the delivery visit requests, one
      token for each request, in the same order.
    allowed_vehicle_indices: The sorted list of allowed vehicle indices. When
      empty, all vehicles are allowed.
    is_mandatory: True when the shipment is mandatory. Otherwise, False.
    shipment_type: Shipment type, when the type of the shipment is specified.
    costs_per_vehicle: The shipment-vehicle cost specification for this
      shipment, represented as a set of (vehicle_index, cost) pairs, sorted by
      the vehicle index.
  """

  pickup_tokens: tuple[_VisitRequestToken, ...]
  delivery_tokens: tuple[_VisitRequestToken, ...]
  allowed_vehicle_indices: tuple[int, ...]
  is_mandatory: bool
  shipment_type: str | None
  # The specification of costs per vehicle for this shipment. We use a set of
  # (vehicle_index, cost) pairs, to get a data structure that is:
  #  1. order-independent (the costs can be specified in any order),
  #  2. immutable (hashable).
  # Since a frozenmap (immutablemap) is not part of the standard library, we
  # settle on using a frozen set of key-value pairs. This is not a problem,
  # because these sets are used only for hashing and comparison, but we never
  # need to manipulate them.
  # TODO(ondrasej): Allow for different modes of merging with costs_per_vehicle:
  #  1. do not merge when there are any costs per vehicle.
  #  2. merge when they are exactly the same.
  #  3. merge when there are exactly the same vehicles with zero costs.
  #  4. merge arbitrarily.
  costs_per_vehicle: tuple[tuple[int, float], ...]

  @classmethod
  def from_shipment(cls, shipment: cfr_json.Shipment) -> Self:
    """Creates the token from a shipment in the JSON format."""

    costs_per_vehicle_set = ()
    if (costs_per_vehicle := shipment.get("costsPerVehicle")) is not None:
      costs_per_vehicle_indices = shipment.get("costsPerVehicleIndices")
      if costs_per_vehicle_indices is None:
        costs_per_vehicle_indices = range(len(costs_per_vehicle))
      costs_per_vehicle_set = tuple(
          sorted(zip(costs_per_vehicle_indices, costs_per_vehicle, strict=True))
      )
    return cls(
        pickup_tokens=tuple(
            _VisitRequestToken.from_visit_request(pickup)
            for pickup in shipment.get("pickups", ())
        ),
        delivery_tokens=tuple(
            _VisitRequestToken.from_visit_request(delivery)
            for delivery in shipment.get("deliveries", ())
        ),
        allowed_vehicle_indices=tuple(
            sorted(shipment.get("allowedVehicleIndices", ()))
        ),
        is_mandatory=shipment.get("penaltyCost") is None,
        shipment_type=shipment.get("shipmentType"),
        costs_per_vehicle=costs_per_vehicle_set,
    )


def _merge_visit_requests(
    visit_requests: Iterable[cfr_json.VisitRequest],
) -> cfr_json.VisitRequest:
  """Merges a sequence of compatible visit requests into one.

  The merged visit request corresponds to a visit, where all the covered visit
  requests are handled together.

  To be correct, all input visit requests should have the same:
  - arrival and departure locations,
  - time window(s),
  - tags,
  - visit type(s),
  - u-turn avoidance configuration.

  The following properties of the visit request are merged together so that the
  merged visit request represents all the visits:
  - duration,
  - cost,
  - load demands,
  - labels (labels of the individual visit requests are concatenated).

  TODO(ondrasej):
  - Also add delays from transition attributes that apply between the merged
    visit requests to the mix.
  - Update the time window of the visit request, so that the start of the last
    covered visit request still starts within the original time window, resp.
    add an option to enable this behavior.

  Args:
    visit_requests: The collection of visit requests to merge.

  Returns:
    A new visit request JSON data structure that represents the merger of visit
    requests in `visit_requests`.

  Raises:
    ValueError: When the input sequence is empty.
  """
  original = None
  merged_duration = datetime.timedelta(0)
  merged_cost = 0
  merged_label_parts = []
  merged_load_demands = {}
  for original in visit_requests:
    merged_duration += cfr_json.get_visit_request_duration(original)
    merged_cost += original.get("cost", 0)
    if (load_demands := original.get("loadDemands")) is not None:
      cfr_json.update_load_demands_in_place(merged_load_demands, load_demands)
    if (label := original.get("label")) is not None:
      merged_label_parts.append(label)

  if original is None:
    # At the end of the for loop above, `original` contains the last inspected
    # visit request. It is None only when `visit_requests` was empty.
    raise ValueError("At least one visit request is required")

  merged: cfr_json.VisitRequest = {}
  if (arrival_location := original.get("arrivalLocation")) is not None:
    merged["arrivalLocation"] = arrival_location
  if (arrival_waypoint := original.get("arrivalWaypoint")) is not None:
    merged["arrivalWaypoint"] = arrival_waypoint
  if (departure_location := original.get("departureLocation")) is not None:
    merged["departureLocation"] = departure_location
  if (departure_waypoint := original.get("departureWaypoint")) is not None:
    merged["departureWaypoint"] = departure_waypoint
  if time_windows := original.get("timeWindows"):
    merged["timeWindows"] = time_windows
  if tags := original.get("tags"):
    merged["tags"] = tags
  if visit_types := original.get("visitTypes"):
    merged["visitTypes"] = visit_types
  if original.get("avoidUTurns"):
    merged["avoidUTurns"] = True

  if merged_duration.total_seconds() != 0:
    merged["duration"] = cfr_json.as_duration_string(merged_duration)
  if merged_cost != 0:
    merged["cost"] = merged_cost
  if merged_label_parts:
    merged["label"] = ", ".join(merged_label_parts)
  if merged_load_demands:
    merged["loadDemands"] = merged_load_demands

  return merged


def _merge_visit_request_lists(
    visit_request_lists: Collection[Sequence[cfr_json.VisitRequest]],
) -> list[cfr_json.VisitRequest]:
  """Merges lists of visit requests elementwise.

  Assumes that elements of `visit_request_lists` are lists of visit requests
  that:
  - all have the same length.
  - visit requests at any given index are all compatible for merging.

  Returns a list of visit requests that are the result of elementwise merging
  of all lists in `visit_request_lists`.

  Args:
    visit_request_lists: The collection of lists of visit requests that should
      be merged. All elements of the collection must have the same length.

  Returns:
    A list of merged visit requests. The i-th visit request is created by
    merging the i-th visit request from each element of `visit_request_lists`.

  Raises:
    ValueError: When the elements of `visit_requests_lists` do not have all the
      same length.
  """
  merged_visit_requests = []
  if not visit_request_lists:
    return merged_visit_requests

  num_merged_visit_requests = len(next(iter(visit_request_lists)))
  for visit_request_list in visit_request_lists:
    if len(visit_request_list) != num_merged_visit_requests:
      raise ValueError(
          "All elements of `visit_request_lists` must have the same number of"
          " elements"
      )

  for i in range(num_merged_visit_requests):
    merged_visit_requests.append(
        _merge_visit_requests(
            visit_request_list[i] for visit_request_list in visit_request_lists
        )
    )
  return merged_visit_requests
