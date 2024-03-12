# Copyright 2024 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

"""Takes a CFR JSON request + response and recomputes costs and other details.

A command-line utility that computes the costs and other metrics of a CFR JSON
response for a given request. Only the sequence of visits is used from the
response, the rest (timing, costs, metrics, ...) is recomputed/filled in from
scratch.

This tool is useful for what-if analysis, and to test the cost of alternative
solutions.

Typical usage:
  python3 -m cfr.json.evaluate_solution \
    --project "${YOUR_GCLOUD_PROJECT_ID}" \
    --token "${YOUR_GCLOUD_TOKEN}" \
    --input_request scenario.json \
    --input_response alternative_solution.json \
    --output_response alternative_solution_with_costs.json
"""

import argparse
from collections.abc import Mapping, Sequence
import copy
import dataclasses
import logging

from . import cfr_api
from . import cfr_json
from . import io_utils
from . import transforms


@dataclasses.dataclass(frozen=True)
class Flags(cfr_api.Flags):
  """Holds values of command-line flags of this script."""

  input_request: str
  input_response: str
  reduced_request: str | None
  reduced_response: str | None
  output_response: str

  @classmethod
  def add_arguments(cls, parser: argparse.ArgumentParser) -> None:
    """See base class."""
    super().add_arguments(parser)
    parser.add_argument(
        "--input_request",
        required=True,
        help=(
            "The name of the file that contains the input CFR request in the"
            " JSON format."
        ),
    )
    parser.add_argument(
        "--input_response",
        required=True,
        help=(
            "The name of the file that contains the input CFR response in the"
            " JSON format."
        ),
    )
    parser.add_argument(
        "--reduced_request",
        default=None,
        help=(
            "Optional. The name of the file to which the tool writes the"
            " request sent to the CFR service to recompute the costs of the"
            " solution. When not provided, the request is not stored."
        ),
    )
    parser.add_argument(
        "--reduced_response",
        default=None,
        help=(
            "Optional. The name of the file to which the tool writes the"
            " response from the CFR service to the reduced request. When not"
            " provided, the response is not stored."
        ),
    )
    parser.add_argument(
        "--output_response",
        required=True,
        help=(
            "The name of the file to which the tool writes the response with"
            " the recomputed costs and metrics in the JSON format."
        ),
    )


