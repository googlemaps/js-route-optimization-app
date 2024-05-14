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

import argparse
from os import path
import tempfile
import unittest

from . import utils


class MyEnum(utils.EnumForArgparse):
  A = 1
  B = 2
  C = 3


class EnumForArgparseTest(unittest.TestCase):
  """Tests for EnumForArgparse."""

  def test_help(self):
    parser = argparse.ArgumentParser(exit_on_error=False)
    MyEnum.add_as_argument(parser, "--my")

    help_string = parser.format_help()
    self.assertIn("--my {A,B,C}", help_string)
    self.assertNotIn("MyEnum.A", help_string)

  def test_parse_flags(self):
    parser = argparse.ArgumentParser(exit_on_error=False)
    MyEnum.add_as_argument(parser, "--my")

    args = parser.parse_args(())
    self.assertIsNone(args.my)

    args = parser.parse_args(("--my", "C"))
    self.assertEqual(args.my, MyEnum.C)

    with self.assertRaisesRegex(
        argparse.ArgumentError,
        "argument --my: invalid value: 'D', possible values are: 'A', 'B', 'C'",
    ):
      parser.parse_args(
          ("--my", "D"),
      )

  def test_with_default_value(self):
    parser = argparse.ArgumentParser(exit_on_error=False)
    MyEnum.add_as_argument(parser, "--my", default=MyEnum.B)

    args = parser.parse_args(())
    self.assertEqual(args.my, MyEnum.B)

    args = parser.parse_args(("--my", "A"))
    self.assertEqual(args.my, MyEnum.A)

  def test_repr(self):
    self.assertEqual(repr(MyEnum.A), "<MyEnum.A: 1>")


class IsNonEmptyFileTest(unittest.TestCase):
  """Tests for is_non_empty_file."""

  def test_file_does_not_exist(self):
    with tempfile.TemporaryDirectory() as tmpdir:
      filename = path.join(tmpdir, "does_not_exist.json")
      self.assertFalse(utils.is_non_empty_file(filename))

  def test_file_is_empty(self):
    with tempfile.TemporaryDirectory() as tmpdir:
      filename = path.join(tmpdir, "exists.txt")
      with open(filename, "w"):
        # Create the file, but do not write anything to it.
        pass
      self.assertTrue(path.exists(filename))
      self.assertFalse(utils.is_non_empty_file(filename))

  def test_file_is_not_empty(self):
    with tempfile.TemporaryDirectory() as tmpdir:
      filename = path.join(tmpdir, "non_empty.txt")
      with open(filename, "w") as f:
        f.write("I contain something!")
      self.assertTrue(utils.is_non_empty_file(filename))


if __name__ == "__main__":
  unittest.main()
