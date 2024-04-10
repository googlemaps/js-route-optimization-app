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

"""Defines transformation functions for break requests.

Defines a mini-language for flexible editing of breaks that allows quick
experimentation by doing the most common transformations in a few lines of code:
- The editing is done using a list of transformation rules that are executed in
  sequence.
- Each rule has a matcher part and an action part. The action part is executed
  only on time windows where the matcher part matches.
- The rules are applied recursively/can be chained; later rules are applied to
  the results of the previous rules.

The grammar of the language:
- Rules are separated by semicolons.
- Each rule contains one or more component; components are separated by
  whitespace.
- Each component has the format `{name}[{op}{value}]` where {name} is the name
  of a selector or an action, {op} is an operator (e.g. `=`), and {value} is an
  operand of the component. For some actions and selectors,the {op}{value} part
  is optional.
  - {name} is an identifier using alphanumeric characters, underscores, and '@'.
  - {operator} can be '=', '~='.
  - {value} can be either a string of non-whitespace characters, a double-quoted
    string (with json-style escaping) or a JSON object. Each selector or action
    may accept only some kinds of values.
  - Selector names start with `@`.

Examples:
- `minDuration=7200s`: sets the duration of all break requests to 7200s.
- `@time=16:00:00 delete`: deletes all breaks that can start at 16:00:00.
- `new earliestStartTime=17:00:00 latestStartTime=18:00:00 minDuration=60s`:
  adds a new break request that starts at 17:00, ends at 18:00, and has a
  minimal duration of 60s. The actual break request will use the dates from
  the global start/end time.

Supported selectors:
- `@time={time}`: selects break rules that can start at the given _time_ (not
  datetime), i.e. {time} is a time that is between `earliestStartTime` and
  `latestStartTime` on any date. When there are less than 24 hours between the
  earliest and the latest start times, this works as expected; otherwise, it
  always selects.
- `@vehicleLabel={label}`: selects break rules that belong to a vehicle with the
  given label (exact match).
- `@vehicleLabel~={regex}`: selects break rules that belong to a vehicle with a
  label that matches {regex} (a Python regular expression).
- `@vehicleWorkTime={time}`: selects break rules that belong to a vehicle that
  can work at the given time.

Supported actions:
- `delete`: deletes the break rule.
- `new`: Instead of editing the existing break rule, creates a new one and edits
  only that one. When a selector is used with new, the new break request is
  added only to vehicles that have a break request matching the selector.
- `location={waypoint}`: Transforms the break into a virtual shipment that makes
  the vehicle go to the given waypoint. The parameters of the shipment are set
  up so that there is a single visit whose start time window and duration
  correspond to the break request at the moment this action was executed. Once
  this action is used, no other actions apply to the affected break rule.
- `virtualShipmentLabel={label}`: When a virtual shipment is created for the
  break, {label} is used as a base of the label of this virtual shipment. The
  full label will include also the vehicle index and the vehicle label. When not
  specified, the default is "break".
- `depot`: Transforms the break into a virtual shipment that makes the vehicle
  return to the depot for the break. Equivalent to using `location={waypoint}`
  with {waypoint} being the start waypoint of the vehicle.
- `earliestStartTime={time}`, `latestStartTime={time}`: Changes the earliest or
  the latest start time of the break request. Similar to `@time`, the action
  takes only _time_ (not datetime) and infers the date from the existing value
  or from the global start/end date.
- `minDuration={duration}`: Changes the minimal duration of the break to
  {minDuration}.

The mini-language is intended to be used through the command-line flags of the
request transformation script `transform_request.py`.
"""

from collections.abc import Callable, Iterable, Sequence
import copy
import dataclasses
import datetime
import functools
import json
import logging
import re
from typing import Any, Protocol, cast

from . import cfr_json


class ContextSelector(Protocol):
  """Function signature of a break context selector."""

  def __call__(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
  ) -> bool:
    ...


class BreakSelector(Protocol):
  """Function signature of a break selector."""

  def __call__(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
      break_request: cfr_json.BreakRequest,
  ) -> bool:
    ...


class BreakTransformAction(Protocol):
  """Function signature of a break transformation action."""

  def __call__(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
      break_request: cfr_json.BreakRequest,
  ) -> Sequence[cfr_json.BreakRequest]:
    ...