def make_reduced_request(
    model: cfr_json.ShipmentModel,
    routes: Sequence[cfr_json.ShipmentRoute],
) -> tuple[
    cfr_json.OptimizeToursRequest,
    Mapping[int, int],
    Mapping[int, cfr_json.Shipment],
]:
  """Transforms `request` to evaluate routes from `response`.

  Creates a new request that, when passed through the CFR API, takes the visit
  sequences from the routes in `response` and fills in timing and computes the
  distances, durations, and costs.

  Changes made by the transformation:
  1. Remove all shipments that are skipped in `response.routes`.
  2. Take visit sequences from `response.routes` and create an injected solution
     constraint from it.
  3. Set search mode to "RETURN_FAST" to make the solver return as soon as
     possible.

  Args:
    model: The model, for which the cost is computed. Kept intact by the
      function.
    routes: The routes to evaluate. Kept intact by the function.

  Returns:
    Tuple `(reduced_request, new_shipment_for_old_shipment, skipped_shipments)`
    where `reduced_request` is the transformed request as described above, and
    `skipped_shipments` is a collection of skipped shipments from the original
    request represented as a mapping from the original index of the skipped
    shipment to its data.
  """
  model = copy.deepcopy(model)
  shipments = cfr_json.get_shipments(model)
  reduced_routes = []
  for route in routes:
    reduced_route: cfr_json.ShipmentRoute = {}
    reduced_routes.append(reduced_route)
    if (vehicle_index := route.get("vehicleIndex")) is not None:
      reduced_route["vehicleIndex"] = vehicle_index

    visits = cfr_json.get_visits(route)
    if not visits:
      continue

    reduced_visits = []
    reduced_route["visits"] = reduced_visits

    if (vehicle_start_time := route.get("vehicleStartTime")) is not None:
      reduced_route["vehicleStartTime"] = vehicle_start_time

    for visit in visits:
      reduced_visit: cfr_json.Visit = {}
      if (shipment_index := visit.get("shipmentIndex")) is not None:
        reduced_visit["shipmentIndex"] = shipment_index
      if (shipment_label := visit.get("shipmentLabel")) is not None:
        reduced_visit["shipmentLabel"] = shipment_label
      if (is_pickup := visit.get("isPickup")) is not None:
        reduced_visit["isPickup"] = is_pickup
      reduced_visits.append(reduced_visit)

  skipped_shipment_indices = cfr_json.get_skipped_shipments_from_routes(
      model, reduced_routes
  )
  skipped_shipments = {
      shipment_index: shipments[shipment_index]
      for shipment_index in skipped_shipment_indices
  }
  new_shipment_for_old_shipment = transforms.remove_shipments(
      model, skipped_shipment_indices
  )
  # We remove only shipments that are skipped in the routes; no visit is removed
  # but we still need to update shipment indices in the visits.
  transforms.update_shipment_indices_in_shipment_routes(
      reduced_routes, new_shipment_for_old_shipment
  )

  return (
      {
          "model": model,
          "searchMode": "RETURN_FAST",
          "injectedSolutionConstraint": {
              "routes": reduced_routes,
              "constraintRelaxations": [{
                  "relaxations": [
                      {"level": "RELAX_VISIT_TIMES_AFTER_THRESHOLD"}
                  ]
              }],
          },
      },
      new_shipment_for_old_shipment,
      skipped_shipments,
  )


