# Copyright 2024 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.


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
