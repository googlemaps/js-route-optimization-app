# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

r"""End-to-end example of running the two-step delivery planner.

Reads a CFR request and parking location data from JSON file and runs the
two-step delivery planner on by making requests to the CFR service. The CFR
request is a CFR request in the JSON format; the parking data is stored in
a JSON file that can be parsed with `two_step_routing.load_parking_from_json()`.

To run this, you need to have a Google cloud project with the CFR API enabled,
and have an access token for using the HTTP API:

  PROJECT_ID=...
  GCLOUD_TOKEN=$(gcloud auth print-access-token)

  CFR_REQUEST_JSON_FILE=...
  PARKING_JSON_FILE=...

  python3 two_step_routing_main.py \
      --request "${CFR_REQUEST_JSON_FILE}" \
      --parking "${PARKING_JSON_FILE} \
      --project "${PROJECT_ID}" \
      --token "${GCLOUD_TOKEN}"
"""

import argparse
import dataclasses
from http import client
import json
import logging
import os
import socket

from ..json import cfr_json
from ..json import io_utils
from . import two_step_routing


class PlannerError(Exception):
  """Raised when there is an exception in the planner."""


@dataclasses.dataclass(frozen=True)
class Flags:
  """Holds the values of command-line flags of this script.

  Attributes:
    request_file: The value of the --request flag.
    parking_file: The value of the --parking flag.
    google_cloud_project: The value of the --project flag.
    google_cloud_token: The value of the --token flag.
    reuse_existing: The value of the --reuse_existing flag. When a file with a
      response exists, load it instead of resolving the request.
    num_refinements: The value of the --use_refinements flag.
    end_with_local_refinement: The value of the --end_with_local_refinement
      flag.
    local_grouping: The value of the --local_grouping flag or the default value.
    local_model_vehicle_fixed_cost: The value of the
      --local_model_vehicle_fixed_cost flag.
    travel_mode_in_merged_transitions: The value of the
      --travel_mode_in_merged_transitions flag.
    inject_start_times_to_refinement_first_solution: The value of the
      --inject_start_times_to_refinement_first_solution flag.
    local_timeout: The value of the --local_timeout flag or the default value.
    global_timeout: The value of the --global_timeout flag or the default value.
    local_refinement_timeout: The value of the --local_refinement_timeout flag
      or the default value.
    global_refinement_timeout: The value of the --global_refinement_timeout flag
      or the default value.
  """

  request_file: str
  parking_file: str
  google_cloud_project: str
  google_cloud_token: str
  reuse_existing: bool
  num_refinements: int
  end_with_local_refinement: bool
  local_grouping: two_step_routing.InitialLocalModelGrouping
  local_model_vehicle_fixed_cost: float | None
  travel_mode_in_merged_transitions: bool
  inject_start_times_to_refinement_first_solution: bool
  local_timeout: cfr_json.DurationString
  global_timeout: cfr_json.DurationString
  local_refinement_timeout: cfr_json.DurationString
  global_refinement_timeout: cfr_json.DurationString


