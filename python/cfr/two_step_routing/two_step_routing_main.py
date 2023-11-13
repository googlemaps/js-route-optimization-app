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
from collections.abc import Mapping
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
    use_refinement: The value of the --use_refinement flag. When True, the
      planner uses a third solve to reoptimize local routes from the same
      parking if they are performed in a sequence (allowing the planner to merge
      and reorganize them) and a fourth phase to clean up the global routes with
      the updated local routes.
    local_grouping: The value of the --local_grouping flag or the default value.
    travel_mode_in_merged_transitions: The value of the
      --travel_mode_in_merged_transitions flag.
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
  use_refinement: bool
  local_grouping: two_step_routing.LocalModelGrouping
  travel_mode_in_merged_transitions: bool
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
      help="Controls the grouping mode in the local model.",
      choices=tuple(two_step_routing.LocalModelGrouping.__members__),
      default="PARKING_AND_TIME",
  )
  parser.add_argument(
      "--travel_mode_in_merged_transitions",
      help="Add travel mode information to transitions in the merged solution.",
      default=False,
      action="store_true",
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
      "--use_refinement",
      help="Use the refinement models to clean up parking location visits.",
      default=False,
      action="store_true",
  )
  parser.add_argument(
      "--reuse_existing",
      help="Reuse existing solution files, if they exist.",
      default=False,
      action="store_true",
  )
  flags = parser.parse_args()

  return Flags(
      request_file=flags.request,
      parking_file=flags.parking,
      google_cloud_project=flags.project,
      google_cloud_token=flags.token,
      local_timeout=flags.local_timeout,
      local_grouping=two_step_routing.LocalModelGrouping[flags.local_grouping],
      travel_mode_in_merged_transitions=flags.travel_mode_in_merged_transitions,
      global_timeout=flags.global_timeout,
      local_refinement_timeout=flags.local_refinement_timeout,
      global_refinement_timeout=flags.global_refinement_timeout,
      use_refinement=flags.use_refinement,
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
  match flags.local_grouping:
    case two_step_routing.LocalModelGrouping.PARKING:
      options = two_step_routing.Options(
          local_model_grouping=two_step_routing.LocalModelGrouping.PARKING,
          local_model_vehicle_fixed_cost=0,
          travel_mode_in_merged_transitions=flags.travel_mode_in_merged_transitions,
      )
    case two_step_routing.LocalModelGrouping.PARKING_AND_TIME:
      options = two_step_routing.Options(
          travel_mode_in_merged_transitions=flags.travel_mode_in_merged_transitions
      )
    case _:
      raise ValueError(
          "Unexpected value of --local_grouping: {flags.local_grouping!r}"
      )

  planner = two_step_routing.Planner(
      request_json, parking_locations, parking_for_shipment, options
  )

  local_request = planner.make_local_request()
  local_request["searchMode"] = 2
  io_utils.write_json_to_file(
      f"{base_filename}.local_request.json", local_request
  )

  logging.info("Solving local model")
  local_response_filename = (
      f"{base_filename}.local_response.{flags.local_timeout}.json"
  )
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
  global_request_traffic_override = False if flags.use_refinement else None
  global_request = planner.make_global_request(
      local_response,
      consider_road_traffic_override=global_request_traffic_override,
  )
  global_request["searchMode"] = 2
  io_utils.write_json_to_file(
      f"{base_filename}.global_request.{flags.local_timeout}.json",
      global_request,
  )

  logging.info("Solving global model")
  timeout_suffix = f"{flags.local_timeout}.{flags.global_timeout}"
  global_response_filename = (
      f"{base_filename}.global_response.{timeout_suffix}.json"
  )
  global_response = _optimize_tours_and_write_response(
      global_request, flags, flags.global_timeout, global_response_filename
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
  io_utils.write_json_to_file(
      f"{base_filename}.merged_request.{timeout_suffix}.json",
      merged_request,
  )
  logging.info("Writing merged response")
  io_utils.write_json_to_file(
      f"{base_filename}.merged_response.{timeout_suffix}.json",
      merged_response,
  )
  if flags.use_refinement:
    logging.info("Creating local refinement model")
    local_refinement_request_filename = (
        f"{base_filename}.local_refinement_request.{timeout_suffix}.json"
    )
    local_refinement_request = planner.make_local_refinement_request(
        local_response, global_response
    )
    io_utils.write_json_to_file(
        local_refinement_request_filename,
        local_refinement_request,
    )

    logging.info("Solving local refinement model")
    local_refinement_response_filename = (
        f"{base_filename}.local_refinement_response.{timeout_suffix}.json"
    )
    local_refinement_response = _optimize_tours_and_write_response(
        local_refinement_request,
        flags,
        flags.local_refinement_timeout,
        local_refinement_response_filename,
    )

    logging.info("Integrating the refinement")
    (
        integrated_local_request,
        integrated_local_response,
        integrated_global_request,
    ) = planner.integrate_local_refinement(
        local_request,
        local_response,
        global_request,
        global_response,
        local_refinement_response,
    )
    io_utils.write_json_to_file(
        f"{base_filename}.integrated_local_request.{timeout_suffix}.json",
        integrated_local_request,
    )
    io_utils.write_json_to_file(
        f"{base_filename}.integrated_local_response.{timeout_suffix}.json",
        integrated_local_response,
    )
    io_utils.write_json_to_file(
        f"{base_filename}.integrated_global_request.{timeout_suffix}.json",
        integrated_global_request,
    )

    logging.info("Solving the integrated global model")
    integrated_global_response_filename = (
        f"{base_filename}.integrated_global_response.{timeout_suffix}.json"
    )
    integrated_global_response = _optimize_tours_and_write_response(
        integrated_global_request,
        flags,
        flags.global_refinement_timeout,
        integrated_global_response_filename,
    )

    logging.info("Merging the results")
    merged_request, merged_response = planner.merge_local_and_global_result(
        integrated_local_response,
        integrated_global_response,
    )

    logging.info("Writing merged integrated request")
    io_utils.write_json_to_file(
        f"{base_filename}.merged_integrated_request.{timeout_suffix}.json",
        merged_request,
    )
    logging.info("Writing merged integrated response")
    io_utils.write_json_to_file(
        f"{base_filename}.merged_integrated_response.{timeout_suffix}.json",
        merged_response,
    )


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  _run_two_step_planner()