def integrate_skipped_shipments(
    response: cfr_json.OptimizeToursResponse,
    new_shipment_for_old_shipment: Mapping[int, int],
    skipped_shipments: Mapping[int, cfr_json.Shipment],
) -> cfr_json.OptimizeToursResponse:
  """Integrates skipped shipment to a reduced request and its response.

  Assumes that `new_shipment_for_old_shipment` and `skipped_shipments` are the
  outputs of `make_reduced_request()` for some input CFR request, and `response`
  is a response from the CFR solver for the corresponding request.

  Creates a new response for the original request that uses the routes from
  `response` and where all shipments from `skipped_shipments` are skipped. Also
  updates the metrics that concern skipped shipments and costs.

  Args:
    response: A response for `request`.
    new_shipment_for_old_shipment: Mapping from shipment indices in the original
      request to shipment indices in the reduced request.
    skipped_shipments: The list of skipped shipments returned along with
      `request` by `make_reduced_request()`.

  Returns:
    A new response for the original request that incorporates routes from
    `response` and additional skipped shipments from `skipped_shipments`.
  """
  if not new_shipment_for_old_shipment.keys().isdisjoint(
      skipped_shipments.keys()
  ):
    raise ValueError(
        "The shipment indices in new_shipments_for_old_shipments and"
        " skipped_shipments are not disjoint:\n"
        f"{new_shipment_for_old_shipment.keys()=}\n{skipped_shipments.keys()=}"
    )

  old_shipment_for_new_shipment = {}
  for old_index, new_index in new_shipment_for_old_shipment.items():
    if new_index in old_shipment_for_new_shipment:
      raise ValueError(
          "Duplicate values in new_shipments_for_old_shipments:\n"
          f"{new_shipment_for_old_shipment=}"
      )
    old_shipment_for_new_shipment[new_index] = old_index

  # Create a new response with updated shipment indices.
  new_response: cfr_json.OptimizeToursResponse = copy.deepcopy(response)
  for route in cfr_json.get_routes(new_response):
    for visit in cfr_json.get_visits(route):
      shipment_index = visit.get("shipmentIndex", 0)
      visit["shipmentIndex"] = old_shipment_for_new_shipment[shipment_index]

  # Add the skipped shipments that were removed from the request.
  if new_response_skipped_shipments := new_response.get("skippedShipments"):
    raise ValueError(
        "The response to the reduced request had skipped shipments. The routes"
        " were infeasible. Unexpected skipped shipments:"
        f" {new_response_skipped_shipments!r}"
    )

  new_response_skipped_shipments = []
  new_skipped_shipment_penalty_cost = 0
  new_skipped_mandatory_shipments = 0
  for shipment_index, skipped_shipment in skipped_shipments.items():
    penalty_cost = skipped_shipment.get("penaltyCost")
    if penalty_cost is None:
      new_skipped_mandatory_shipments += 1
    else:
      new_skipped_shipment_penalty_cost += penalty_cost
    new_skipped_shipment: cfr_json.SkippedShipment = {"index": shipment_index}
    if (label := skipped_shipment.get("label")) is not None:
      new_skipped_shipment["label"] = label
    new_response_skipped_shipments.append(new_skipped_shipment)
  new_response["skippedShipments"] = new_response_skipped_shipments

  # Adjust costs and metrics.
  if (metrics := new_response.get("metrics")) is None:
    raise ValueError("Metrics are missing in `response`.")
  assert metrics.get("skippedMandatoryShipmentCount", 0) == 0, (
      "The response to the reduced request can't have skipped mandatory"
      " shipments. We already verified that it doesn't have any skipped"
      " shipments."
  )
  metrics["skippedMandatoryShipmentCount"] = new_skipped_mandatory_shipments

  total_cost = metrics.get("totalCost", 0)
  metrics["totalCost"] = total_cost + new_skipped_shipment_penalty_cost
  # Update also the deprecated OptimizeToursResponse.totalCost.
  total_cost = new_response.get("totalCost", 0)
  new_response["totalCost"] = total_cost + new_skipped_shipment_penalty_cost

  assert metrics.get("model.shipments.penalty_cost", 0) == 0, (
      "The response to the reduced request can't have non-zero penalty cost for"
      " skipped shipments. We already verified that it doesn't have any skipped"
      " shipments."
  )
  costs = metrics.get("costs")
  if costs is None:
    costs = {}
    metrics["costs"] = costs
  costs["model.shipments.penalty_cost"] = new_skipped_shipment_penalty_cost

  return new_response


def main(args: Sequence[str] | None = None) -> None:
  """runs the command-line utility.

  Args:
    args: The command-line flags used by the utility. When `None`, command-line
      flags are taken from `sys.argv`.
  """
  flags = Flags.from_command_line("evaluate_solution", args)
  input_request: cfr_json.OptimizeToursRequest = io_utils.read_json_from_file(
      flags.input_request
  )
  input_response: cfr_json.OptimizeToursResponse = io_utils.read_json_from_file(
      flags.input_response
  )
  reduced_request, new_shipment_for_old_shipment, skipped_shipments = (
      make_reduced_request(
          input_request["model"], cfr_json.get_routes(input_response)
      )
  )
  if flags.reduced_request is not None:
    io_utils.write_json_to_file(flags.reduced_request, reduced_request)
  reduced_response = cfr_api.optimize_tours(
      reduced_request,
      google_cloud_project=flags.project,
      google_cloud_token=flags.token,
      timeout="240s",
      host=flags.api_host,
      path=flags.api_path,
  )
  if flags.reduced_response is not None:
    io_utils.write_json_to_file(flags.reduced_response, reduced_response)
  try:
    output_response = integrate_skipped_shipments(
        reduced_response,
        new_shipment_for_old_shipment,
        skipped_shipments,
    )
    io_utils.write_json_to_file(flags.output_response, output_response)
  except ValueError as e:
    logging.error("Could not integrate the solution: %s", e)


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  main()