def _parse_flags() -> Flags:
  """Parses the command-line flags from sys.argv."""
  parser = argparse.ArgumentParser(prog="two_step_routing_main")
  parser.add_argument(
      "--request",
      required=True,
      help=(
          "The name of the file that contains the input CFR request in the JSON"
          " format."
      ),
  )
  parser.add_argument(
      "--parking",
      required=True,
      help=(
          "The name of the file that contains the parking data in the JSON"
          " format. "
      ),
  )
  parser.add_argument(
      "--project",
      required=True,
      help="The Google Cloud project ID used for the CFR API requests.",
  )
  parser.add_argument(
      "--token", required=True, help="The Google Cloud auth key."
  )
  parser.add_argument(
      "--local_grouping",
      help="Controls the initial grouping of shipments in the local model.",
      type=two_step_routing.InitialLocalModelGrouping.from_string,
      default=two_step_routing.InitialLocalModelGrouping(time_windows=True),
  )
  parser.add_argument(
      "--local_model_vehicle_fixed_cost",
      default=0,
      type=float,
      help=(
          "The cost of a vehicle in the initial local model. When None, the"
          " default cost determined by the solver is used."
      ),
  )
  parser.add_argument(
      "--travel_mode_in_merged_transitions",
      help="Add travel mode information to transitions in the merged solution.",
      default=False,
      action=argparse.BooleanOptionalAction,
  )
  parser.add_argument(
      "--inject_start_times_to_refinement_first_solution",
      help=(
          "Use visit start times in the first solution injected to the request"
          " in the global refinement request. This can make the solver more"
          " efficient when loading the solution; however, it can also make the"
          " refinement request infeasible when the travel times change, e.g."
          " because of map data update between the original request and the"
          " refinement."
      ),
      default=False,
      action=argparse.BooleanOptionalAction,
  )
  parser.add_argument(
      "--local_timeout",
      help=(
          "The timeout used for the local model. Uses the duration string"
          " format."
      ),
      default="240s",
  )
  parser.add_argument(
      "--global_timeout",
      help="The timeout for the global model. Uses the duration string format.",
      default="1800s",
  )
  parser.add_argument(
      "--local_refinement_timeout",
      help=(
          "The timeout for the local refinement model. Uses the duration string"
          " format."
      ),
      default="240s",
  )
  parser.add_argument(
      "--global_refinement_timeout",
      help=(
          "The timeout for the global refinement model. Uses the duration"
          " string format."
      ),
      default="240s",
  )
  parser.add_argument(
      "--num_refinements",
      help=(
          "The number of refinement rounds applied to the solution. In each"
          " refinement round, the solver first re-optimizes local routes when"
          " there are two or more visits to the parking in a sequence, and then"
          " updates the global solution to reflect and take advantage of the"
          " potentially more optimized local routes. When 0, no refinement is"
          " applied."
      ),
      default=0,
      type=int,
      action="store",
  )
  parser.add_argument(
      "--end_with_local_refinement",
      help=(
          "End the refinement with a local refinement phase. The last global"
          " refinement is obtained only by integrating the local refinement"
          " response."
      ),
      default=False,
      action=argparse.BooleanOptionalAction,
  )
  parser.add_argument(
      "--reuse_existing",
      help="Reuse existing solution files, if they exist.",
      default=False,
      action=argparse.BooleanOptionalAction,
  )
  flags = parser.parse_args()

  return Flags(
      request_file=flags.request,
      parking_file=flags.parking,
      google_cloud_project=flags.project,
      google_cloud_token=flags.token,
      local_timeout=flags.local_timeout,
      local_grouping=flags.local_grouping,
      local_model_vehicle_fixed_cost=flags.local_model_vehicle_fixed_cost,
      travel_mode_in_merged_transitions=flags.travel_mode_in_merged_transitions,
      inject_start_times_to_refinement_first_solution=flags.inject_start_times_to_refinement_first_solution,
      global_timeout=flags.global_timeout,
      local_refinement_timeout=flags.local_refinement_timeout,
      global_refinement_timeout=flags.global_refinement_timeout,
      num_refinements=flags.num_refinements,
      end_with_local_refinement=flags.end_with_local_refinement,
      reuse_existing=flags.reuse_existing,
  )


