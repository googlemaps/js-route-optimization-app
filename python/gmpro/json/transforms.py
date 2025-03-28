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

"""A library of transformations to CFR JSON requests."""

import collections
from collections.abc import Callable, Collection, Iterable, Mapping, MutableMapping, Sequence, Set
import copy
import itertools
import logging
import math
import re

from . import cfr_json
from .. import utils


def make_all_shipments_optional(
    model: cfr_json.ShipmentModel,
    cost: float,
    get_num_items: Callable[[cfr_json.Shipment], int] | None = None,
) -> None:
  """Modifies `model` in place by marking all shipments as optional.

  Sets `penaltyCost` of all shipments in the model to `cost * num_items`, where
  `num_items` is the number of items delivered in a CFR shipment. Shipments that
  already have a `penaltyCost` set are not modified.

  Args:
    model: The model to modify.
    cost: The penalty cost applied to all mandatory shipments in the request.
    get_num_items: A function that determines the number of items in a CFR
      shipment. When `None`, a function that returns 1 for all shipments is
      used.
  """
  if get_num_items is None:
    get_num_items = lambda _: 1

  for shipment in cfr_json.get_shipments(model):
    if "penaltyCost" not in shipment:
      num_items = get_num_items(shipment)
      shipment["penaltyCost"] = num_items * cost


def remove_shipments(
    model: cfr_json.ShipmentModel, shipment_indices: Collection[int]
) -> Mapping[int, int]:
  """Removes the given shipments from the model.

  Args:
    model: The model from which the shipments are removed. The model is modified
      in place.
    shipment_indices: The indices of the removed shipment.

  Returns:
    A mapping from shipment indices before the removal to shipment indices after
    the removal. Indices of removed shipments are not present in the mapping.
  """
  shipments = cfr_json.get_shipments(model)
  new_shipments: list[cfr_json.Shipment] = []
  new_shipment_for_old_shipment: dict[int, int] = {}

  for shipment_index, shipment in enumerate(shipments):
    if shipment_index in shipment_indices:
      continue
    new_shipment_index = len(new_shipments)
    new_shipments.append(shipment)
    new_shipment_for_old_shipment[shipment_index] = new_shipment_index
  model["shipments"] = new_shipments

  return new_shipment_for_old_shipment


def set_avoid_u_turns(
    model: cfr_json.ShipmentModel,
    avoid_u_turns: bool,
    shipment_indices: Collection[int] | None,
) -> None:
  """Sets the avoid u-turns flag for all visit requests of the given shipments.

  Args:
    model: The model in which the change is made.
    avoid_u_turns: The new value of the avoid u-turns flag.
    shipment_indices: A collection of indices for which the flag is updated.
      When None, the flag is updated for all shipments.
  """
  shipments = cfr_json.get_shipments(model)
  if shipment_indices is None:
    shipment_indices = range(len(shipments))
  for shipment_index in shipment_indices:
    shipment = shipments[shipment_index]
    for visit_request in itertools.chain(
        shipment.get("pickups", ()), shipment.get("deliveries", ())
    ):
      visit_request["avoidUTurns"] = avoid_u_turns


def update_shipment_indices_in_shipment_routes(
    routes: Sequence[cfr_json.ShipmentRoute],
    new_shipment_for_old_shipment: Mapping[int, int],
) -> None:
  """Removes shipments from visits in `routes`.

  Args:
    routes: The routes from which the shipments are removed. Modified in place.
    new_shipment_for_old_shipment: A mapping from shipment indices before the
      removal to shipment indices after the removal. Shipment indices that are
      not present as keys in the mapping are considered to be removed.
  """
  for route in routes:
    for visit in cfr_json.get_visits(route):
      shipment_index = visit.get("shipmentIndex", 0)
      new_shipment_index = new_shipment_for_old_shipment.get(shipment_index)
      if new_shipment_index is None:
        raise ValueError(
            f"Shipment index {shipment_index} is not present in"
            " new_shipments_from_old_shipments."
        )
      visit["shipmentIndex"] = new_shipment_index


