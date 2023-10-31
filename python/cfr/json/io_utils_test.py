# Copyright 2023 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

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
