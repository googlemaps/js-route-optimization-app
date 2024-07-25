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

"""Provides types used by all sub-modules of two_step_routing."""

import dataclasses
import enum

from ..json import cfr_json
from . import _parking


@enum.unique
class IntegrationMode(enum.Enum):
  """Specifies how integration of the local refinement response is done.

  Values:
    VISITS_ONLY: The injected first solution routes contain only shipment and
      visit request indices and break start times.
    VISITS_AND_START_TIMES: The injected first solution routes contain shipment
      and visit request indices as well as visit start times from the initial
      solution.
    FULL_ROUTES: The injected first solution routes are fully integrated,
      including transitions and aggregated metrics. The routes can be used in a
      call to `Planner.merge_local_and_global_result()`.
  """

  VISITS_ONLY = 0
  VISITS_AND_START_TIMES = 1
  FULL_ROUTES = 2


@dataclasses.dataclass
class Options:
  """Options for the two-step planner.

  When determining the `internalParameters` attribute of the request in each
  phase, the library uses the last value of the chain that is provided and not
  None. When no value is provided/all are None, `internalParameters` is not used
  in this phase:
  - initial local request:
    1. Options.local_internal_parameters.
  - initial global request:
    1. `internalParameters` from the input request,
    2. Options.global_internal_parameters.
  - local_refinement_request:
    1. Options.local_internal_parameters,
    2. Options.local_refinement_internal_parameters.
  - global_refinement_requet:
    1. `internalParameters` from the input request,
    2. Options.global_internal_parameters,
    3. Options.global_refinement_internal_parameters.
  Also note that `two_step_routing_main.py` adds one additional override for the
  last global (refinement) request that is sent to the server. This override
  can't be done from the library because it doesn't know the final number of
  refinement phases.

  Attributes:
    local_model_grouping: The grouping strategy used in the local model.
    initial_local_model_grouping: The grouping strategy used in the initial
      local model.
    local_model_vehicle_fixed_cost: The fixed cost of the vehicles in the local
      model. This should be a high number to make the solver use as few vehicles
      as possible.
    local_model_vehicle_per_hour_cost: The per-hour cost of the vehicles in the
      local model. This should be a small positive number so that the solver
      prefers faster routes.
    local_model_vehicle_per_km_cost: The per-kilometer cost of the vehicles in
      the local model. This should be a small positive number so that the solver
      prefers shorter routes.
    min_average_shipments_per_round: The minimal (average) number of shipments
      that is delivered from a parking location without returning to the parking
      location. This is used to estimate the number of vehicles in the plan.
    use_deprecated_fields: When True, the planner fills out fields in the
      responses that are marked as deprecated in the CFR documentation. We
      recommend setting this to False to avoid using those fields as they will
      be eventually removed.
    travel_mode_in_merged_transitions: When True, transition objects in the
      merged response contain also the travel mode and travel duration multiple
      used while computing route for the transition. These fields are extensions
      to the CFR API, and converting a JSON response with these fields to the
      CFR proto may fail.
    local_internal_parameters: An override of the `internalParameters` attribute
      for local requests. When None, this override is not used.
    global_internal_parameters: An override of the `internalParameters`
      attribute for global requests. When None, this override is not used.
    local_refinement_internal_parameters: An override of the
      `internalParameters` attribute for local refinement requests. When None,
      the override is not used.
    global_refinement_internal_parameters: An override of the
      `internalParameters` attribute for global refinement requests. When None,
      the override is not used.
  """

  initial_local_model_grouping: _parking.InitialLocalModelGrouping

  # TODO(ondrasej): Do we actually need these? Perhaps they can be filled in on
  # the user side.
  local_model_vehicle_fixed_cost: float = 10_000
  local_model_vehicle_per_hour_cost: float = 300
  local_model_vehicle_per_km_cost: float = 60

  min_average_shipments_per_round: int = 1

  use_deprecated_fields: bool = True
  travel_mode_in_merged_transitions: bool = False

  local_internal_parameters: str | None = None
  global_internal_parameters: str | None = None
  local_refinement_internal_parameters: str | None = None
  global_refinement_internal_parameters: str | None = None


def override_internal_parameters(
    request: cfr_json.OptimizeToursRequest, *overrides: str | None
) -> None:
  """Overrides `internalParameters` in `request` with values.

  Sets `internalParameters` to the last non-None value from `values`. When
  `values` is empty or contains only None, the `internalParameters` attribute of
  the request is left intact.

  Args:
    request: The request, in which the internal parameters are overridden.
    *overrides: The override values, considered from first to last.
  """
  internal_parameters = request.get("internalParameters")
  for value in overrides:
    if value is not None:
      internal_parameters = value
  if internal_parameters is not None:
    request["internalParameters"] = internal_parameters


def copy_shared_options(
    from_request: cfr_json.OptimizeToursRequest,
    to_request: cfr_json.OptimizeToursRequest,
) -> None:
  """Copies shared request parameters from one request to another."""
  # Copy solve mode.
  # TODO(ondrasej): Consider always setting searchMode to
  # CONSUME_ALL_AVAILABLE_TIME for the local model. The timeout for the local
  # model is usually very short, and the difference between the two might not
  # be that large.
  if (search_mode := from_request.get("searchMode")) is not None:
    to_request["searchMode"] = search_mode

  allow_large_deadlines = from_request.get(
      "allowLargeDeadlineDespiteInterruptionRisk"
  )
  if allow_large_deadlines is not None:
    to_request["allowLargeDeadlineDespiteInterruptionRisk"] = (
        allow_large_deadlines
    )

  # Copy polyline settings.
  if (populate_polylines := from_request.get("populatePolylines")) is not None:
    to_request["populatePolylines"] = populate_polylines
  populate_transition_polylines = (
      from_request.get("populateTransitionPolylines") or populate_polylines
  )
  if populate_transition_polylines is not None:
    to_request["populateTransitionPolylines"] = populate_transition_polylines

  # Copy additional metadata.
  if (parent := from_request.get("parent")) is not None:
    to_request["parent"] = parent