def duplicate_vehicle(model: cfr_json.ShipmentModel, vehicle_index: int) -> int:
  """Duplicates a vehicle in the model.

  The new vehicle has exactly the same parameters as the original vehicle and a
  slightly modified label, and is subject to the same constraints as the
  original vehicle (Shipment.allowedVehicleIndices, Shipment.costsPerVehicle).

  Args:
    model: The model in which the vehicle is modified. Modified in place.
    vehicle_index: The index of the duplicated vehicle.

  Returns:
    The index of the duplicate vehicle.
  """
  vehicles: list[cfr_json.Vehicle] | None = model.get("vehicles")
  if not vehicles:
    raise ValueError("model has no vehicles")

  if vehicle_index < 0 or vehicle_index >= len(vehicles):
    raise ValueError(
        f"Invalid vehicle_index {vehicle_index}. Max vehicle index is"
        f" {len(vehicles) - 1}"
    )

  new_vehicle_index = len(vehicles)
  new_vehicle = copy.deepcopy(vehicles[vehicle_index])

  vehicle_label = new_vehicle.get("label", "")
  vehicle_labels = {vehicle.get("label", ()) for vehicle in vehicles}

  i = 1
  while True:
    new_vehicle_label = f"{vehicle_label} #{i}"
    if new_vehicle_label not in vehicle_labels:
      break
    i += 1
  new_vehicle["label"] = new_vehicle_label

  vehicles.append(new_vehicle)

  for shipment in cfr_json.get_shipments(model):
    # Update allowed vehicle indices. If the old vehicle was allowed, allow it
    # too. Otherwise, leave it unchanged.
    allowed_vehicle_indices = shipment.get("allowedVehicleIndices")
    if (
        allowed_vehicle_indices is not None
        and vehicle_index in allowed_vehicle_indices
    ):
      allowed_vehicle_indices.append(new_vehicle_index)

    # Update costs per vehicle. If the old vehicle had a cost, use the same cost
    # for the new vehicle.
    costs_per_vehicle = shipment.get("costsPerVehicle")
    if costs_per_vehicle is None:
      continue

    costs_per_vehicle_indices = shipment.get("costsPerVehicleIndices")
    if costs_per_vehicle_indices is not None:
      # `costsPerVehicle` is sparse, and has a parallel array of vehicle
      # indices. We need to update both.
      try:
        cost_index = costs_per_vehicle_indices.index(vehicle_index)
      except ValueError:
        # list.index() raises ValueError when the searched value is not present.
        # In this case, there is no special cost for the old vehicle in this
        # shipment and we can just move on to the next one.
        continue
      costs_per_vehicle.append(costs_per_vehicle[cost_index])
      costs_per_vehicle_indices.append(new_vehicle_index)

      # TODO(ondrasej): Also support costsPerVehicleNames.
    else:
      # `costsPervehicle` is dense. We just need to append at the end.
      assert len(costs_per_vehicle) == new_vehicle_index
      costs_per_vehicle.append(costs_per_vehicle[vehicle_index])

  return new_vehicle_index


class OnInfeasibleShipment(utils.EnumForArgparse):
  """Specifies the action taken when a shipment becommes infeasible.

  This is used by `remove_vehicles` when the last vehicle that can serve a given
  shipment is removed.

  Values:
    FAIL: The operation that made the shipment infeasible fails.
    REMOVE: The infeasible shipment is removed from the request.
  """

  FAIL = 0
  REMOVE = 1


