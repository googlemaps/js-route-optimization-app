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

r"""A command-line utility that transforms CFR request JSON files.

Reads a CFR request file in the JSON format, transforms it according to the
parameters provided via command-line flags and writes the modified file to
another file in the JSON format.

Typical usage:
  python3 -m cfr.json.transform_request \
    --input_file "scenario.json" \
    --output_file "scenario.all_optional.json" \
    --shipment_penalty_cost_per_item=1000
"""

import argparse
from collections.abc import Callable, Collection, Iterable, Sequence, Set
import dataclasses
import enum
import itertools
import json
import logging
from typing import Self

from .. import utils
from . import cfr_json
from . import io_utils
from . import transforms
from . import transforms_breaks


class ItemsPerShipment(utils.EnumForArgparse):
  """Specifies how the number of "actual" shipments per CFR shipment is counted.

  In the requests processed by this script, we assume that multiple items
  (packages, actions, ...) can be represented by a single Shipment object in a
  CFR request, when they are all performed at the same location and time, e.g.
  when there are multiple packages delivered to the same recipient. Most of the
  transformations done by this script work on CFR shipments and it makes no
  difference how mnay "actual" shipments are concerned. However, it does make
  a difference in few cases (e.g. when computing the `penaltyCost` for a
  Shipment object).

  To avoid confusion, we use the following vocabulary to distinguish the two:
  - "CFR shipments" are the Shipment objects in a CFR request.
  - "actual shipments" are the actual items (packages, ...) represented by a CFR
    shipment.
  One CFR shipment always represents one or more actual shipments.

  The CFR API does not have an explicit way to store this information, and it
  needs to be inferred from other properties of a CFR shipment. This enum
  contains a list of strategies how the number of actual shipments represented
  by one CFR shipment can be inferred.

  Values:
    ONE_PER_CFR_SHIPMENT: Each CFR shipment corresponds to one actual shipment.
    COMMA_SEPARATED_LIST_IN_LABEL: The label of each CFR shipment contains a
      comma separated list of labels (identifiers) of actual shipments. The
      number of actual shipments is computed as the length of the list of items
      in the label.
  """

  ONE_PER_CFR_SHIPMENT = enum.auto()
  COMMA_SEPARATED_LIST_IN_LABEL = enum.auto()


def _parse_comma_separated_list(value: str) -> Sequence[str]:
  return value.split(",")


def _parse_comma_separated_index_list(value: str) -> Sequence[int]:
  try:
    indices = tuple(int(index) for index in value.split(",") if index.strip())
    if any(index < 0 for index in indices):
      # On error fall use the same error handling as when parsing the numbers
      # fails.
      raise ValueError()
    return indices
  except ValueError:
    raise argparse.ArgumentTypeError(
        "expected a list of non-negative integers separated by commas, got"
        " {value!r}"
    ) from None


def _non_negative_float(value: str) -> float:
  value_as_float = float(value)
  if value_as_float < 0:
    raise argparse.ArgumentTypeError(
        f"expected a non-negative value, got {value!r}"
    )
  return value_as_float


def _explicit_true_or_false(value: str) -> bool:
  match value.casefold():
    case "true":
      return True
    case "false":
      return False
    case _:
      raise argparse.ArgumentTypeError(
          "Expected 'true' or 'false', got {value!r}"
      )