@dataclasses.dataclass(frozen=True)
class BreakTransformRule:
  """A single rule for transforming break requests.

  Each rule consists of zero or more selectors that select break requests that
  are transformed, and one or more action that does the transformation.

  Attributes:
    selectors: A collection of selector functions for break requests. A break
      request is selected for modification by this transformation when all the
      selectors and context_selectors return True.
    context_selectors: A collection of selector functions for the "context" of
      break requests. These are selectors that check only the model and the
      vehicle but not the break request itself. A break request is selected for
      modification by this transformation when all the selectors and
      context_selectors return True.
    actions: The list of actions applied to the break request by this
      transformation.
    new_break_request: When True, this transformation creates a new break
      request rather than modify an existing one.
    break_at_waypoint: When not None, this transformation turns the break
      request into a virtual shipment that has a time window corresponding to
      (earliestStartTime, latestStartTime) of the break request, and duration
      equal to the minDuration of the break. The location of the delivery is
      determined by the value of `break_at_waypoint`: when it is the string
      "depot", the break is at the start waypoint of the vehicle; otherwise, the
      value must be a valid Waypoint JSON object, and it will be used as the
      location of the break. The break request itself is removed.
    virtual_shipment_label: WHen the break request is transformed into a virtual
      shipment, this string is used as a base of the label of this shipment.
  """

  selectors: Sequence[BreakSelector]
  context_selectors: Sequence[ContextSelector]
  actions: Sequence[BreakTransformAction]
  new_break_request: bool
  break_at_waypoint: cfr_json.Waypoint | str | None
  virtual_shipment_label: str

  def applies_to(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
      break_request: cfr_json.BreakRequest,
  ) -> bool:
    """Checks that the break transform rule applies to the given break request.

    Returns True when either:
    - self.selectors is non-empty, and all selectors return True.
    - self.selectors is empty, and this rule doesn't add a new break request.

    Args:
      model: The model, in which the check is done.
      vehicle: The vehicle, to which belongs the checked request.
      break_request: The break request to check.

    Returns:
      True when this break rule applies to the given break request. Otherwise,
      False.
    """
    if not self.selectors:
      return not self.new_break_request
    return all(
        selector(model, vehicle, break_request) for selector in self.selectors
    )

  def applies_to_context(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
  ) -> bool:
    """Checks that the break transform rule applies to `model` and `vehicle`.

    Args:
      model: The model, in which the check is done.
      vehicle: The vehicle, for which the check is done.

    Returns:
      True when either:
      - self.context_selectors is empty.
      - self.context_selectors is non-empty and all context selectors return
        True.
      False otherwise.
    """
    return all(selector(model, vehicle) for selector in self.context_selectors)

  def apply_to(
      self,
      model: cfr_json.ShipmentModel,
      vehicle: cfr_json.Vehicle,
      request: cfr_json.BreakRequest,
  ) -> Sequence[cfr_json.BreakRequest]:
    """Applies the actions from this break transformation rule to `request`.

    Args:
      model: The model, in which the transformation rule is applied.
      vehicle: The vehicle, to which the transformation rule is applied.
      request: The break request to which the transformation rule is applied.

    Returns:
      A sequence of break requests after the application of the transformation
      rules.
    """
    transformed_requests = (request,)
    for action in self.actions:
      tmp_requests = []
      for transformed_request in transformed_requests:
        tmp_requests.extend(
            action(model, vehicle, copy.deepcopy(transformed_request))
        )
      transformed_requests = tmp_requests
    return transformed_requests


@dataclasses.dataclass(frozen=True)
class _Component:
  """A single component in the rules extracted by _tokenize.

  Attributes:
    name: The name of the component.
    operator: The operator of the component; None, when only the name is used.
    value: The value of the component; None, when only the name is used. This is
      a JSON-like data structure (when the value starts with a left brace) or a
      string (in other cases).
  """

  name: str
  operator: str | None = None
  value: Any | None = None

  def __str__(self) -> str:
    """Return a string that would parse as this component."""
    if self.operator is None:
      return self.name
    return f"{self.name}{self.operator}{self.value!r}"


def _is_name_char(char: str) -> bool:
  return char.isalnum() or char in ("_", "@")


def _is_operator_char(char: str) -> bool:
  return char in ("=", "<", ">", "~")