def remove_vehicles(
    model: cfr_json.ShipmentModel,
    vehicle_indices: Collection[int],
    on_infeasible_shipment: OnInfeasibleShipment = OnInfeasibleShipment.FAIL,
) -> tuple[Mapping[int, int], Mapping[int, int]]:
  """Removes vehicles with the given indices from the model.

  Removes the vehicles from the list and updates vehicle indices in the other
  parts of the model.

  Args:
    model: The model to update.
    vehicle_indices: The set of vehicle indices to remove.
    on_infeasible_shipment: The behavior of the function when it encounters an
      infeasible shipment.

  Returns:
    A tuple `(vehicle_index_map, shipment_index_map)` where `vehicle_index_map`
    is a mapping from vehicle indices before the removal to vehicle indices
    after the removal, and `shipment_index_map` is a mapping from shipment
    indices in the old model to shipment indices in the new model.

    Removed vehicle indices are not present in this mapping.
  """
  old_vehicles = cfr_json.get_vehicles(model)
  num_old_vehicles = len(old_vehicles)
  removed_vehicle_indices = frozenset(vehicle_indices)
  new_vehicle_for_old_vehicle = {}
  new_vehicles = []

  removed_shipments = set()

  for old_vehicle_index, vehicle in enumerate(old_vehicles):
    if old_vehicle_index in removed_vehicle_indices:
      continue
    new_vehicle_index = len(new_vehicles)
    new_vehicle_for_old_vehicle[old_vehicle_index] = new_vehicle_index
    new_vehicles.append(vehicle)
  model["vehicles"] = new_vehicles

  shipments = cfr_json.get_shipments(model)
  for shipment_index, shipment in enumerate(shipments):
    allowed_vehicle_indices = shipment.get("allowedVehicleIndices")
    if allowed_vehicle_indices is not None:
      new_allowed_indices = [
          new_vehicle_for_old_vehicle[vehicle_index]
          for vehicle_index in allowed_vehicle_indices
          if vehicle_index not in removed_vehicle_indices
      ]
      if not new_allowed_indices:
        match on_infeasible_shipment:
          case OnInfeasibleShipment.FAIL:
            raise ValueError(f"Shipment {shipment_index} becomes infeasible")
          case OnInfeasibleShipment.REMOVE:
            removed_shipments.add(shipment_index)
            continue
      shipment["allowedVehicleIndices"] = new_allowed_indices

    costs_per_vehicle = shipment.get("costsPerVehicle")
    if costs_per_vehicle is None:
      continue

    costs_per_vehicle_indices = shipment.get("costsPerVehicleIndices")
    if costs_per_vehicle_indices is not None:
      # `costsPerVehicle` is sparse, and has a parallel array of vehicle
      # indices. We need to update both.
      new_costs_per_vehicles = {}
      for vehicle_index, cost in zip(
          costs_per_vehicle_indices, costs_per_vehicle
      ):
        if vehicle_index in removed_vehicle_indices:
          continue
        new_vehicle_index = new_vehicle_for_old_vehicle[vehicle_index]
        new_costs_per_vehicles[new_vehicle_index] = cost
      if new_costs_per_vehicles:
        shipment["costsPerVehicle"] = list(new_costs_per_vehicles.values())
        shipment["costsPerVehicleIndices"] = list(new_costs_per_vehicles.keys())
      else:
        del shipment["costsPerVehicle"]
        del shipment["costsPerVehicleIndices"]

      # TODO(ondrasej): Also support costsPerVehicleNames.
    else:
      # `costsPervehicle` is dense. We just remove the removed values.
      assert len(costs_per_vehicle) == num_old_vehicles
      shipment["costsPerVehicle"] = [
          cost
          for vehicle_index, cost in enumerate(costs_per_vehicle)
          if vehicle_index not in removed_vehicle_indices
      ]

  new_shipment_for_old_shipment: MutableMapping[int, int] = {}
  if removed_shipments:
    # Remove all trivially infeasible shipments from the model.
    new_shipments = []
    for shipment_index, shipment in enumerate(shipments):
      if shipment_index in removed_shipments:
        label = shipment.get("label")
        logging.warning(
            "Removing trivially infeasible shipment #%d: %s",
            shipment_index,
            repr(label) if label is not None else "",
        )
      else:
        new_shipment_for_old_shipment[shipment_index] = len(new_shipments)
        new_shipments.append(shipment)
    model["shipments"] = new_shipments
  else:
    for shipment_index in range(len(shipments)):
      new_shipment_for_old_shipment[shipment_index] = shipment_index

  return new_vehicle_for_old_vehicle, new_shipment_for_old_shipment


class OnRemovedShipmentUsedInVisit(utils.EnumForArgparse):
  """Specifies the behavior when a removed shipment is used in a visit.

  Values:
    FAIL: Raise an exception.
    REMOVE_VISIT: Remove the concerned visit from the route.
  """

  FAIL = 0
  REMOVE_VISIT = 1