@dataclasses.dataclass(slots=True)
class Flags:
  """Holds values of command-line flags of this script.

  Each attribute of the class corresponds to a command-line flag of the same
  name. See the help strings of the flags for more information.
  """

  input_file: str
  output_file: str

  items_per_shipment: ItemsPerShipment

  shipment_penalty_cost_per_item: float | None
  remove_pickups: bool
  soften_allowed_vehicle_indices_cost: float | None
  visit_duration_scaling_factor: float | None

  duplicate_vehicles_by_label: Sequence[str] | None
  remove_vehicles_by_index: Sequence[int] | None
  remove_vehicles_by_label: Sequence[str] | None
  reduce_to_shipments_by_index: Sequence[int] | None
  reduce_to_vehicles_by_label: Sequence[str] | None
  reduce_to_vehicles_by_index: Sequence[int] | None
  allow_unseen_vehicle_labels: bool
  infeasible_shipment_after_removing_vehicle: transforms.OnInfeasibleShipment
  removed_shipment_used_in_injected_route_visit: (
      transforms.OnRemovedShipmentUsedInVisit
  )

  transform_breaks: str | None

  override_consider_road_traffic: bool | None
  override_avoid_u_turns: bool | None
  override_avoid_u_turns_shipment_indices: Sequence[int] | None
  override_internal_parameters: str | None

  add_injected_first_solution_routes_from_file: str | None
  override_interpret_injected_solutions_using_labels: bool | None

  @property
  def items_per_shipment_callback(self) -> Callable[[cfr_json.Shipment], int]:
    """Returns a callback that determines the number of items for a shipment.

    The behavior of the callback is determined by the value of the command-line
    flag --items_per_shipment.
    """
    match self.items_per_shipment:
      case ItemsPerShipment.ONE_PER_CFR_SHIPMENT:
        return lambda _: 1
      case ItemsPerShipment.COMMA_SEPARATED_LIST_IN_LABEL:
        return cfr_json.get_num_elements_in_label
      case _:
        raise ValueError(
            "Unexpected value of self.items_per_shipment:"
            f" {self.items_per_shipment!r}"
        )

  @classmethod
  def from_command_line(cls, args: Sequence[str] | None) -> Self:
    """Creates the Flags object from the command-line flags."""

    parser = argparse.ArgumentParser(prog="transform_request")
    parser.add_argument(
        "--input_file",
        required=True,
        help=(
            "The name of the file that contains the input CFR request in the"
            " JSON format."
        ),
    )
    parser.add_argument(
        "--output_file",
        required=True,
        help=(
            "The name of the file to which the tool writes the output CFR"
            " request in the JSON format."
        ),
    )
    ItemsPerShipment.add_as_argument(
        parser,
        "--items_per_shipment",
        help="Specifies how the number of items per shipment is determined.",
        default=ItemsPerShipment.ONE_PER_CFR_SHIPMENT,
    )
    parser.add_argument(
        "--shipment_penalty_cost_per_item",
        type=_non_negative_float,
        required=False,
        help=(
            "When provided, turns all mandatory shipments in the request into"
            " optional shipments by adding a `penaltyCost` to them. The "
            " `penaltyCost` for a CFR shipment is equal to the value of this"
            " flag times the number of actual shipments it represents. This"
            " number is determined using the --items_per_shipment flag. "
            " Shipments that already have a `penaltyCost` remain unchanged."
        ),
    )
    parser.add_argument(
        "--remove_pickups",
        required=False,
        default=False,
        action=argparse.BooleanOptionalAction,
        help=(
            "When set, removes pickups from all pickup & delivery shipments."
            " When the removed pickup request(s) have a time window that"
            " constrains delivery times, updates time windows on deliveries so"
            " that they can happen only after the earliest possible pickup of"
            " the shipment."
        ),
    )
    parser.add_argument(
        "--soften_allowed_vehicle_indices_cost",
        type=_non_negative_float,
        required=False,
        help=(
            "When set, replaces all allowedVehicleIndices in the request with a"
            " softened version of the constraint. In the softened version, all"
            " vehicle indices are allowed, but vehicle indices that were"
            " previously not allowed now have a cost specified as the value of"
            " this flag."
        ),
    )
    parser.add_argument(
        "--visit_duration_scaling_factor",
        type=_non_negative_float,
        required=False,
        help=(
            "When set, all pickup and delivery request durations in the request"
            " are scaled by the value of this flag. Must be a non-negative"
            " floating point number."
        ),
    )
    parser.add_argument(
        "--duplicate_vehicles_by_label",
        type=_parse_comma_separated_list,
        help=(
            "A comma-separated list of vehicle labels. For each label in the"
            " list, finds a vehicle that has this label and adds a new vehicle"
            " that has the same attributes and constraints as the source"
            " vehicle."
        ),
    )
    parser.add_argument(
        "--remove_vehicles_by_index",
        type=_parse_comma_separated_index_list,
        help=(
            "A comma-separated list of vehicle indices. Removes all vehicles"
            " whose index appears in the list."
        ),
    )
    parser.add_argument(
        "--remove_vehicles_by_label",
        type=_parse_comma_separated_list,
        help=(
            "A comma-separated list of vehicle labels. Removes all vehicles"
            " whose labels appear in this list. When multiple vehicles have the"
            " same label, and it appears in this list, all of them are removed."
        ),
    )
    parser.add_argument(
        "--reduce_to_shipments_by_index",
        type=_parse_comma_separated_index_list,
        help=(
            "A comma separated list of shipment indices. Removes all shipments"
            " whose indices do not appear in this list."
        ),
    )
    parser.add_argument(
        "--reduce_to_vehicles_by_index",
        type=_parse_comma_separated_index_list,
        help=(
            "A comma separated list of vehicle indices. Removes all vehicles"
            " whose indices do not appear in this list. Removes all shipments"
            " that become trivially infeasible when the vehicles are removed."
            " When both --reduce_to_vehicles_by_index and"
            " --reduce_to_vehicles_by_label are used, vehicles specified by any"
            " of the two are preserved in the request."
        ),
    )
    parser.add_argument(
        "--reduce_to_vehicles_by_label",
        type=_parse_comma_separated_list,
        help=(
            "A comma-separated list of vehicle labels. Removes all vehicles"
            " whose labels do not appear in this list. When multiple vehicles"
            " have the same label, and it appears in the list, all of them are"
            " preserved. Removes all shipments that become trivially infeasible"
            " when the vehicles are removed. When both"
            " --reduce_to_vehicles_by_index and --reduce_to_vehicles_by_label"
            " are used, vehicles specified by any of the two are preserved in"
            " the request."
        ),
    )
    parser.add_argument(
        "--allow_unseen_vehicle_labels",
        default=False,
        action=argparse.BooleanOptionalAction,
        help=(
            "Allow --reduce_to_vehicles_by_label --remove_vehicles_by_label to"
            " contain strings that do not appear as a vehicle label in the"
            " input request."
        ),
    )
    parser.add_argument(
        "--transform_breaks",
        required=False,
        help=(
            "Rules for transforming breaks in the model. See the module"
            " docstring of transform_breaks.py for more details on the"
            " transformation language."
        ),
    )
    parser.add_argument(
        "--override_consider_road_traffic",
        help=(
            "Specifies an override for the value of `considerRoadTraffic` in"
            " the request. When unspecified, the original value is preserved."
        ),
        type=_explicit_true_or_false,
        default=None,
    )
    parser.add_argument(
        "--override_avoid_u_turns",
        help=(
            "Specifies an override for the value of `avoidUTurns` in the visit"
            " requests in the model. When unspecified, the original value is"
            " preserved. When `--override_avoid_u_turns_shipment_indices` is"
            " specified, the override is done only for the specified shipments;"
            " otherwise, it's done for all shipments."
        ),
        type=_explicit_true_or_false,
        default=None,
    )
    parser.add_argument(
        "--override_avoid_u_turns_shipment_indices",
        type=_parse_comma_separated_index_list,
        help=(
            "The list of shipment indices where `--override_avoid_u_turns`"
            " should be applied. When unspecified, the transform is applied to"
            " all shipments."
        ),
    )
    parser.add_argument(
        "--override_internal_parameters",
        help=(
            "When specified, overrides the internal parameters string in the"
            " request. When specified with an empty string as a value, removes"
            " the internal parameters string from the request."
        ),
        default=None,
    )
    transforms.OnInfeasibleShipment.add_as_argument(
        parser,
        "--infeasible_shipment_after_removing_vehicle",
        help=(
            "Specifies how to deal with shipments that become trivially"
            " infeasible after removing a vehicle."
        ),
        default=transforms.OnInfeasibleShipment.FAIL,
    )
    transforms.OnRemovedShipmentUsedInVisit.add_as_argument(
        parser,
        "--removed_shipment_used_in_injected_route_visit",
        help=(
            "Specifies how to deal with visits that pick up or deliver any of"
            " the shipment removed via --reduce_to_shipments_by_index."
        ),
        default=transforms.OnRemovedShipmentUsedInVisit.FAIL,
    )
    parser.add_argument(
        "--add_injected_first_solution_routes_from_file",
        help=(
            "When specified, the value must be the path of a GMPRO response"
            " file in the JSON format that corresponds to the input request."
            " Takes routes from the response and adds them as"
            " `injectedFirstSolutionRoutes` to the request. Checks that"
            " vehicle, shipment and visit request indices on the routes are"
            " valid."
        ),
        default=None,
    )
    parser.add_argument(
        "--override_interpret_injected_solutions_using_labels",
        help=(
            "When specified, overrides the"
            " `interpretInjectedSolutionsUsingLabels` field in the request with"
            " the given value."
        ),
        type=_explicit_true_or_false,
        default=None,
    )

    parsed_args = parser.parse_args(args)
    return cls(**vars(parsed_args))


