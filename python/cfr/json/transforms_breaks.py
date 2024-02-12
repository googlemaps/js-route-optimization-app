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
- Selector names start with `@`.

Examples:
- "minDuration=7200s": sets the duration of all break requests to 7200s.
- "@time=16:00:00 delete": deletes all breaks that can start at 16:00:00.
- "new earliestStartTime=17:00:00 latestStartTime=18:00:00 minDuration=60s":
  adds a new break request that starts at 17:00, ends at 18:00, and has a
  minimal duration of 60s. The actual break request will use the dates from
  the global start/end time.

Supported selectors:
- "@time={time}": selects break rules that can start at the given _time_ (not
  datetime), i.e. {time} is a time that is between `earliestStartTime` and
  `latestStartTime` on any date. When there are less than 24 hours between the
  earliest and the latest start times, this works as expected; otherwise, it
  always selects.

Supported actions:
- "delete": deletes the break rule.
- "new": Instead of editing the existing break rule, creates a new one and edits
  only that one. When a selector is used with new, the new break request is
  added only to vehicles that have a break request matching the selector.
- "depot": Transforms the break into a virtual shipment that makes the vehicle
  return to the depot for the break. The parameters of the shipment are set up
  so that the start time window and the duration correspond to the break request
  at the moment this action was executed. Once this action is used, no other
  actions apply to the affected break rule.
- "earliestStartTime={time}", "latestStartTime={time}": Changes the earliest or
  the latest start time of the break request. Similar to `@time`, the action
  takes only _time_ (not datetime) and infers the date from the existing value
  or from the global start/end date.
- "minDuration={duration}": Changes the minimal duration of the break to
  {minDuration}.

The mini-language is intended to be used through the command-line flags of the
request transformation script `transform_request.py`.
"""

from collections.abc import Sequence
import copy
import dataclasses
import datetime
import functools
import re
from typing import Any, Protocol, cast

from . import cfr_json


class BreakSelector(Protocol):
  """Function signature of a break selector."""

  def __call__(self, break_request: cfr_json.BreakRequest) -> bool:
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
      selectors return True.
    actions: The list of actions applied to the break request by this
      transformation.
    new_break_request: When True, this transformation creates a new break
      request rather than modify an existing one.
    return_to_depot: When True, this transformation turns the break request into
      a virtual shipment that has the same waypoint as the vehicle start, a time
      window corresponding to (earliestStartTime, latestStartTime) of the break
      request, and duration equal to the minDuration of the break. The break
      request itself is removed.
  """

  selectors: Sequence[BreakSelector]
  actions: Sequence[BreakTransformAction]
  new_break_request: bool
  return_to_depot: bool

  def applies_to(self, break_request: cfr_json.BreakRequest) -> bool:
    """Checks that the break transform rule applies to the given break request.

    Returns True when either:
    - self.selectors is non-empty, and all selectors return True.
    - self.selectors is empty, and this rule doesn't add a new break request.

    Args:
      break_request: The break request to check.

    Returns:
      True when this break rule applies to the given break request. Otherwise,
      False.
    """
    if not self.selectors:
      return not self.new_break_request
    return all(selector(break_request) for selector in self.selectors)

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


_COMPONENT = re.compile(
    r"^(?P<name>@?[a-zA-Z0-9_]+)((?P<operator>=)(?P<value>.*))?$"
)


def _break_start_time_window_contains_time(
    time: datetime.time, break_request: cfr_json.BreakRequest
) -> bool:
  """Selector that checks that `break_request` can start at a given time.

  This function works only on the time part of the time window, not the date.
  Correctly handles break requests where the time window crosses the day end
  boundary.

  Args:
    time: The given time to test.
    break_request: The break request to test.

  Returns:
    True when `time` is between `earliestStartTime` and `latestStartTime` on any
    day. Otherwise, returns False.
  """
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
  for rule in rules.split(";"):
    selectors = []
    actions = []
    new_break_request = False
    return_to_depot = False
    for component in rule.split():
      split = _COMPONENT.fullmatch(component)
      if not split:
        raise ValueError(f"Could not parse component: {component!r}")
      name = split["name"]
      operator = split["operator"]
      value = split["value"]
      match name:
        case "@time":
          if operator != "=":
            raise ValueError(
                f"Only '=' is allowed for @time, found {component!r}"
            )
          selectors.append(
              functools.partial(
                  _break_start_time_window_contains_time, _parse_time(value)
              )
          )
        case "new":
          new_break_request = True
        case "delete":
          actions.append(_delete_break_request)
        case "depot":
          return_to_depot = True
        case "earliestStartTime" | "latestStartTime":
          match operator:
            case "=":
              actions.append(
                  functools.partial(
                      _set_break_start_time_window_component_time,
                      name,
                      _parse_time(value),
                  )
              )
            case _:
              raise ValueError(
                  f"Only '=' is allowed for `{name}`, found {component!r}"
              )
        case "minDuration":
          match operator:
            case "=":
              actions.append(
                  functools.partial(
                      _set_break_min_duration,
                      cfr_json.parse_duration_string(value),
                  )
              )
            case _:
              raise ValueError(
                  f"Only '=' is allowed for `{name}`, found {component!r}"
              )
        case _:
          raise ValueError(f"Unexpected name {name!r} in {component!r}")
    if actions or selectors or return_to_depot or new_break_request:
      compiled_rules.append(
          BreakTransformRule(
              selectors=selectors,
              actions=actions,
              new_break_request=new_break_request,
              return_to_depot=return_to_depot,
          )
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
  returns_to_depot = []

  for transform in compiled_rules:
    matched_anything = False
    new_requests: list[cfr_json.BreakRequest] = []
    for request in break_requests:
      if not transform.applies_to(request):
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
      if transform.return_to_depot:
        returns_to_depot.extend(rule_new_requests)
      else:
        new_requests.extend(rule_new_requests)

    if (
        not matched_anything
        and not transform.selectors
        and transform.new_break_request
    ):
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
      if transform.return_to_depot:
        returns_to_depot.extend(rule_new_requests)
      else:
        new_requests.extend(rule_new_requests)

    break_requests = new_requests

  # Update the breakRule attribute of the vehicle with the new break requests.
  if break_requests:
    vehicle["breakRule"] = {"breakRequests": break_requests}
  else:
    vehicle.pop("breakRule", None)

  # Add any new virtual shipments to the model.
  if returns_to_depot:
    shipments = model.get("shipments")
    if shipments is None:
      shipments = []
      model["shipments"] = shipments
    for break_request in returns_to_depot:
      shipment_label = f"break, {vehicle_index=}"
      if vehicle_label := vehicle.get("label"):
        shipment_label += f", {vehicle_label=}"
      shipment: cfr_json.Shipment = {
          "deliveries": [{
              "arrivalWaypoint": vehicle["startWaypoint"],
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
