# Copyright 2024 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

"""Functions for invoking the CFR API."""

from http import client
import json
import socket

from . import cfr_json


class ApiCallError(Exception):
  """Exceptions raised when there is a problem with invoking the API."""


def optimize_tours(
    request: cfr_json.OptimizeToursRequest,
    google_cloud_project: str,
    google_cloud_token: str,
    timeout: cfr_json.DurationString,
) -> cfr_json.OptimizeToursResponse:
  """Solves request using the Google CFR API.

  Args:
    request: The request to be solved.
    google_cloud_project: The name of the Google Cloud project used in the API.
    google_cloud_token: The Google Cloud access token used to invoke the API.
    timeout: The solve deadline for the request.

  Returns:
    Upon success, returns the response from the server.

  Raises:
    ApiCallError: When the CFR API invocation fails. The exception contains the
      status, explanation, and the body of the response.
  """
  host = "cloudoptimization.googleapis.com"
  path = f"/v1/projects/{google_cloud_project}:optimizeTours"
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