def _get_indices_of_vehicles_with_labels(
    model: cfr_json.ShipmentModel,
    vehicle_labels: Iterable[str],
) -> tuple[Sequence[int], Set[str]]:
  """Translates vehicle labels into vehicle indices.

  When multiple vehicles use the same label, the indices of all of them will be
  in the returned sequence.

  Args:
    model: The model in which the vehicle labels are translated.
    vehicle_labels: The vehicle labels to translate.

  Returns:
    A tuple (vehicle_indices, unseen_labels) where vehicle_indices is a sequence
    of vehicle indices selected by the labels, and unseen_labels is a set of
    labels from `vehicle_labels` that did not match any vehicle in the model.
  """
  selected_labels = set(vehicle_labels)
  unseen_labels = set(selected_labels)
  selected_indices = []
  for vehicle_index, vehicle in enumerate(cfr_json.get_vehicles(model)):
    vehicle_label = vehicle.get("label", "")
    if vehicle_label and vehicle_label in selected_labels:
      selected_indices.append(vehicle_index)
      unseen_labels.remove(vehicle_label)

  return selected_indices, unseen_labels


def _remove_vehicles(
    request: cfr_json.OptimizeToursRequest,
    vehicle_indices: Iterable[int] | None,
    vehicle_labels: Iterable[str] | None,
    on_infeasible_shipment: transforms.OnInfeasibleShipment,
    allow_unseen_vehicle_labels: bool = False,
) -> None:
  """Removes vehicles specified by `vehicle_indices` and `vehicle_labels`.

  Args:
    request: The request in which the vehicles are removed.
    vehicle_indices: The indices of the vehicles to be removed from the model.
    vehicle_labels: The labels of vehicles to be removed from the model. When a
      label from `vehicle_labels` is used by multiple vehicles, removes all such
      vehicles.
    on_infeasible_shipment: The behavior of the tool when a shipment becomes
      trivially infeasible after removing a vehicle.
    allow_unseen_vehicle_labels: When False, the function fails with an
      exception if `vehicle_labels` contains a string that doesn't correspond to
      a vehicle label. When True, unseen vehicle labels are not checked.
  """
  model = request["model"]
  indices_to_remove = set()
  if vehicle_indices is not None:
    indices_to_remove.update(vehicle_indices)

  if vehicle_labels is not None:
    indices_from_labels, unseen_labels = _get_indices_of_vehicles_with_labels(
        model, vehicle_labels
    )
    indices_to_remove.update(indices_from_labels)

    if unseen_labels:
      unseen_labels_str = ", ".join(
          repr(label) for label in sorted(unseen_labels)
      )
      if allow_unseen_vehicle_labels:
        logging.warning(
            "Unseen vehicle labels in  --remove_vehicles_by_label: %s",
            unseen_labels_str,
        )
      else:
        raise ValueError(
            "Vehicle labels from --remove_vehicles_by_label do not appear in"
            f" the model: {unseen_labels_str}"
        )

  new_vehicle_for_old_vehicle, new_shipment_for_old_shipment = (
      transforms.remove_vehicles(
          model, indices_to_remove, on_infeasible_shipment
      )
  )
  transforms.remove_vehicles_from_injected_first_solution_routes(
      request, new_vehicle_for_old_vehicle, new_shipment_for_old_shipment
  )