def _is_not_value_terminator(char: str) -> bool:
  return not char.isspace() and char != ";"


def _tokenize(rules: str) -> Iterable[_Component | None]:
  """Tokenizes the rule string.

  Args:
    rules: The string that contains the rules to be tokenized.

  Yields:
    One value for each component found in the string; this value is either an
    instance of `Component` for a component, or `None` when the string contains
    a rule separator. Always yields None as the last token.

  Raises:
    ValueError: When `rules` doesn't have the expected format.
  """
  decoder = json.JSONDecoder()
  pos = 0
  size = len(rules)

  def skip_whitespace() -> None:
    nonlocal pos
    while pos < size and rules[pos].isspace():
      pos += 1

  def read_while(condition: Callable[[str], bool]) -> str:
    nonlocal pos
    end_pos = pos
    while end_pos < size and condition(rules[end_pos]):
      end_pos += 1
    output = rules[pos:end_pos]
    pos = end_pos
    return output

  while pos < size:
    skip_whitespace()
    if pos == size:
      break

    if rules[pos] == ";":
      pos += 1
      yield None
      continue

    component_start_pos = pos
    if not _is_name_char(rules[pos]):
      raise ValueError("Can't parse component starting at {rules[pos:]}")

    name = read_while(_is_name_char)
    operator = None
    value = None
    if pos == size:
      yield _Component(name=name)
      break

    if _is_operator_char(rules[pos]):
      operator = read_while(_is_operator_char)
      if pos < size and rules[pos] in ('"', "'", "{", "["):
        # Drop everything we already parsed, because JSONDecoder must start at
        # the beginning of the string.
        rules = rules[pos:]
        size = len(rules)
        # Parse the JSON value, and update the position.
        value, pos = decoder.raw_decode(rules)
      elif pos < size:
        value = read_while(_is_not_value_terminator)
    elif not rules[pos].isspace() and rules[pos] != ";":
      raise ValueError(
          f"Can't parse component starting at {rules[component_start_pos:]!r}"
      )
    yield _Component(name=name, operator=operator, value=value)

  yield None


def _break_start_time_window_contains_time(
    time: datetime.time,
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
    break_request: cfr_json.BreakRequest,
) -> bool:
  """Selector that checks that `break_request` can start at a given time.

  This function works only on the time part of the time window, not the date.
  Correctly handles break requests where the time window crosses the day end
  boundary.

  Args:
    time: The given time to test.
    model: The model in which the matching is done.
    vehicle: The vehicle to which the break request belongs.
    break_request: The break request to test.

  Returns:
    True when `time` is between `earliestStartTime` and `latestStartTime` on any
    day. Otherwise, returns False.
  """
  del model, vehicle  # Unused.
  earliest_start_time = cfr_json.get_break_earliest_start_time(break_request)
  latest_start_time = cfr_json.get_break_latest_start_time(break_request)
  if earliest_start_time > latest_start_time:
    raise ValueError(
        f"earliest_start_time ({earliest_start_time}) is after"
        f" latest_start_time {latest_start_time}"
    )
  if earliest_start_time.date() == latest_start_time.date():
    # When the earliest and the latest start time are on the same day, we can
    # just compare time.
    return earliest_start_time.time() <= time <= latest_start_time.time()
  if (
      earliest_start_time + datetime.timedelta(days=1)
  ).date() == latest_start_time.date():
    # When the earliest start is on one day and the latest start is on the
    # following day, we need to be more careful.
    return (
        time >= earliest_start_time.time() or time <= latest_start_time.time()
    )
  # Multi-day breaks cover any time.
  return True


def _vehicle_label_matches(
    label_matcher: str | re.Pattern[str],
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
) -> bool:
  """Selector that checks the label of the vehicle.

  Args:
    label_matcher: A matcher for the label of the vehicle. When it is a `str`,
      an exact match is required. When it is a compiled regular expression, it
      is tested with `label_matcher.fullmatch(label)`.
    model: The model in which the matching is done.
    vehicle: The vehicle to which the break request belongs.

  Returns:
    True when the label of the vehicle matches `label_matcher` as decribed
    above; otherwise, returns False.
  """
  del model  # Unused.
  vehicle_label = vehicle.get("label", "")
  if isinstance(label_matcher, str):
    return vehicle_label == label_matcher
  return label_matcher.fullmatch(vehicle_label) is not None


