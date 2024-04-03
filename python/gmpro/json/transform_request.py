# Copyright 2024 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     https://www.apache.org/licenses/LICENSE-2.0
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
from collections.abc import Callable, Iterable, Sequence
import dataclasses
import enum
import logging
from typing import Self

from .. import utils
from . import cfr_json
from . import io_utils
from . import transforms


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


def _non_negative_float(value: str) -> float:
  value_as_float = float(value)
  if value_as_float < 0:
    raise argparse.ArgumentTypeError(
        f"expected a non-negative value, got {value}"
    )
  return value_as_float


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
  remove_vehicles_by_label: Sequence[str] | None

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
        "--remove_vehicles_by_label",
        type=_parse_comma_separated_list,
        help=(
            "A comma-separated list of vehicle labels. Removes all vehicles"
            " whose labels appear in this list. When multiple vehicles have the"
            " same label, and it appears in this list, all of them are removed."
        ),
    )

    parsed_args = parser.parse_args(args)
    return cls(**vars(parsed_args))


def _remove_vehicles_by_label(
    model: cfr_json.ShipmentModel, vehicle_labels: Iterable[str]
) -> None:
  """Removes all vehicles in the model whose label is in `vehicle_labels`.

  Args:
    model: The model from which the vehicles are removed. Modified in place.
    vehicle_labels: The labels of vehicles to be removed from the model.
  """
  indices_to_remove = set()
  labels_to_remove = set(vehicle_labels)
  removed_labels = set()
  for vehicle_index, vehicle in enumerate(cfr_json.get_vehicles(model)):
    vehicle_label = vehicle.get("label", "")
    if not vehicle_label or vehicle_label not in labels_to_remove:
      continue
    indices_to_remove.add(vehicle_index)
    removed_labels.add(vehicle_label)

  if len(removed_labels) != len(labels_to_remove):
    missing_labels = sorted(labels_to_remove - removed_labels)
    raise ValueError(
        "Vehicle labels from --remove_vehicles_by_label do not appear in the"
        f" model: {', '.join(repr(label) for label in missing_labels)}"
    )

  transforms.remove_vehicles(model, indices_to_remove)


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
  if removed_labels := flags.remove_vehicles_by_label:
    _remove_vehicles_by_label(model, removed_labels)
  if duplicated_labels := flags.duplicate_vehicles_by_label:
    _duplicate_vehicles_by_label(model, duplicated_labels)

  io_utils.write_json_to_file(flags.output_file, request)


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  main()