def _reduce_to_shipments(
    request: cfr_json.OptimizeToursRequest,
    shipment_indices: Collection[int],
    shipment_used_in_visit: transforms.OnRemovedShipmentUsedInVisit,
) -> None:
  """Removes all shipments whose index is not in `shipment_indices`."""
  model = request["model"]
  num_shipments = len(cfr_json.get_shipments(model))
  indices_to_remove = set(range(num_shipments))
  indices_to_remove.difference_update(shipment_indices)

  new_shipment_for_old_shipment = transforms.remove_shipments(
      model, indices_to_remove
  )
  # Update shipment indices in the injected first solution routes.
  transforms.remove_shipments_from_injected_first_solution_routes(
      request,
      new_shipment_for_old_shipment,
      shipment_used_in_visit=shipment_used_in_visit,
  )


def _reduce_to_vehicles(
    request: cfr_json.OptimizeToursRequest,
    vehicle_indices: Iterable[int] | None,
    vehicle_labels: Iterable[str] | None,
    allow_unseen_labels: bool = False,
) -> None:
  """Removes all vehicles in the request whose label is not in `vehicle_labels`.

  Removes also all shipments that become trivially infeasible after removing the
  vehicles.

  Args:
    request: The request in which the vehicles are removed.
    vehicle_indices: The indices of vehicles to be kept in the model.
    vehicle_labels: The labels of vehicles to be kept in the model.
    allow_unseen_labels: When False, the function fails with an exception if
      `vehicle_labels` contains a string that doesn't correspond to a vehicle
      label. When True, unseen vehicle labels are not checked.

  Raises:
    ValueError: When `vehicle_labels` contains a string that is not a vehicle
      label, and `allow_unseen_labels` is False.
  """
  model = request["model"]
  num_vehicles = len(cfr_json.get_vehicles(model))
  indices_to_remove = set(range(num_vehicles))

  if vehicle_indices is not None:
    indices_to_remove.difference_update(vehicle_indices)
  if vehicle_labels is not None:
    indices_to_keep, unseen_labels = _get_indices_of_vehicles_with_labels(
        model, vehicle_labels
    )

    if unseen_labels:
      unseen_labels_str = ", ".join(
          repr(label) for label in sorted(unseen_labels)
      )
      if allow_unseen_labels:
        logging.warning(
            "Unseen vehicle labels in --reduce_to_vehicles_by_label: %s",
            unseen_labels_str,
        )
      else:
        raise ValueError(
            "Vehicle labels from --reduce_to_vehicles_by_label do not appear in"
            " the model:"
            f" {unseen_labels_str}"
        )

    indices_to_remove.difference_update(indices_to_keep)

  logging.info("Removing vehicle indices %r", indices_to_remove)

  new_vehicle_for_old_vehicle, new_shipment_for_old_shipment = (
      transforms.remove_vehicles(
          model, indices_to_remove, transforms.OnInfeasibleShipment.REMOVE
      )
  )
  transforms.remove_vehicles_from_injected_first_solution_routes(
      request, new_vehicle_for_old_vehicle, new_shipment_for_old_shipment
  )