def _vehicle_working_hours_contain_time(
    time: datetime.time,
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
) -> bool:
  """Selector that checks that `vehicle` works at a given time.

  This function works only on the time part of the time window, not the date.
  Correctly handles vehicles whose working hours cross the day end boundary.

  Args:
    time: The given time to test.
    model: The model in which the matching is done.
    vehicle: The vehicle to which the break request belongs.

  Returns:
    True when `time` is between the earliest start time of the vehicle and the
    latest end time of the vehicle on any day. Otherwise, returns False.
  """
  earliest_start_time = cfr_json.get_vehicle_earliest_start(model, vehicle)
  latest_end_time = cfr_json.get_vehicle_latest_end(model, vehicle)
  if earliest_start_time.date() == latest_end_time.date():
    # When the earliest start time and the latest end time are on the same day,
    # we just need to test the time.
    res = earliest_start_time.time() <= time <= latest_end_time.time()
  elif (
      earliest_start_time + datetime.timedelta(days=1)
  ).date() == latest_end_time.date():
    # When the latest end time is on the next day from earliest_start_time, we
    # need to be more careful about intervals.
    res = time >= earliest_start_time.time() or time <= latest_end_time.time()
  else:
    res = True

  # Vehicle that work over 24 hours can have a break at any given hour.
  return res


def _parse_time(time: str) -> datetime.time:
  """Parses time only from the format hours:minutes:seconds."""
  try:
    hour_str, minute_str, second_str = time.split(":")
    hour = int(hour_str)
    minute = int(minute_str)
    second = int(second_str)
  except ValueError as err:
    raise ValueError("Can't parse time: {time!r}") from err
  if (
      hour < 0
      or hour > 23
      or minute < 0
      or minute > 59
      or second < 0
      or second > 60
  ):
    raise ValueError("Invalid time {time!r}")
  return datetime.time(hour, minute, second)


def _set_break_start_time_window_component_time(
    component: str,
    time: datetime.time,
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
    break_request: cfr_json.BreakRequest,
) -> Sequence[cfr_json.BreakRequest]:
  """Updates the start or end time of the given break request.

  This function updates only the time, it preserves the date if possible, or
  shifts it by one day up or down, when the break request crosses the day
  boundary.

  Args:
    component: The part of the break request to change. Must be
      "earliestStartTime" or "latestStartTime".
    time: The new time to set to the component.
    model: The model, in which the modification is done.
    vehicle: The vehicle, to which the break request belongs.
    break_request: The break request to modify. Changed in place.

  Returns:
    A list that contains the modified break request.

  Raises:
    ValueError: When it is not possible to find a date so that the new earliest
      or latest start time is within the global time bounds.
  """
  del vehicle  # Unused.
  assert component in ("earliestStartTime", "latestStartTime")
  global_start_time = cfr_json.get_global_start_time(model)
  global_end_time = cfr_json.get_global_end_time(model)
  # TypedDict checks do not allow dynamic access, resp. pytype is not able to
  # prove that this is correct.
  break_request = cast(Any, break_request)
  original_datetime = cfr_json.parse_time_string(break_request[component])
  original_date = original_datetime.date()
  new_datetime = datetime.datetime.combine(original_date, time).replace(
      tzinfo=original_datetime.tzinfo
  )
  # Account for time windows that may go over midnight.
  if new_datetime < global_start_time:
    new_datetime += datetime.timedelta(days=1)
  if new_datetime > global_end_time:
    new_datetime -= datetime.timedelta(days=1)
  if new_datetime < global_start_time or new_datetime > global_end_time:
    raise ValueError(
        f"The new value of `{component}` is outside of the global time bounds:"
        f" {new_datetime=}, {global_start_time=}, {global_end_time=}"
    )
  break_request[component] = cfr_json.as_time_string(new_datetime)
  return (break_request,)


def _set_break_min_duration(
    min_duration: datetime.timedelta,
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
    break_request: cfr_json.BreakRequest,
) -> Sequence[cfr_json.BreakRequest]:
  """Action that updates the minimal duration of a break request."""
  del model, vehicle  # Unused.
  break_request["minDuration"] = cfr_json.as_duration_string(min_duration)
  return (break_request,)


