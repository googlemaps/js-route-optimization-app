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

"""General helper functions and classes."""

import argparse
import enum
import os
from typing import Type, TypeVar


_EnumType = TypeVar("_EnumType", bound="EnumForArgparse")


class EnumForArgparse(enum.Enum):
  """An argparse-friendly Enum class.

  Provides a `from_string` class method for argparse-friendly parsing, and
  overrides `__str__` to produce expected formatting of argparse help strings.

  Typical use:
    ```
    class MyEnum(EnumForArgparse):
      A = 1
      B = 2
      C = 3

    parser = argparse.ArgumentParser()
    MyEnum.add_as_argument(
        parser, "--my", help="My arg.", default=MyEnum.C
    )
    ```
  """

  @classmethod
  def add_as_argument(cls, parser: argparse.ArgumentParser, *args, **kwargs):
    """Adds an argument of the enum type to parser.

    Calls `parser.add_argument()` with the right arguments to parse a
    command-line flag of the enum type.

    Args:
      parser: An ArgumentParser to which the flag is added.
      *args: Additional positional arguments are forwarded to
        `parser.add_argument()`.
      **kwargs: Additional keyword arguments are forwarded to
        `parser.add_argument()`.

    Returns:
      The return value of parser.add_argument().
    """
    return parser.add_argument(
        *args, type=cls.from_string, choices=tuple(cls), **kwargs
    )

  @classmethod
  def from_string(cls: Type[_EnumType], value: str) -> _EnumType:
    """Converts a string value to a corresponding enum value.

    Args:
      value: The string value. This must be the name of one of the enum values.

    Returns:
      The enum value corresponding to `value`.

    Raises:
      ArgumentTypeError: When `value` can't be converted to an enum value. The
        exception has an argparse-friendly error message.
    """
    try:
      return cls[value]
    except KeyError:
      readable_possible_values = ", ".join(repr(value.name) for value in cls)
      raise argparse.ArgumentTypeError(
          f"invalid value: {value!r}, possible values are:"
          f" {readable_possible_values}"
      ) from None

  def __str__(self):
    """Converts the enum to a string.

    Uses the `self.name` as the string conversion, so that the flags appear in
    argparse messages the way the user should be entering them. Use `repr()` to
    obtain the usual `Enum` value formatting.

    Returns:
      The string representation of the enum value.
    """
    return self.name


def is_non_empty_file(filename: str) -> bool:
  """Checks whether `filename` exists and is non-empty.

  Args:
    filename: The name of a file to check.

  Returns:
    True when the file exists and is non-empty; False, when it doesn't exist,
    its size can't be determined, or its size is zero.
  """
  try:
    return os.path.getsize(filename) > 0
  except IOError:
    return False