def _run_optimize_tours(
    request: cfr_json.OptimizeToursRequest,
    flags: Flags,
    timeout: cfr_json.DurationString,
) -> cfr_json.OptimizeToursResponse:
  """Solves request using the Google CFR API.

  Args:
    request: The request to be solved.
    flags: The command-line flags.
    timeout: The solve deadline for the request.

  Returns:
    Upon success, returns the response from the server.

  Raises:
    PlannerError: When the CFR API invocation fails. The exception contains the
      status, explanation, and the body of the response.
  """
  host = "cloudoptimization.googleapis.com"
  path = f"/v1/projects/{flags.google_cloud_project}:optimizeTours"
  timeout_seconds = cfr_json.parse_duration_string(timeout).total_seconds()
  headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {flags.google_cloud_token}",
      "x-goog-user-project": flags.google_cloud_project,
      "X-Server-Timeout": str(timeout_seconds),
  }
  connection = client.HTTPSConnection(host)
  connection.connect()
  # Set up TCP keepalive pings for the connection to avoid losing it due to
  # inactivity. This is important when using deadlines longer than a few
  # minutes. The parameters used below were sufficient to successfully complete
  # requests running up to one hour.
  sock = connection.sock
  sock.setsockopt(socket.SOL_SOCKET, socket.SO_KEEPALIVE, 1)
  sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPIDLE, 60)
  sock.setsockopt(socket.IPPROTO_TCP, socket.TCP_KEEPINTVL, 60)
  sock.setsockopt(
      socket.IPPROTO_TCP, socket.TCP_KEEPCNT, max(int(timeout_seconds) // 30, 1)
  )

  # For longer running requests, it may be necessary to set an explicit deadline
  # and set up keepalive pings so that the connection is not dropped before the
  # server returns.
  connection.request("POST", path, body=json.dumps(request), headers=headers)
  response = connection.getresponse()
  if response.status != 200:
    body = response.read()
    raise PlannerError(
        f"Request failed: {response.status}  {response.reason}\n{body}"
    )
  return json.load(response)


def _optimize_tours_and_write_response(
    request: cfr_json.OptimizeToursRequest,
    flags: Flags,
    timeout: cfr_json.DurationString,
    output_filename: str,
) -> cfr_json.OptimizeToursResponse:
  """Returns response to `request` and writes it to a file.

  When `flags.reuse_existing` is True and `output_filename` exists, loads the
  response from the file instead of sending a request to the CFR server. This
  can be used to achieve a make-like functionality for the solver.

  Args:
    request: The request to be solved.
    flags: The command-line flags.
    timeout: The solve deadline for the request.
    output_filename: The name of the file to write the response to.

  Returns:
    Upon success, returns the response from the server or the cached response
    from the output file.

  Raises:
    PlannerError: When the CFR API invocation fails. The exception contains the
      status, explanation, and the body of the response.
  """
  if flags.reuse_existing and os.path.isfile(output_filename):
    return io_utils.read_json_from_file(output_filename)
  response = _run_optimize_tours(request, flags, timeout)
  io_utils.write_json_to_file(
      output_filename,
      response,
  )
  return response


def _run_two_step_planner() -> None:
  """Runs the two-step planner with parameters from command-line flags."""
  flags = _parse_flags()

  logging.info("Parsing %s", flags.request_file)
  request_json: cfr_json.OptimizeToursRequest = io_utils.read_json_from_file(
      flags.request_file
  )
  logging.info("Parsing %s", flags.parking_file)
  parking_json = io_utils.read_json_from_file(flags.parking_file)

  base_filename, _ = os.path.splitext(flags.request_file)

  logging.info("Extracting parking locations")
  parking_locations, parking_for_shipment = (
      two_step_routing.load_parking_from_json(parking_json)
  )

  logging.info("Creating local model")
  options = two_step_routing.Options(
      initial_local_model_grouping=flags.local_grouping,
      local_model_vehicle_fixed_cost=flags.local_model_vehicle_fixed_cost,
      travel_mode_in_merged_transitions=flags.travel_mode_in_merged_transitions,
  )
  planner = two_step_routing.Planner(
      request_json, parking_locations, parking_for_shipment, options
  )

  refinement_index = None
  timeout_suffix = f"{flags.local_timeout}.{flags.global_timeout}"

  def make_filename(stem, timeout_string=None):
    if timeout_string is None:
      timeout_string = timeout_suffix
    parts = [base_filename]
    if refinement_index is not None:
      parts.append(f"refined_{refinement_index}")
    parts.append(stem)
    if timeout_string:
      parts.append(timeout_string)
    parts.append("json")
    return ".".join(parts)

  local_request = planner.make_local_request()
  local_request["searchMode"] = 2
  io_utils.write_json_to_file(make_filename("local_request", ""), local_request)

  logging.info("Solving local model")
  local_response_filename = make_filename("local_response", flags.local_timeout)
  local_response = _optimize_tours_and_write_response(
      local_request,
      flags,
      flags.local_timeout,
      local_response_filename,
  )

  logging.info("Creating global model")
  # When doing a refinement pass later, do not use live traffic in the base
  # global model. We will be injecting the solution from the base global model
  # into a refined global model, and for this to work correctly, we need to use
  # the same duration/distance matrices in both solves.
  global_request_traffic_override = False if flags.num_refinements > 0 else None
  global_request = planner.make_global_request(
      local_response,
      consider_road_traffic_override=global_request_traffic_override,
  )
  global_request["searchMode"] = 2
  io_utils.write_json_to_file(
      make_filename("global_request", flags.local_timeout),
      global_request,
  )

  logging.info("Solving global model")
  global_response = _optimize_tours_and_write_response(
      global_request,
      flags,
      flags.global_timeout,
      make_filename("global_response"),
  )

  # NOTE(ondrasej): Create the merged request+response from the first two phases
  # even when refinement is used. Having a merged response from the first two
  # phases in addition to the responses from the refined plan is very useful
  # when evaluating the effects of the refinement.
  # Each version uses a different file name, so there is no risk of creating a
  # naming conflict or overwriting one with the other.
  logging.info("Merging the results")
  merged_request, merged_response = planner.merge_local_and_global_result(
      local_response, global_response
  )

  logging.info("Writing merged request")
  io_utils.write_json_to_file(make_filename("merged_request"), merged_request)
  logging.info("Writing merged response")
  io_utils.write_json_to_file(make_filename("merged_response"), merged_response)

  # Add the refinement timeouts to the file names produced by make_filename().
  timeout_suffix += (
      f".{flags.local_refinement_timeout}.{flags.global_refinement_timeout}"
  )
  for refinement_index in range(1, flags.num_refinements + 1):
    logging.info("Refinement round #%d", refinement_index)
    logging.info("Creating local refinement model")
    local_refinement_request = planner.make_local_refinement_request(
        local_response, global_response
    )
    io_utils.write_json_to_file(
        make_filename("local_request"),
        local_refinement_request,
    )

    logging.info("Solving local refinement model")
    local_refinement_response = _optimize_tours_and_write_response(
        local_refinement_request,
        flags,
        flags.local_refinement_timeout,
        make_filename("local_response"),
    )

    is_last_refinement = refinement_index == flags.num_refinements
    is_last_global_cfr_request = (
        refinement_index == flags.num_refinements - 1
        if flags.end_with_local_refinement
        else is_last_refinement
    )
    integration_mode = (
        two_step_routing.IntegrationMode.VISITS_AND_START_TIMES
        if flags.inject_start_times_to_refinement_first_solution
        else two_step_routing.IntegrationMode.VISITS_ONLY
    )
    if flags.end_with_local_refinement and is_last_refinement:
      integration_mode = two_step_routing.IntegrationMode.FULL_ROUTES

    logging.info("Integrating the refinement")
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
        integrated_global_response,
    ) = planner.integrate_local_refinement(
        local_request,
        local_response,
        global_request,
        global_response,
        local_refinement_response,
        integration_mode=integration_mode,
    )
    if not is_last_global_cfr_request:
      # Override the live traffic option for all but the last global request.
      integrated_global_request["considerRoadTraffic"] = False

    io_utils.write_json_to_file(
        make_filename("integrated_local_request"),
        integrated_local_request,
    )
    io_utils.write_json_to_file(
        make_filename("integrated_local_response"),
        integrated_local_response,
    )
    io_utils.write_json_to_file(
        make_filename("integrated_global_request"),
        integrated_global_request,
    )

    logging.info("Solving the integrated global model")
    if integrated_global_response is None:
      integrated_global_response = _optimize_tours_and_write_response(
          integrated_global_request,
          flags,
          flags.global_refinement_timeout,
          make_filename("integrated_global_response"),
      )

    logging.info("Merging the results")
    merged_request, merged_response = planner.merge_local_and_global_result(
        integrated_local_response,
        integrated_global_response,
    )

    logging.info("Writing merged integrated request")
    io_utils.write_json_to_file(
        make_filename("merged_integrated_request"),
        merged_request,
    )
    logging.info("Writing merged integrated response")
    io_utils.write_json_to_file(
        make_filename("merged_integrated_response"),
        merged_response,
    )

    local_request = integrated_local_request
    local_response = integrated_local_response
    global_request = integrated_global_request
    global_response = integrated_global_response


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  _run_two_step_planner()