def _delete_break_request(
    model: cfr_json.ShipmentModel,
    vehicle: cfr_json.Vehicle,
    break_request: cfr_json.BreakRequest,
) -> Sequence[cfr_json.BreakRequest]:
  """Action that deletes the break request."""
  del model, vehicle, break_request  # Unused.
  return ()


def compile_rules(rules: str) -> Sequence[BreakTransformRule]:
  """Compiles break transformation rules from a string representation.

  Expects `rules` to follow the syntax described in the module docstring.

  Args:
    rules: The break transformation rules in the string format described above.

  Returns:
    A sequence of compiled break transformation rules.
  """
  compiled_rules = []

  selectors: list[BreakSelector] = []
  context_selectors: list[BreakSelector] = []
  actions: list[BreakTransformAction] = []
  new_break_request = False
  break_at_waypoint = None
  virtual_shipment_label = "break"

  for component in _tokenize(rules):
    if component is None:
      if (
          actions
          or selectors
          or context_selectors
          or break_at_waypoint
          or new_break_request
      ):
        compiled_rules.append(
            BreakTransformRule(
                selectors=selectors,
                context_selectors=context_selectors,
                actions=actions,
                new_break_request=new_break_request,
                break_at_waypoint=break_at_waypoint,
                virtual_shipment_label=virtual_shipment_label,
            )
        )
        selectors = []
        context_selectors = []
        actions = []
        new_break_request = False
        break_at_waypoint = None
        virtual_shipment_label = "break"
      continue

    match component.name:
      case "@time":
        if component.operator != "=":
          raise ValueError(
              f"Only '=' is allowed for @time, found {str(component)!r}"
          )
        selectors.append(
            functools.partial(
                _break_start_time_window_contains_time,
                _parse_time(component.value),
            )
        )
      case "@vehicleLabel":
        match component.operator:
          case "=":
            context_selectors.append(
                functools.partial(_vehicle_label_matches, component.value)
            )
          case "~=":
            context_selectors.append(
                functools.partial(
                    _vehicle_label_matches, re.compile(component.value)
                )
            )
          case _:
            raise ValueError(
                "Only '=' and '~=' are allowed for @vehicleLabel, found"
                f" {str(component)!r}"
            )
      case "@vehicleWorkTime":
        if component.operator != "=":
          raise ValueError(
              "Only '=' is allowed for @vehicleWorkTime, found"
              f" {str(component)!r}"
          )
        context_selectors.append(
            functools.partial(
                _vehicle_working_hours_contain_time,
                _parse_time(component.value),
            )
        )
      case "new":
        new_break_request = True
      case "delete":
        actions.append(_delete_break_request)
      case "depot":
        break_at_waypoint = "depot"
      case "location":
        if component.operator != "=":
          raise ValueError(
              f"Only '=' is allowed for `location`, found {str(component)!r}"
          )
        break_at_waypoint = component.value
      case "virtualShipmentLabel":
        if component.operator != "=":
          raise ValueError(
              "Only '=' is allowed for `virtualShipmentLabel`, found"
              f" {str(component)!r}"
          )
        virtual_shipment_label = component.value
      case "earliestStartTime" | "latestStartTime":
        match component.operator:
          case "=":
            actions.append(
                functools.partial(
                    _set_break_start_time_window_component_time,
                    component.name,
                    _parse_time(component.value),
                )
            )
          case _:
            raise ValueError(
                f"Only '=' is allowed for `{component.name}`, found"
                f" {str(component)!r}"
            )
      case "minDuration":
        match component.operator:
          case "=":
            actions.append(
                functools.partial(
                    _set_break_min_duration,
                    cfr_json.parse_duration_string(component.value),
                )
            )
          case _:
            raise ValueError(
                f"Only '=' is allowed for `{component.name}`, found"
                f" {str(component)!r}"
            )
      case _:
        raise ValueError(
            f"Unexpected name {component.name!r} in {str(component)!r}"
        )

  return compiled_rules


