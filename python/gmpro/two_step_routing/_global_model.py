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

"""Contains helper functions for the global models in two-step routing."""

import collections
from collections.abc import Mapping
import re

from . import _local_model
from . import _parking
from . import _shared
from ..json import cfr_json


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


def assert_routes_handle_same_shipments(
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


def make_shipment_for_local_route(
    model: cfr_json.ShipmentModel,
    local_route_index: int,
    local_route: cfr_json.ShipmentRoute,
    parking: _parking.ParkingLocation,
    transition_attributes: _parking.TransitionAttributeManager,
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
  shipment_indices = _local_model.get_shipment_indices_from_visits(
      cfr_json.get_shipments(model), visits
  )
  shipments = tuple(
      model["shipments"][shipment_index] for shipment_index in shipment_indices
  )
  assert shipments

  global_delivery_tags: list[str] = [parking.tag]
  global_delivery: cfr_json.VisitRequest = {
      # We use the waypoint of the parking location for the waypoint.
      "arrivalWaypoint": parking.waypoint,
      # The duration of the delivery at the parking location is the total
      # duration of the local route for this round.
      "duration": local_route["metrics"]["totalDuration"],
      "tags": global_delivery_tags,
  }
  global_time_windows = _local_model.get_route_start_time_windows(
      model, local_route
  )
  if global_time_windows is not None:
    global_delivery["timeWindows"] = global_time_windows

  # Add arrival/departure/reload costs and delays if needed.
  parking_tags = transition_attributes.get_or_create(parking)
  if parking_tags.has_global_transition_attributes:
    global_delivery_tags.append(parking_tags.global_tag)

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


def parse_shipment_label(label: str) -> tuple[str, int]:
  """Parses the label of a shipment in the global model.

  Args:
    label: The label to parse.

  Returns:
    A tuple `(shipment_type, index)` where `shipment_label` is the type of the
    shipment: "s" for a shipment delivered directly, and "p" for a visit to a
    parking location. `index` is the index of the corresponding object: for
    shipments delivered directly, this is the index of the shipment in the
    original model; for visits to a parking location, this is the index of the
    local route that contains the route for this visit.
  """
  match = _GLOBAL_SHIPEMNT_LABEL.match(label)
  if not match:
    raise ValueError(f"Invalid shipment label: {label!r}")
  return match[1], int(match[2])