def remove_shipments_from_injected_first_solution_routes(
    request: cfr_json.OptimizeToursRequest,
    new_shipment_for_old_shipment: Mapping[int, int],
    shipment_used_in_visit: OnRemovedShipmentUsedInVisit = OnRemovedShipmentUsedInVisit.FAIL,
) -> None:
  """Removes given shipments from the first solution hint in `request`.

  Args:
    request: The request in which the shipments are removed.
    new_shipment_for_old_shipment: A mapping from old shipment indices to new
      shipment indices. Shipments that were removed are not present in the
      mapping.
    allow_dropping_visits: When True, visits that pick up or deliver one of the
      removed shipments are removed from the injected solution. Otherwise, the
      function raises an exception when a removed shipment appears in an
      injected route.

  Raises:
    ValueError: When one of the removed shipments is used in the injected first
      solution routes and `allow_dropping_visits` is False.
  """
  injected_first_solution_routes = request.get("injectedFirstSolutionRoutes")
  if injected_first_solution_routes is None:
    return

  for route in injected_first_solution_routes:
    old_visits = cfr_json.get_visits(route)
    if not old_visits:
      # This is an unused vehicle, nothing to do here.
      continue
    # Remove transitions and travel steps from the route. The code below may
    # remove some visits, which would break basic invariants for visits and
    # transitions. To avoid this case, we remove them.
    # TODO(ondrasej): We could also merge transitions/travel steps around the
    # removed visits. The merged transitions would be taking a potentially
    # unnecessary detour, but at least all invariants would hold there.
    route.pop("transitions", None)
    route.pop("travelSteps", None)
    new_visits = []
    for visit in old_visits:
      old_shipment_index = visit.get("shipmentIndex", 0)
      new_shipment_index = new_shipment_for_old_shipment.get(old_shipment_index)
      if new_shipment_index is not None:
        visit["shipmentIndex"] = new_shipment_index
        new_visits.append(visit)
      else:
        if shipment_used_in_visit == OnRemovedShipmentUsedInVisit.FAIL:
          raise ValueError(
              f"Shipment index {old_shipment_index} is used in an injected"
              " first solution route, but it has been marked as removed."
          )
    route["visits"] = new_visits


def remove_vehicles_from_injected_first_solution_routes(
    request: cfr_json.OptimizeToursRequest,
    new_vehicle_for_old_vehicle: Mapping[int, int],
    new_shipment_for_old_shipment: Mapping[int, int],
) -> None:
  """Removes given vehicles from the first solution hint in `request`."""
  injected_first_solution_routes = request.get("injectedFirstSolutionRoutes")
  if injected_first_solution_routes is None:
    return

  new_injected_first_solution_routes = []
  for route in injected_first_solution_routes:
    old_vehicle_index = route.get("vehicleIndex", 0)
    new_vehicle_index = new_vehicle_for_old_vehicle.get(old_vehicle_index)
    if new_vehicle_index is None:
      continue
    route["vehicleIndex"] = new_vehicle_index
    if new_shipment_for_old_shipment:
      for visit in cfr_json.get_visits(route):
        old_shipment_index = visit.get("shipmentIndex", 0)
        visit["shipmentIndex"] = new_shipment_for_old_shipment[
            old_shipment_index
        ]

    new_injected_first_solution_routes.append(route)

  if new_injected_first_solution_routes:
    request["injectedFirstSolutionRoutes"] = new_injected_first_solution_routes
  else:
    request.pop("injectedFirstSolutionRoutes", None)


