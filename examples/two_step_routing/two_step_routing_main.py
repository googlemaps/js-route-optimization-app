# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

r"""End-to-end example of running the two-step delivery planner.

Reads a CFR request and parking location data from JSON file and runs the
two-step delivery planner on by making requests to the CFR service. The CFR
request is a CFR request in the JSON format; the parking data is stored in
a JSON file that contains an object with the following keys:
- "parking_locations":
    Contains the list of parking location definitions. Each element of the list
    is a dict that contains the attributes of the class
    two_step_routing.ParkingLocation.
- "parking_for_shipment":
    Contains the mapping from shipment indices to parking location tags for
    shipments that are delivered through a parking location.

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

import two_step_routing


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
    local_timeout: The value of the --local_timeout flag or the default value.
    global_timeout: The value of the --global_timeout flag or the default value.
  """

  request_file: str
  parking_file: str
  google_cloud_project: str
  google_cloud_token: str
  local_timeout: str
  global_timeout: str


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
  flags = parser.parse_args()

  return Flags(
      request_file=flags.request,
      parking_file=flags.parking,
      google_cloud_project=flags.project,
      google_cloud_token=flags.token,
      local_timeout=flags.local_timeout,
      global_timeout=flags.global_timeout,
  )


def _run_optimize_tours(
    request: two_step_routing.OptimizeToursRequest, flags: Flags
) -> two_step_routing.OptimizeToursResponse:
  """Solves request using the Google CFR API.

  Args:
    request: The request to be solved.
    flags: The command-line flags.

  Returns:
    Upon success, returns the response from the server.

  Raises:
    PlannerError: When the CFR API invocation fails. The exception contains the
      status, explanation, and the body of the response.
  """
  host = "cloudoptimization.googleapis.com"
  path = f"/v1/projects/{flags.google_cloud_project}:optimizeTours"
  headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {flags.google_cloud_token}",
      "x-goog-user-project": flags.google_cloud_project,
  }
  connection = client.HTTPSConnection(host)
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


def _write_json_to_file(filename: str, value) -> None:
  """Writes JSON data to a utf-8 text file."""
  with open(filename, "wt", encoding="utf-8") as f:
    json.dump(value, f, ensure_ascii=False, indent=2)


def _run_two_step_planner() -> None:
  """Runs the two-step planner with parameters from command-line flags."""
  flags = _parse_flags()

  logging.info("Parsing %s", flags.request_file)
  with open(flags.request_file, "rb") as f:
    request_json: two_step_routing.OptimizeToursRequest = json.load(f)
  logging.info("Parsing %s", flags.parking_file)
  with open(flags.parking_file, "rb") as f:
    parking_json = json.load(f)

  base_filename, _ = os.path.splitext(flags.request_file)

  logging.info("Extracting parking locations")
  parking_for_shipment: Mapping[int, str] = {
      int(shipment): parking
      for shipment, parking in parking_json["parking_for_shipment"].items()
  }
  parking_locations: list[two_step_routing.ParkingLocation] = []
  for parking_location_json in parking_json["parking_locations"]:
    parking_locations.append(
        two_step_routing.ParkingLocation(**parking_location_json)
    )

  logging.info("Creating local model")
  options = two_step_routing.Options()
  planner = two_step_routing.Planner(
      request_json, parking_locations, parking_for_shipment, options
  )

  local_request = planner.make_local_request()
  local_request["searchMode"] = 2
  local_request["timeout"] = flags.local_timeout
  _write_json_to_file(base_filename + ".local_request.json", local_request)

  logging.info("Solving local model")
  local_response = _run_optimize_tours(local_request, flags)
  _write_json_to_file(base_filename + ".local_response.json", local_response)

  logging.info("Creating global model")
  global_request = planner.make_global_request(local_response)
  global_request["timeout"] = flags.global_timeout
  global_request["searchMode"] = 2
  _write_json_to_file(base_filename + ".global_request.json", global_request)

  logging.info("Solving global model")
  global_response = _run_optimize_tours(global_request, flags)
  _write_json_to_file(base_filename + ".global_response.json", global_response)

  logging.info("Merging the results")
  merged_request, merged_response = planner.merge_local_and_global_result(
      local_response, global_response
  )

  logging.info("Writing merged request")
  _write_json_to_file(base_filename + ".merged_request.json", merged_request)
  logging.info("Writing merged response")
  _write_json_to_file(base_filename + ".merged_response.json", merged_response)


if __name__ == "__main__":
  _run_two_step_planner()
