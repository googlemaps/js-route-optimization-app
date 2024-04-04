# Copyright 2024 Google LLC. All Rights Reserved.
#
# Use of this source code is governed by an MIT-style license that can be found
# in the LICENSE file or at https://opensource.org/licenses/MIT.

"""Provides types used by all sub-modules of two_step_routing."""

import dataclasses
import enum

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