def soften_shipment_allowed_vehicle_indices(
    shipment: cfr_json.Shipment, cost: float, num_vehicles: int
) -> None:
  """Softens the hard vehicle-shipment constraints in the model.

  When `cost > 0`, replaces the hard constraints with equivalent soft
  constraints where the cost of violating the vehicle-shipment constraint is
  `cost`. When `cost == 0`, removes `allowedVehicleIndices` from the model.

  Args:
    shipment: The shipment in which the allowed vehicle indices are softened.
    cost: The cost of violating a vehicle-shipment constraint.
    num_vehicles: The number of vehicles in the model.

  Raises:
    ValueError: When `cost < 0` or `num_vehicles` does not match the existing
      costs per vehicle data in the shipment.
  """
  if cost < 0:
    raise ValueError("cost must be non-negative.")
  allowed_vehicles = shipment.pop("allowedVehicleIndices", None)
  if allowed_vehicles is None or cost == 0:
    return
  costs_per_vehicle = shipment.get("costsPerVehicle", ())
  costs_per_vehicle_indices = shipment.get("costsPerVehicleIndices", ())
  if costs_per_vehicle and not costs_per_vehicle_indices:
    if len(costs_per_vehicle) != num_vehicles:
      raise ValueError(
          "`shipment['costsPerVehicleIndices']` is not used, but `num_vehicles`"
          " is different from`len(shipment['costsPerVehicle'])`."
      )
    costs_per_vehicle_indices = range(len(costs_per_vehicle))
  costs_per_vehicle_map = collections.defaultdict(
      float, zip(costs_per_vehicle_indices, costs_per_vehicle)
  )
  for vehicle in range(num_vehicles):
    if vehicle not in allowed_vehicles:
      costs_per_vehicle_map[vehicle] += cost

  indices, costs = zip(*sorted(costs_per_vehicle_map.items()))
  if num_vehicles == len(costs_per_vehicle_map):
    shipment["costsPerVehicle"] = list(costs)
    shipment.pop("costsPerVehicleIndices", None)
  else:
    shipment["costsPerVehicleIndices"] = list(indices)
    shipment["costsPerVehicle"] = list(costs)


def soften_allowed_vehicle_indices(
    model: cfr_json.ShipmentModel, cost: float
) -> None:
  """Softens hard vehicle-shipment constraints in all shipments in the model.

  See `soften_shipment_allowed_vehicle_indices for more details.

  Args:
    model: The model in which the constraints are softened.
    cost: The cost of violating a vehicle-shipment constraint.

  Raises:
    ValueError: When `cost < 0`.
  """
  num_vehicles = len(cfr_json.get_vehicles(model))
  for shipment in cfr_json.get_shipments(model):
    soften_shipment_allowed_vehicle_indices(
        shipment, cost=cost, num_vehicles=num_vehicles
    )


def remove_load_limits(model: cfr_json.ShipmentModel) -> None:
  """Removes load limits from all vehicles in the model."""
  vehicles = model.get("vehicles", ())
  for vehicle in vehicles:
    vehicle.pop("loadLimits", None)


def scale_visit_request_durations(
    model: cfr_json.ShipmentModel, factor: float
) -> None:
  """Scales visit durations in the model by the given factor.

  Args:
    model: The model in which the visit durations are scaled.
    factor: The scaling factor. Must be non-negative.
  """
  if factor < 0:
    raise ValueError("factor must be a non-negative number")
  for shipment in cfr_json.get_shipments(model):
    pickups = shipment.get("pickups", ())
    deliveries = shipment.get("deliveries", ())
    for visit_request in itertools.chain(pickups, deliveries):
      duration = cfr_json.get_visit_request_duration(visit_request)
      duration *= factor
      visit_request["duration"] = cfr_json.as_duration_string(duration)