def _duplicate_vehicles_by_label(
    model: cfr_json.ShipmentModel, vehicle_labels: Iterable[str]
) -> None:
  """Duplicates all vehicles in the model whose label is in `vehicle_labels`.

  When a certain label appears in `vehicle_labels` multiple times, the
  corresponding vehicle is duplicated multiple times.

  Args:
    model: The model in which the vehicles are duplicated. Modified in place.
    vehicle_labels: The labels of the vehicles to be duplicated.
  """
  vehicle_index_by_label = {
      vehicle.get("label", ""): vehicle_index
      for vehicle_index, vehicle in enumerate(cfr_json.get_vehicles(model))
  }
  for vehicle_label in vehicle_labels:
    vehicle_index = vehicle_index_by_label.get(vehicle_label, None)
    if vehicle_index is None:
      raise ValueError(
          "Vehicle label from --duplicate_vehicles_by_label does not appear in"
          f" the model: {vehicle_label!r}"
      )
    transforms.duplicate_vehicle(model, vehicle_index)


def _add_injected_first_solution_routes_from_file(
    request: cfr_json.OptimizeToursRequest,
    response_file: str,
) -> None:
  """Adds routes from `response` as injected first solution routes to `request`.

  Any existing injected first solution routes that were in `request` before are
  replaced by this function.

  Args:
    request: The request in which the first solution routes are replaced.
    response_file: The name of the file from which the injected routes are
      loaded.

  Raises:
    ValueError: When the routes do not correspond to the request or when the
      input file could not be loaded.
  """
  try:
    response = io_utils.read_json_from_file(response_file)
  except (json.JSONDecodeError, OSError) as err:
    raise ValueError(
        f"Could not load the response from {response_file!r}"
    ) from err
  response_validation_errors = cfr_json.validate_indices_in_routes(
      request["model"], cfr_json.get_routes(response)
  )
  if response_validation_errors:
    error_message_parts = [
        "Routes from the response do not correspond to the request:"
    ]
    error_message_parts.extend(
        itertools.islice(response_validation_errors, 0, 5)
    )
    if len(response_validation_errors) > 5:
      error_message_parts.append(
          f"...and {len(response_validation_errors) - 5} more..."
      )
    raise ValueError("\n".join(error_message_parts))

  request["injectedFirstSolutionRoutes"] = list(cfr_json.get_routes(response))


