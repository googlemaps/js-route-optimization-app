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


"""Provides easy access to the test data in JSON format."""

from importlib import resources
import json as json_lib

# Provides easy access to files under `./testdata`. See `_json()` below for
# example use.
_TESTDATA = resources.files(__package__)


def json(path: str):
  """Parses a JSON file at `path` and returns it as a dict/list structure.

  Args:
    path: The path of the JSON file, relative to the package of this module.

  Returns:
    The JSON data structure.
  """
  return json_lib.loads(_TESTDATA.joinpath(path).read_bytes())