def remove_pickups(model: cfr_json.ShipmentModel) -> None:
  """Removes pickups from shipments that have both pickups and deliveries.

  Determines the earliest possible pickup time of the shipment and adds or
  updates delivery time windows so that the shipment can be delivered only after
  this earliest pickup time.

  When there are pickup visit costs, adds the minimal pickup visit cost to all
  delivery visit costs to preserve the pickup costs in the modified model to
  some extent.

  The result of the function is a modified version of the original model that is
  not necessarily equivalent to the original model, but is very likely easier to
  solve.

  Args:
    model: The input model. The model is modified in place.

  Raises:
    ValueError: When a shipment is proved to be infeasible by the function.
  """
  global_start = cfr_json.get_global_start_time(model)

  for shipment_index, shipment in enumerate(cfr_json.get_shipments(model)):
    pickups = shipment.get("pickups")
    deliveries = shipment.get("deliveries")
    if not pickups or not deliveries:
      continue

    earliest_pickup_time = cfr_json.get_shipment_earliest_pickup(
        model, shipment, include_duration=True
    )
    min_pickup_cost = min(pickup.get("cost", 0) for pickup in pickups)

    del shipment["pickups"]

    if earliest_pickup_time == global_start:
      continue
    earliest_pickup_time_string = cfr_json.as_time_string(earliest_pickup_time)

    new_deliveries = []
    for delivery in deliveries:
      original_delivery_cost = delivery.get("cost", 0)
      new_delivery_cost = original_delivery_cost + min_pickup_cost
      time_windows = delivery.get("timeWindows")
      if time_windows is None:
        time_windows = [{}]
      new_time_windows = []
      min_soft_end_time_cost_increase = math.inf
      for time_window in time_windows:
        end_time = cfr_json.get_time_windows_end(model, (time_window,))
        if end_time < earliest_pickup_time:
          # The time window ends before the pickup time. We can just drop it.
          continue
        start_time = cfr_json.get_time_windows_start(model, (time_window,))
        soft_end_time_cost_increase = 0
        if start_time < earliest_pickup_time:
          # The earliest pickup time is inside this time window. We need to
          # adjust the start time.
          new_time_window = copy.deepcopy(time_window)
          new_time_window["startTime"] = earliest_pickup_time_string
          # If the soft start time is before the earliest pickup, we drop the
          # soft start time and the associated cost. In this case, the delivery
          # would always happen _after_ the soft start time, and the soft start
          # time would thus not add any costs to the solution.
          soft_start_time_string = new_time_window.get("softStartTime")
          if soft_start_time_string is not None:
            soft_start_time = cfr_json.parse_time_string(soft_start_time_string)
            if soft_start_time < earliest_pickup_time:
              del new_time_window["softStartTime"]
              new_time_window.pop("costPerHourBeforeSoftStartTime", None)
          # Adjust the soft end time, if it is before the earliest pickup. We
          # align the soft end time with the start time. Shifting the soft end
          # time would in practice decrease the cost of ending late. To
          # compensate for this potential decrease, we take the smallest such
          # decrease over all possible time windows of the delivery, and add it
          # to the fixed cost of the delivery visit.
          # By taking the minimum, we do not add a cost in case the solver has
          # an option to pick a time window that does not incur a cost, but we
          # still preserve the cost in case there is only one time window.
          # TODO(ondrasej): An alternative solution would replace the single
          # delivery request that has multiple time windows with multiple visit
          # requests that have a single time window, and a correctly adjusted
          # fixed cost. But as of 2023-10-05, requests that use multiple time
          # windows with soft bounds are rejected, so the current solution is
          # precise for all valid inputs.
          soft_end_time_string = new_time_window.get("softEndTime")
          if soft_end_time_string is not None:
            soft_end_time = cfr_json.parse_time_string(soft_end_time_string)
            if soft_end_time < earliest_pickup_time:
              new_time_window["softEndTime"] = earliest_pickup_time_string
              soft_end_cost_per_hour = float(
                  new_time_window.get("costPerHourAfterSoftEndTime", 0)
              )
              soft_end_time_cost_increase = (
                  soft_end_cost_per_hour
                  * (earliest_pickup_time - soft_end_time).total_seconds()
                  / 3600
              )
          new_time_windows.append(new_time_window)
        else:
          # Otherwise leave the time window unchanged.
          new_time_windows.append(time_window)
        min_soft_end_time_cost_increase = min(
            min_soft_end_time_cost_increase, soft_end_time_cost_increase
        )

      if not new_time_windows:
        # No time windows are left, meaning that this delivery request is
        # infeasible.
        continue
      new_delivery_cost += min_soft_end_time_cost_increase
      if new_delivery_cost != original_delivery_cost:
        delivery["cost"] = new_delivery_cost
      delivery["timeWindows"] = new_time_windows
      new_deliveries.append(delivery)
    if not new_deliveries:
      raise ValueError(f"Shipment {shipment_index} is infeasible.")
    shipment["deliveries"] = new_deliveries


