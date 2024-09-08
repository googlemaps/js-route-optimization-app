"""A collection of waypoints with efficient membership testing."""

import bisect
from collections.abc import Collection
from typing import TypeAlias

from .json import cfr_json


LatLng: TypeAlias = tuple[float, float] | cfr_json.LatLng
Waypoint: TypeAlias = str | LatLng


def _as_tuple(latlng: LatLng) -> tuple[float, float]:
  if isinstance(latlng, tuple):
    return latlng
  return latlng["latitude"], latlng["longitude"]


class WaypointCollection:
  """A collection of place IDs and latlongs with efficient membership testing.

  Place IDs are matched as strings, this class makes no attempt at geocoding
  them. Latlngs can be matched either precisely or within an L_inf distance.

  Uses bisection by (latitude, longitude) for lookup of coordinates. Precise
  lookups have O(logN) time complexity; approximate lookups have time complexity
  O(logN + D) where N is the number of stored coordinates, and D is the maximal
  number of coordinates whose latitude falls into the same interval of length
  2*max_delta used in the query.
  """

  # TODO(ondrasej): Replace the lookup with an actual KD-tree in case the lookup
  # performance is not sufficient or if we encounter pathologic cases.

  def __init__(self):
    """Initializes an empty collection."""
    self._place_ids: set[str] = set()
    self._latlngs: list[tuple[float, float]] = []

  def add_place_ids(self, place_ids: Collection[str]) -> None:
    """Adds `place_ids` to the collection."""
    self._place_ids.update(place_ids)

  def add_latlngs(self, latlngs: Collection[LatLng]) -> None:
    """Adds `latlngs` to the collection.

    Runs in O(N*logN) where N is the number of latlngs in the collection after
    the insertion.

    Args:
      latlngs: The latlngs to add.
    """
    unique_latlngs = set(_as_tuple(latlng) for latlng in latlngs)
    unique_latlngs.difference_update(self._latlngs)
    self._latlngs.extend(unique_latlngs)
    self._latlngs.sort()

  def contains(self, waypoint: Waypoint, max_delta: float = 0) -> bool:
    """Checks whether the collection contains a waypoint.

    Args:
      waypoint: The place ID or latlng to look up in the collection.
      max_delta: The maximal L_inf distance in degrees for a match.

    Returns:
      True if there is a match, False otherwise.
    """
    if isinstance(waypoint, str):
      return self.contains_place_id(waypoint)
    else:
      return self.contains_latlng(waypoint, max_delta)

  def contains_place_id(self, place_id: str) -> bool:
    """Checks whether the collection contains a place ID."""
    return place_id in self._place_ids

  def contains_latlng(self, latlng: LatLng, max_delta: float = 0) -> bool:
    """Checks for coordinates within max_delta of latlng.

    Args:
      latlng: The coordinates to look up.
      max_delta: The maximal L_inf distance in degrees in which the coordinates
        are looked up.

    Returns:
      True if there is a match; False otherwise.
    """
    latlng = _as_tuple(latlng)

    left = bisect.bisect_left(
        self._latlngs, (latlng[0] - max_delta, latlng[1] - max_delta)
    )
    right = bisect.bisect_right(
        self._latlngs, (latlng[0] + max_delta, latlng[1] + max_delta)
    )
    if left == right:
      # We got an empty interval.
      return False
    longitude_min = latlng[1] - max_delta
    longitude_max = latlng[1] + max_delta
    for i in range(left, right):
      candidate = self._latlngs[i]
      if longitude_min <= candidate[1] <= longitude_max:
        return True
    return False
