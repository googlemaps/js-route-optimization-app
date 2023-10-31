"""Provides functions for formatting CFR JSON objects to human-readable form."""

from . import cfr_json


def lat_lng(latlng: cfr_json.LatLng) -> str:
  """Returns a human-readable lat/lng."""
  latitude = latlng.get("latitude", "")
  longitude = latlng.get("longitude", "")
  if not latitude and not longitude:
    return ""
  return f"{latitude}, {longitude}"


def transition_duration(transition: cfr_json.Transition) -> str:
  """Returns human-readable travel duration info for a transition."""
  # NOTE(ondrasej): Breaks have their own rows, so we do not need to include
  # them in the transition durations.
  travel_duration = transition.get("travelDuration", "0s")
  delay_duration = transition.get("delayDuration", "0s")
  wait_duration = transition.get("waitDuration", "0s")
  parts = []
  if travel_duration != "0s":
    parts.append(f"travel: {travel_duration}")
  if delay_duration != "0s":
    parts.append(f"delay: {delay_duration}")
  if wait_duration != "0s":
    parts.append(f"wait: {wait_duration}")
  if not parts:
    return "0s"
  return ", ".join(parts)


def vehicle_end_location(vehicle: cfr_json.Vehicle) -> str:
  """Returns vehicle end coordinates in a human-readable string form."""
  end_location = vehicle.get("endLocation")
  end_waypoint = vehicle.get("endWaypoint")
  if end_location is not None and end_waypoint is not None:
    raise ValueError("Only one of endLocation and endWaypoint may be provided.")
  if end_location is not None:
    return lat_lng(end_location)
  if end_waypoint is not None:
    return waypoint_latlng(end_waypoint)
  return ""


def vehicle_start_location(vehicle: cfr_json.Vehicle) -> str:
  """Returns vehicle start coordinates in a human-readable string form."""
  start_location = vehicle.get("startLocation")
  start_waypoint = vehicle.get("startWaypoint")
  if start_location is not None and start_waypoint is not None:
    raise ValueError(
        "Only one of startLocation and startWaypoint may be provided."
    )
  if start_location is not None:
    return lat_lng(start_location)
  if start_waypoint is not None:
    return waypoint_latlng(start_waypoint)
  return ""


def visit_request_location(visit_request: cfr_json.VisitRequest) -> str:
  """Returns the location from a visit request in a human-readable form.

  When only an arrival or only a departure are provided, only one location is
  returned. When both are provided, the result has a form "arrival ->
  departure". When neither is provided, returns an empty string.

  Args:
    visit_request: The visit request for which the location is formatted.

  Returns:
    A human-readable representation of the visit request location.

  Raises:
    ValueError: When arrivalLocation and arrivalWaypoint are both provided, or
      when departureLocation and departureWaypoint are both provided.
  """
  parts = []
  arrival_location = visit_request.get("arrivalLocation")
  arrival_waypoint = visit_request.get("arrivalWaypoint")
  if arrival_location and arrival_waypoint:
    raise ValueError(
        "Only one of arrivalLocation and arrivalWaypoint may be provided."
    )
  if arrival_location is not None:
    parts.append(lat_lng(arrival_location))
  if arrival_waypoint is not None:
    parts.append(waypoint_latlng(arrival_waypoint))

  departure_location = visit_request.get("departureLocation")
  departure_waypoint = visit_request.get("departureWaypoint")
  if departure_location and departure_waypoint:
    raise ValueError(
        "Only one of departureLocation and departureWaypoint may be provided."
    )
  if departure_location is not None:
    parts.append(lat_lng(departure_location))
  if departure_waypoint is not None:
    parts.append(waypoint_latlng(departure_waypoint))

  return " -> ".join(parts)


def waypoint_latlng(wp: cfr_json.Waypoint) -> str:
  """Returns the coordinates of a waypoint in a human-readable form."""
  # TODO(ondrasej): Consider adding "sideOfRoad" and "placeId".
  location = wp.get("location")
  if location is None:
    return ""
  latlng = location.get("latLng")
  if latlng is None:
    return ""
  return lat_lng(latlng)