_SPLIT_BY_COMMA = re.compile(r"\s*,\s*")


def split_shipment(
    shipment: cfr_json.Shipment, num_items_load_type: str, max_items: int
) -> Iterable[cfr_json.Shipment]:
  """Splits `shipment` into multiple smaller shipments if needed.

  Assumes that `shipment` is a CFR shipment that contains multiple items that
  need to be delivered, and that
  - the label contains a comma-separated list of items in the shipment,
  - the number of shipments is recorded in `loadDemands` of the shipment under
    the name `num_items_key`,
  - all other load demands specify different types of items in the shipment, and
    their sum is smaller or equal to the number of items in the shipment.

  When the number of items in the shipment is greater than `max_items`, returns
  multiple shipments that each contain at most `max_items` items. The item
  labels from the original shipment label are distributed across these shipments
  and so are the item type load demands. The function has no way of knowing
  which item type corresponds to which item label, so it assigns them
  arbitrarily and it's thus recommended only for experimental use.

  Note that the function modifies `shipment` in place and yields only newly
  created shipments. This way, the original shipment object can be kept in the
  list of shipments at its original spot (so that its shipment index is
  preserved), while the new shipments can be added at the end of the list with
  new shipment indices (i.e. they do not disturb shipment indices of other
  shipments).

  Also note that the function may change objects that it already yielded until
  it stops iteration.

  Args:
    shipment: The shipment to (maybe) split. The shipment is modified in place.
    num_items_load_type: The name of the key in `loadDemands` of the shipment
      that contains the number of items in the shipment.
    max_items: The maximal number of items per shipment.

  Yields:
    New shipments created while splitting the original shipment.

  Raises:
    ValueError: When the assumptions outlined above do not hold.
  """
  num_items = cfr_json.get_shipment_load_demand(shipment, num_items_load_type)
  shipment_label = shipment.get("label", "")
  items = _SPLIT_BY_COMMA.split(shipment_label)
  if num_items != len(items):
    raise ValueError(
        f"The number of items in the shipment label ({len(items)}) is"
        f" inconsistent with the number of items in load demands ({num_items})."
        f" Shipment label: {shipment_label!r}"
    )

  load_demands = shipment.get("loadDemands")
  if load_demands is None:
    load_demands = {}

  num_typed_items = sum(
      int(load.get("amount", 0))
      for load_type, load in load_demands.items()
      if load_type != num_items_load_type
  )
  if num_typed_items > num_items:
    raise ValueError(
        "The sum of load demands other than {num_items_key!r}"
        " ({num_typed_items}) is greater than the number of items ({num_items})"
    )

  if num_items <= max_items:
    return ()

  while num_items > max_items:
    # We will split the items in `shipment` into `max_items` items that will
    # remain in `shipment` and we move the rest into `shipment_rest` to be
    # processed in the next iteration.
    shipment_rest = copy.deepcopy(shipment)

    shipment["label"] = ", ".join(items[:max_items])
    del items[:max_items]

    shipment_demands = {num_items_load_type: {"amount": str(max_items)}}
    shipment["loadDemands"] = shipment_demands

    num_items -= max_items
    if num_items <= max_items:
      # If the next shipment will be the last, we need to set the label also for
      # `shipment_rest`.
      shipment_rest["label"] = ", ".join(items)

    shipment_rest_demands = shipment_rest["loadDemands"]
    shipment_rest_demands[num_items_load_type]["amount"] = str(num_items)

    remaining_items_to_drop = max_items
    for load_type, rest_demand in list(shipment_rest_demands.items()):
      if load_type == num_items_load_type:
        continue
      original_amount = int(rest_demand.get("amount", 0))
      removed_amount = min(remaining_items_to_drop, original_amount)
      shipment_demands[load_type] = {"amount": str(removed_amount)}
      rest_amount = original_amount - removed_amount
      if rest_amount > 0:
        rest_demand["amount"] = str(rest_amount)
      else:
        # Remove load demands that dropped to zero.
        del shipment_rest_demands[load_type]

      remaining_items_to_drop -= removed_amount
      if remaining_items_to_drop == 0:
        break

    yield shipment_rest
    shipment = shipment_rest