def transform_breaks_for_vehicle(
    compiled_rules: Sequence[BreakTransformRule],
    model: cfr_json.ShipmentModel,
    vehicle_index: int,
) -> None:
  """Transforms breaks for a single vehicle using the provided rules."""

  vehicle = model["vehicles"][vehicle_index]
  break_requests: Sequence[cfr_json.BreakRequest] = []
  if (break_rule := vehicle.get("breakRule")) is not None:
    if (old_break_requests := break_rule.get("breakRequests")) is not None:
      break_requests = old_break_requests
  breaks_at_waypoint: list[
      tuple[cfr_json.Waypoint, cfr_json.BreakRequest, str]
  ] = []

  logging.debug("Processing vehicle_index=%d", vehicle_index)
  for transform in compiled_rules:
    logging.debug("Applying transform %r", transform)
    if not transform.applies_to_context(model, vehicle):
      logging.debug("No context match")
      continue

    matched_anything = False
    new_requests: list[cfr_json.BreakRequest] = []
    for request in break_requests:
      logging.debug("Considering break request %r", request)
      if not transform.applies_to(model, vehicle, request):
        new_requests.append(request)
        continue
      matched_anything = True
      if transform.new_break_request:
        # When creating a new request, the old one passes unmodified.
        new_requests.append(request)
        rule_new_requests = transform.apply_to(
            model,
            vehicle,
            {
                "earliestStartTime": cfr_json.as_time_string(
                    cfr_json.get_global_start_time(model)
                ),
                "latestStartTime": cfr_json.as_time_string(
                    cfr_json.get_global_end_time(model)
                ),
                "minDuration": "0s",
            },
        )
      else:
        rule_new_requests = transform.apply_to(model, vehicle, request)
      if transform.break_at_waypoint:
        for new_request in rule_new_requests:
          breaks_at_waypoint.append((
              transform.break_at_waypoint,
              new_request,
              transform.virtual_shipment_label,
          ))
      else:
        new_requests.extend(rule_new_requests)

    if (
        not matched_anything
        and not transform.selectors
        and transform.new_break_request
    ):
      logging.debug("Adding a new break request without an existing one")
      rule_new_requests = list(
          transform.apply_to(
              model,
              vehicle,
              {
                  "earliestStartTime": cfr_json.as_time_string(
                      cfr_json.get_global_start_time(model)
                  ),
                  "latestStartTime": cfr_json.as_time_string(
                      cfr_json.get_global_end_time(model)
                  ),
                  "minDuration": "0s",
              },
          )
      )
      if transform.break_at_waypoint:
        for new_request in rule_new_requests:
          breaks_at_waypoint.append((
              transform.break_at_waypoint,
              new_request,
              transform.virtual_shipment_label,
          ))
      else:
        new_requests.extend(rule_new_requests)

    break_requests = new_requests

  # Update the breakRule attribute of the vehicle with the new break requests.
  if break_requests:
    vehicle["breakRule"] = {"breakRequests": break_requests}
  else:
    vehicle.pop("breakRule", None)

  # Add any new virtual shipments to the model.
  if breaks_at_waypoint:
    shipments = model.get("shipments")
    if shipments is None:
      shipments = []
      model["shipments"] = shipments
    for src_waypoint, break_request, shipment_label_base in breaks_at_waypoint:
      match src_waypoint:
        case "depot":
          # TODO(ondrasej): Also support `startLocation`.
          waypoint = vehicle["startWaypoint"]
        case value if isinstance(value, dict):
          waypoint = cast(cfr_json.Waypoint, src_waypoint)
        case _:
          raise ValueError("Unexpected waypoint value {waypoint!r}")
      shipment_label = f"{shipment_label_base}, {vehicle_index=}"
      if vehicle_label := vehicle.get("label"):
        shipment_label += f", {vehicle_label=}"
      shipment: cfr_json.Shipment = {
          "deliveries": [{
              "arrivalWaypoint": waypoint,
              "duration": break_request["minDuration"],
              "timeWindows": [{
                  "startTime": break_request["earliestStartTime"],
                  "endTime": break_request["latestStartTime"],
              }],
          }],
          "label": shipment_label,
          "allowedVehicleIndices": [vehicle_index],
      }
      shipments.append(shipment)


def transform_breaks(
    model: cfr_json.ShipmentModel,
    compiled_rules: Sequence[BreakTransformRule],
) -> None:
  """Transforms breaks for all vehicles in the model using the provided rules."""
  vehicles = cfr_json.get_vehicles(model)
  for vehicle_index in range(len(vehicles)):
    transform_breaks_for_vehicle(compiled_rules, model, vehicle_index)
