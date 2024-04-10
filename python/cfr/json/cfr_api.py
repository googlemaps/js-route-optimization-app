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

"""Functions for invoking the CFR API."""

import argparse
from collections.abc import Sequence
import dataclasses
from http import client
import json
import socket
from typing import Self

from . import cfr_json


class ApiCallError(Exception):
  """Exceptions raised when there is a problem with invoking the API."""


@dataclasses.dataclass(frozen=True)
class Flags:
  """Holds values of command-line flags related to the CFR API.

  This class can be extended with additional command-line flags. To do so,
  create a data class derived from this class, and override the_add_arguments()
  method to add the new arguments. The names of the arguments and the attributes
  of the class must match.
  """

  project: str
  token: str
  api_host: str | None
  api_path: str | None

  @classmethod
  def from_command_line(
      cls, program_name: str, args: Sequence[str] | None = None
  ) -> Self:
    parser = argparse.ArgumentParser(program_name)
    cls.add_arguments(parser)
    parsed_flags = parser.parse_args(args)
    return cls(**vars(parsed_flags))

  @classmethod
  def add_arguments(cls, parser: argparse.ArgumentParser) -> None:
    """Adds command-line flag definitions to `parser`.

    Child classes can override this method to append their own flag definitions.
    Any overrides of this method must call super()._add_arguments() to add also
    the argument definitions from the base classes.

    Args:
      parser: The argparse parser to which the flag definitions are added.
    """
    parser.add_argument(
        "--project",
        required=True,
        help="The Google Cloud project ID used for the CFR API requests.",
    )
    parser.add_argument(
        "--token", required=True, help="The Google Cloud auth key."
    )
    parser.add_argument(
        "--api_host",
        default=None,
        help=(
            "The hostname used in the CFR HTTP API calls. When not specified,"
            " the default host is used."
        ),
    )
    parser.add_argument(
        "--api_path",
        default=None,
        help=(
            "The path to the optimizeTours method in the CFR HTTP API call."
            " When it contains '{project}' as a substring, it will be replaced"
            " with the project ID when making the API call. When None, the"
            " default path is used."
        ),
    )


def optimize_tours(
    request: cfr_json.OptimizeToursRequest,
    google_cloud_project: str,
    google_cloud_token: str,
    timeout: cfr_json.DurationString,
    host: str | None = None,
    path: str | None = None,
) -> cfr_json.OptimizeToursResponse:
  """Solves request using the Google CFR API.

  Args:
    request: The request to be solved.
    google_cloud_project: The name of the Google Cloud project used in the API.
    google_cloud_token: The Google Cloud access token used to invoke the API.
    timeout: The solve deadline for the request.
    host: The host of the CFR API endpoint. When None, the default CFR endpoint
      is used.
    path: The path of the optimizeTours API method. When it contains "{project}"
      as a substring, it will be replaced by the name of the project when making
      the HTTP API call. When None, the default CFR API path for optimizeTours
      is used.

  Returns:
    Upon success, returns the response from the server.

  Raises:
    ApiCallError: When the CFR API invocation fails. The exception contains the
      status, explanation, and the body of the response.
  """
  if host is None:
    host = "cloudoptimization.googleapis.com"
  if path is None:
    path = "/v1/projects/{project}:optimizeTours"
  path = path.format(project=google_cloud_project)
  timeout_seconds = cfr_json.parse_duration_string(timeout).total_seconds()
  headers = {
      "Content-Type": "application/json",
      "Authorization": f"Bearer {google_cloud_token}",
      "x-goog-user-project": google_cloud_project,
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

  connection.request("POST", path, body=json.dumps(request), headers=headers)
  response = connection.getresponse()
  if response.status != 200:
    body = response.read()
    raise ApiCallError(
        f"Request failed: {response.status}  {response.reason}\n{body}"
    )
  return json.load(response)
