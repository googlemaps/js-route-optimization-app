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

from os import path
import tempfile
import textwrap
import unittest

from . import io_utils


class ReadJsonFromFileTest(unittest.TestCase):

  def test_read_valid_file(self):
    with tempfile.NamedTemporaryFile() as tmp_file:
      tmp_file.write("""{
              "foo": [1, 2, 3],
              "bar": true
          }""".encode("utf-8"))
      tmp_file.flush()

      json_data = io_utils.read_json_from_file(tmp_file.name)
    self.assertEqual(json_data, {"foo": [1, 2, 3], "bar": True})


class WriteJsonToFileTest(unittest.TestCase):

  def test_write_to_file_readable(self):
    with tempfile.TemporaryDirectory() as tmp_dir:
      json_filename = path.join(tmp_dir, "test.json")
      io_utils.write_json_to_file(
          json_filename, {"foo": [1, 2, 3], "bar": True}
      )

      with open(json_filename, encoding="utf-8") as f:
        serialized_json = f.read()
        self.assertEqual(
            serialized_json,
            textwrap.dedent("""\
                {
                  "foo": [
                    1,
                    2,
                    3
                  ],
                  "bar": true
                }"""),
        )

  def test_write_to_file_not_human_readable(self):
    with tempfile.TemporaryDirectory() as tmp_dir:
      json_filename = path.join(tmp_dir, "test.json")
      io_utils.write_json_to_file(
          json_filename, {"foo": [1, 2, 3], "bar": True}, human_readable=False
      )

      with open(json_filename, encoding="utf-8") as f:
        serialized_json = f.read()
        self.assertEqual(serialized_json, '{"foo":[1,2,3],"bar":true}')


if __name__ == "__main__":
  unittest.main()
