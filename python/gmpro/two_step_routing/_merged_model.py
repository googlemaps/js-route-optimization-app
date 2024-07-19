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

"""Contains implementation of the local+global model merging logic."""

from collections.abc import Mapping, Sequence
import copy
import datetime
import logging

from . import _global_model
from . import _local_model
from . import _parking
from . import _shared
from ..json import cfr_json


class MergeLocalAndGlobalModel:
  """Implementation of the local and global merging algorithm."""

  _request: cfr_json.OptimizeToursRequest
  _model: cfr_json.ShipmentModel
  _options: _shared.Options
  _shipments: Sequence[cfr_json.Shipment]
  _vehicles: Sequence[cfr_json.Vehicle]

  _parking_locations: Mapping[str, _parking.ParkingLocation]

  def __init__(
      self,
      request_json: cfr_json.OptimizeToursRequest,
      parking_locations: Mapping[_parking.ParkingTag, _parking.ParkingLocation],
      options: _shared.Options,
  ):
    """Initializes the two-step planner.

    Args:
      request_json: The CFR JSON request, in the natural Python format.
      parking_locations: Parking locations indexed by their tag.
      options: Options of the two-step planner.

    Raises:
      ValueError: When an inconsistency is found in the input data. For example
        when a shipment index or parking location tag in `parking_for_shipment`
        is invalid.
    """
    self._options = options
    self._request = request_json
    self._parking_locations = parking_locations

    # NOTE(ondrasej): We trust that the presence of these fields was already
    # validated during the initialization of the planner. When they are not
    # there, the constructor will raise an exception.
    self._model = self._request["model"]
    self._shipments = self._model["shipments"]
    self._vehicles = self._model["vehicles"]

  def merge_local_and_global_result(
      self,
      local_response: cfr_json.OptimizeToursResponse,
      global_response: cfr_json.OptimizeToursResponse,
      check_consistency: bool = True,
  ) -> tuple[cfr_json.OptimizeToursRequest, cfr_json.OptimizeToursResponse]:
    """Creates a merged request and a response from the local and global models.

    See the docstring on Planner.merge_local_and_global_result() for a detailed
    description.

    Args:
      local_response: A solution of the local model created by
        self.make_local_request(). The local request itself is not needed.
      global_response: A solution of the global model created by
        self.make_global_request(local_response). The global request itself is
        not needed.
      check_consistency: Set to False to avoid consistency checks in the merged
        response.

    Returns:
      A tuple (merged_request, merged_response) that contains the merged data
      from the original request and the local and global results.
    """

    # The shipments in the merged request consist of all shipments in the
    # original request + virtual shipments to handle parking location visits. We
    # preserve the shipment indices from the original request, and add all the
    # virtual shipments at the end.
    merged_shipments: list[cfr_json.Shipment] = copy.copy(self._shipments)
    merged_model: cfr_json.ShipmentModel = {
        # The start and end time remain unchanged.
        "globalStartTime": self._model["globalStartTime"],
        "globalEndTime": self._model["globalEndTime"],
        "shipments": merged_shipments,
        # The vehicles in the merged model are the vehicles from the global
        # model and from the local model. This preserves vehicle indices from
        # the original request.
        "vehicles": self._model["vehicles"],
    }
    merged_request: cfr_json.OptimizeToursRequest = {
        "model": merged_model,
        "label": self._request.get("label", "") + "/merged",
    }
    if (parent := self._request.get("parent")) is not None:
      merged_request["parent"] = parent

    merged_routes: list[cfr_json.ShipmentRoute] = []
    merged_result: cfr_json.OptimizeToursResponse = {
        "routes": merged_routes,
    }

    transition_attributes = self._model.get("transitionAttributes")
    if transition_attributes is not None:
      merged_model["transitionAttributes"] = transition_attributes

    local_routes = cfr_json.get_routes(local_response)
    global_routes = cfr_json.get_routes(global_response)
    populate_polylines = self._request.get("populatePolylines", False)

    # We defined merged_transitions, merged_travel_steps, and
    # add_merged_transition outside of the loop to avoid a lint warning (and to
    # avoid redefining the function for each iteration of the loop).
    merged_transitions = None
    merged_travel_steps: list[cfr_json.TravelStep] | None = None

    use_deprecated_fields = self._options.use_deprecated_fields

    def add_merged_transition(
        transition: cfr_json.Transition,
        travel_step: cfr_json.TravelStep | None,
        at_parking: _parking.ParkingLocation | None = None,
        vehicle: cfr_json.Vehicle | None = None,
    ):
      assert (at_parking is None) != (vehicle is None)
      assert merged_transitions is not None
      assert use_deprecated_fields == (merged_travel_steps is not None)

      if self._options.travel_mode_in_merged_transitions:
        if at_parking is not None:
          transition["travelMode"] = at_parking.travel_mode
          transition["travelDurationMultiple"] = (
              at_parking.travel_duration_multiple
          )
        if vehicle is not None:
          transition["travelMode"] = vehicle.get("travelMode", 0)
          transition["travelDurationMultiple"] = vehicle.get(
              "travelDurationMultiple", 1
          )
      merged_transitions.append(transition)
      if merged_travel_steps is not None:
        merged_travel_steps.append(travel_step)

    for global_route_index, global_route in enumerate(global_routes):
      global_visits = cfr_json.get_visits(global_route)
      global_vehicle = self._vehicles[global_route_index]
      if not global_visits:
        # This is an unused vehicle in the global model. We can just copy the
        # route as is.
        merged_routes.append(global_route)
        continue

      global_transitions = global_route["transitions"]
      global_travel_steps = (
          global_route["travelSteps"] if use_deprecated_fields else None
      )
      merged_visits: list[cfr_json.Visit] = []
      merged_transitions: list[cfr_json.Transition] = []
      merged_route: cfr_json.ShipmentRoute = {
          "routeTotalCost": global_route["routeTotalCost"],
          "transitions": merged_transitions,
          "vehicleEndTime": global_route["vehicleEndTime"],
          "vehicleIndex": global_route.get("vehicleIndex", 0),
          "vehicleLabel": global_route["vehicleLabel"],
          "vehicleStartTime": global_route["vehicleStartTime"],
          "visits": merged_visits,
          # TODO(ondrasej): metrics, detailed costs, ...
      }
      if use_deprecated_fields:
        merged_travel_steps = []
        merged_route["travelSteps"] = merged_travel_steps

      # Copy breaks from the global route, if present.
      if (global_breaks := global_route.get("breaks")) is not None:
        merged_route["breaks"] = global_breaks

      # Copy vehicle detour from the global route, if present.
      if (
          self._options.use_deprecated_fields
          and (global_detour := global_route.get("vehicleDetour")) is not None
      ):
        merged_route["vehicleDetour"] = global_detour

      merged_routes.append(merged_route)

      def add_parking_location_shipment(
          parking: _parking.ParkingLocation, arrival: bool
      ):
        arrival_or_departure = "arrival" if arrival else "departure"
        shipment_index = len(merged_shipments)
        shipment: cfr_json.Shipment = {
            "label": f"{parking.tag} {arrival_or_departure}",
            "deliveries": [{
                "arrivalWaypoint": parking.waypoint_for_local_model,
                "duration": "0s",
            }],
            # TODO(ondrasej): Vehicle costs and allowed vehicle indices.
        }
        merged_shipments.append(shipment)
        return shipment_index, shipment

      for global_visit_index, global_visit in enumerate(global_visits):
        # The transition from the previous global visit to the current one is
        # always by vehicle.
        add_merged_transition(
            copy.deepcopy(global_transitions[global_visit_index]),
            copy.deepcopy(global_travel_steps[global_visit_index])
            if use_deprecated_fields
            else None,
            vehicle=global_vehicle,
        )
        global_visit_label = global_visit["shipmentLabel"]
        global_visit_detour = cfr_json.get_visit_detour(global_visit)
        visit_type, index = _global_model.parse_shipment_label(
            global_visit_label
        )
        match visit_type:
          case "s":
            # This is direct delivery of one of the shipments in the original
            # request. We just copy it and update the shipment index and label
            # accordingly.
            merged_visit = copy.deepcopy(global_visit)
            merged_visit["shipmentIndex"] = index
            merged_visit["shipmentLabel"] = self._shipments[index]["label"]
            merged_visits.append(merged_visit)
          case "p":
            # This is delivery through a parking location. We need to copy parts
            # of the route from the local model solution, and add virtual
            # shipments for entering and leaving the parking location.
            local_route = local_routes[index]
            parking_tag = _local_model.get_parking_tag_from_route(local_route)
            parking = self._parking_locations[parking_tag]
            arrival_shipment_index, arrival_shipment = (
                add_parking_location_shipment(parking, arrival=True)
            )
            global_start_time = cfr_json.parse_time_string(
                global_visit["startTime"]
            )
            local_start_time = cfr_json.parse_time_string(
                local_route["vehicleStartTime"]
            )
            local_end_time = cfr_json.parse_time_string(
                local_route["vehicleEndTime"]
            )
            local_to_global_delta = global_start_time - local_start_time
            merged_visits.append({
                "shipmentIndex": arrival_shipment_index,
                "shipmentLabel": arrival_shipment["label"],
                "startTime": global_visit["startTime"],
                # NOTE(ondrasej): The detour of the parking arrival visit is the
                # difference from a plan where the vehicle drives directly to
                # this parking location.
                "detour": cfr_json.as_duration_string(global_visit_detour),
            })

            # Transfer all visits and transitions from the local route. Update
            # the timestamps as needed.
            local_visits = cfr_json.get_visits(local_route)
            local_transitions = local_route["transitions"]
            local_travel_steps = (
                local_route["travelSteps"] if use_deprecated_fields else None
            )
            previous_visit_was_to_parking = True
            unload_duration = datetime.timedelta()
            load_duration = datetime.timedelta()
            for local_visit_index, local_visit in enumerate(local_visits):
              shipment_index = _local_model.get_shipment_index_from_visit(
                  local_visit
              )
              shipment = self._shipments[shipment_index]
              current_visit_is_to_parking = _local_model.visit_is_to_parking(
                  local_visit, shipment=shipment
              )

              local_transition_in = local_transitions[local_visit_index]

              if (
                  previous_visit_was_to_parking
                  and not current_visit_is_to_parking
              ):
                # The current visit is the first visit on the local route that
                # is not at the parking location. We can compute the unload
                # duration as the duration between the start of the transition
                # to this visit and the start of the local route.
                unload_duration = (
                    cfr_json.parse_time_string(local_transition_in["startTime"])
                    - local_start_time
                )
              if (
                  not previous_visit_was_to_parking
                  and current_visit_is_to_parking
              ):
                # The current visit is the first visit back at the parking
                # location. We can compute the load duration as the duration
                # between the start of the local visit and the end of the local
                # route.
                load_duration = local_end_time - cfr_json.parse_time_string(
                    local_visit["startTime"]
                )

              if (
                  not previous_visit_was_to_parking
                  or not current_visit_is_to_parking
              ):
                # We drop the local pickups in the merged model, keeping only
                # the visits to customer locations. We need to preserve
                # transitions between these visits, but also between parking and
                # the first/last visit to the customer location.
                merged_transition = copy.deepcopy(local_transition_in)
                merged_transition["startTime"] = cfr_json.update_time_string(
                    merged_transition["startTime"], local_to_global_delta
                )
                merged_travel_step = None
                if use_deprecated_fields:
                  merged_travel_step = copy.deepcopy(
                      local_travel_steps[local_visit_index]
                  )
                add_merged_transition(
                    merged_transition, merged_travel_step, at_parking=parking
                )

              previous_visit_was_to_parking = current_visit_is_to_parking
              if current_visit_is_to_parking:
                # This is a pickup or a delivery at the parking location. We do
                # not carry it over, because the shipments in the original
                # request are either pickup-only or delivery-only.
                continue

              local_visit_detour = cfr_json.get_visit_detour(local_visit)
              merged_visit: cfr_json.Visit = {
                  "shipmentIndex": shipment_index,
                  "startTime": cfr_json.update_time_string(
                      local_visit["startTime"], local_to_global_delta
                  ),
                  # NOTE(ondrasej): The computation of the detour works with the
                  # assumption that all visits on the local route are for
                  # delivery-only shipments. The sum of the local and global
                  # detours is equivalent to the detour from a route where the
                  # vehicle drivers straight to the current parking location and
                  # where the driver then goes directly to this visit.
                  "detour": cfr_json.as_duration_string(
                      global_visit_detour + local_visit_detour
                  ),
              }
              if (shipment_label := shipment.get("label")) is not None:
                merged_visit["shipmentLabel"] = shipment_label
              if (is_pickup := local_visit.get("isPickup")) is not None:
                merged_visit["isPickup"] = is_pickup
              if (
                  visit_request_index := local_visit.get("visitRequestIndex")
              ) is not None:
                merged_visit["visitRequestIndex"] = visit_request_index
              merged_visits.append(merged_visit)

            # Add a transition back to the parking location if needed, i.e. only
            # if it was not already added with the last visit to a customer
            # location.
            if not previous_visit_was_to_parking:
              transition_to_parking = copy.deepcopy(local_transitions[-1])
              transition_to_parking["startTime"] = cfr_json.update_time_string(
                  transition_to_parking["startTime"], local_to_global_delta
              )
              travel_step_to_parking = None
              if use_deprecated_fields:
                travel_step_to_parking = copy.deepcopy(local_travel_steps[-1])
              add_merged_transition(
                  transition_to_parking,
                  travel_step_to_parking,
                  at_parking=parking,
              )

            # Add a virtual shipment and a visit for the departure from the
            # parking location.
            departure_shipment_index, departure_shipment = (
                add_parking_location_shipment(parking, arrival=False)
            )

            arrival_shipment["deliveries"][0]["duration"] = (
                cfr_json.as_duration_string(unload_duration)
            )
            departure_shipment["deliveries"][0]["duration"] = (
                cfr_json.as_duration_string(load_duration)
            )

            local_route_duration = cfr_json.parse_duration_string(
                local_route["metrics"]["totalDuration"]
            )
            merged_visits.append({
                "shipmentIndex": departure_shipment_index,
                "shipmentLabel": departure_shipment["label"],
                "startTime": cfr_json.update_time_string(
                    local_route["vehicleEndTime"],
                    local_to_global_delta - load_duration,
                ),
                # NOTE(ondrasej): The detour of the parking departure visit is
                # the time spent in the parking (the delta between the arrival
                # to the parking and the departure from the parking).
                "detour": cfr_json.as_duration_string(local_route_duration),
            })
          case _:
            raise ValueError(f"Unexpected visit type: '{visit_type}'")

      # Add the transition back to the depot.
      add_merged_transition(
          copy.deepcopy(global_transitions[-1]),
          copy.deepcopy(global_travel_steps[-1])
          if use_deprecated_fields
          else None,
          vehicle=global_vehicle,
      )
      if populate_polylines:
        route_polyline = cfr_json.merge_polylines_from_transitions(
            merged_transitions
        )
        if route_polyline is not None:
          merged_routes[-1]["routePolyline"] = route_polyline

      # Update route metrics to include data from both local and global travel.
      try:
        cfr_json.recompute_route_metrics(
            merged_model, merged_routes[-1], check_consistency=check_consistency
        )
      except ValueError:
        logging.exception(
            "Recomputing route metrics failed:"
            "\nglobal_route_index=%d"
            "\nglobal_route=%r"
            "\nmerged_route=%r",
            global_route_index,
            global_route,
            merged_route,
        )
        raise

    merged_skipped_shipments = []
    for local_skipped_shipment in local_response.get("skippedShipments", ()):
      shipment_index, label = local_skipped_shipment["label"].split(
          ": ", maxsplit=1
      )
      merged_skipped_shipments.append({
          "index": int(shipment_index),
          "label": label,
      })
    for global_skipped_shipment in global_response.get("skippedShipments", ()):
      shipment_type, index = _global_model.parse_shipment_label(
          global_skipped_shipment["label"]
      )
      match shipment_type:
        case "s":
          # Shipments delivered directly can be added directly to the list.
          merged_skipped_shipments.append({
              "index": int(index),
              "label": self._shipments[index].get("label", ""),
          })
        case "p":
          # For parking locations, we need to add all shipments delivered from
          # that parking location.
          local_route = local_routes[index]
          seen_shipments = set()
          for visit in cfr_json.get_visits(local_route):
            shipment_index, label = visit["shipmentLabel"].split(
                ": ", maxsplit=1
            )
            if shipment_index in seen_shipments:
              # We have a pickup & delivery visit for each shipment, but we only
              # need to add it once.
              continue
            seen_shipments.add(shipment_index)
            merged_skipped_shipments.append({
                "index": int(shipment_index),
                "label": label,
            })

    if merged_skipped_shipments:
      merged_result["skippedShipments"] = merged_skipped_shipments

    # Add options from the original request, to make tracking of different
    # versions of the problem easier.
    _shared.copy_shared_options(
        from_request=self._request, to_request=merged_request
    )
    internal_parameters = self._request.get("internalParameters")
    if internal_parameters is not None:
      merged_request["internalParameters"] = internal_parameters

    return merged_request, merged_result