def main(args: Sequence[str] | None = None) -> None:
  """Runs the command-line utility.

  Args:
    args: The command-line flags used by the utility. When `None`, command-line
      flags are taken from `sys.argv`.
  """
  flags = Flags.from_command_line(args)
  request: cfr_json.OptimizeToursRequest = io_utils.read_json_from_file(
      flags.input_file
  )

  model = request["model"]

  if flags.override_consider_road_traffic is not None:
    request["considerRoadTraffic"] = flags.override_consider_road_traffic
  if flags.override_interpret_injected_solutions_using_labels is not None:
    request["interpretInjectedSolutionsUsingLabels"] = (
        flags.override_interpret_injected_solutions_using_labels
    )
  if flags.add_injected_first_solution_routes_from_file is not None:
    _add_injected_first_solution_routes_from_file(
        request, flags.add_injected_first_solution_routes_from_file
    )
  if flags.override_avoid_u_turns is not None:
    transforms.set_avoid_u_turns(
        model,
        flags.override_avoid_u_turns,
        flags.override_avoid_u_turns_shipment_indices,
    )
  if flags.shipment_penalty_cost_per_item is not None:
    transforms.make_all_shipments_optional(
        model,
        flags.shipment_penalty_cost_per_item,
        flags.items_per_shipment_callback,
    )
  if flags.remove_pickups:
    transforms.remove_pickups(model)
  if flags.soften_allowed_vehicle_indices_cost is not None:
    transforms.soften_allowed_vehicle_indices(
        model, cost=flags.soften_allowed_vehicle_indices_cost
    )
  if flags.visit_duration_scaling_factor is not None:
    transforms.scale_visit_request_durations(
        model, factor=flags.visit_duration_scaling_factor
    )
  # NOTE(ondrasej): Removing shipments must be done before removing vehicles,
  # because removing vehicles may remove some shipments (and thus invalidate
  # shipment indices).
  if flags.reduce_to_shipments_by_index is not None:
    _reduce_to_shipments(
        request,
        flags.reduce_to_shipments_by_index,
        shipment_used_in_visit=flags.removed_shipment_used_in_injected_route_visit,
    )
  if flags.remove_vehicles_by_label or flags.remove_vehicles_by_index:
    _remove_vehicles(
        request,
        flags.remove_vehicles_by_index,
        flags.remove_vehicles_by_label,
        flags.infeasible_shipment_after_removing_vehicle,
        allow_unseen_vehicle_labels=flags.allow_unseen_vehicle_labels,
    )
  preserved_vehicle_labels = flags.reduce_to_vehicles_by_label
  preserved_vehicle_indices = flags.reduce_to_vehicles_by_index
  if (
      preserved_vehicle_labels is not None
      or preserved_vehicle_indices is not None
  ):
    _reduce_to_vehicles(
        request,
        preserved_vehicle_indices,
        preserved_vehicle_labels,
        allow_unseen_labels=flags.allow_unseen_vehicle_labels,
    )
  if duplicated_labels := flags.duplicate_vehicles_by_label:
    _duplicate_vehicles_by_label(model, duplicated_labels)
  if flags.transform_breaks is not None:
    break_transform_rules = transforms_breaks.compile_rules(
        flags.transform_breaks
    )
    transforms_breaks.transform_breaks(model, break_transform_rules)
  if (internal_parameters := flags.override_internal_parameters) is not None:
    if internal_parameters:
      request["internalParameters"] = internal_parameters
    else:
      request.pop("internalParameters", None)

  io_utils.write_json_to_file(flags.output_file, request)


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  main()
