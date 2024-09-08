"""Tests for the waypoint collection."""

from collections.abc import Sequence
import datetime
import itertools
import logging
import random
import unittest

from . import waypoint_collection
from .json import cfr_json


class WaypointCollectionTest(unittest.TestCase):

  # _JSON_LATLNGS_A and _TUPLE_LATLNGS_A contain the same coordinates in
  # different representations (tuples and JSON latlng structures).
  _JSON_LATLNGS_A: Sequence[cfr_json.LatLng] = (
      {"latitude": 0, "longitude": 0},
      {"latitude": 48.877104524088146, "longitude": 2.329973366337609},
      {"latitude": 48.879156912623536, "longitude": 2.3270195883955864},
  )
  _TUPLE_LATLNGS_A: Sequence[tuple[float, float]] = (
      (0, 0),
      (48.877104524088146, 2.329973366337609),
      (48.879156912623536, 2.3270195883955864),
  )
  # _JSON_LATLNGS_B and _TUPLE_LATLNGS_B use the same setup as the _A version,
  # but they are different coordinates with no overlap between _A and _B.
  _JSON_LATLNGS_B: Sequence[cfr_json.LatLng] = (
      {"latitude": 37.42461654144618, "longitude": -122.09252441795736},
      {"latitude": 37.422335039773735, "longitude": -122.0838965937761},
      {"latitude": 37.42168743305142, "longitude": -122.0790336749436},
  )
  _TUPLE_LATLNGS_B: Sequence[tuple[float, float]] = (
      (37.42461654144618, -122.09252441795736),
      (37.422335039773735, -122.0838965937761),
      (37.42168743305142, -122.0790336749436),
  )

  def test_empty_collection(self):
    collection = waypoint_collection.WaypointCollection()
    waypoints = (
        "foo",
        "bar",
        "baz",
        *self._JSON_LATLNGS_A,
        *self._TUPLE_LATLNGS_A,
    )
    for waypoint in waypoints:
      with self.subTest(waypoint=waypoint):
        self.assertFalse(collection.contains(waypoint))
        self.assertFalse(collection.contains(waypoint, max_delta=0.001))
        self.assertFalse(collection.contains(waypoint, max_delta=0.1))

  def test_place_ids(self):
    place_ids = ("foo", "bar")
    collection = waypoint_collection.WaypointCollection()
    collection.add_place_ids(place_ids)

    for place_id in place_ids:
      self.assertTrue(collection.contains(place_id))

    self.assertFalse(collection.contains("baz"))

    latlngs = (*self._TUPLE_LATLNGS_B, *self._JSON_LATLNGS_A)
    for latlng in latlngs:
      self.assertFalse(collection.contains(latlng))

  def test_latlng_exact_match(self):
    collection = waypoint_collection.WaypointCollection()
    collection.add_latlngs(self._JSON_LATLNGS_A)

    for latlng in itertools.chain(self._JSON_LATLNGS_A, self._TUPLE_LATLNGS_A):
      with self.subTest(latlng=latlng):
        self.assertTrue(collection.contains(latlng))

    for latlng in itertools.chain(self._JSON_LATLNGS_B, self._TUPLE_LATLNGS_B):
      with self.subTest(latlng=latlng):
        self.assertFalse(collection.contains(latlng))

  def test_latlng_approximate_match(self):
    collection = waypoint_collection.WaypointCollection()
    latlng = self._TUPLE_LATLNGS_A[0]
    collection.add_latlngs((latlng,))

    max_delta = 0.0001
    num_tests = 1000
    rnd = random.Random(b"123456789")
    for _ in range(num_tests):
      perturbed_latlng = (
          latlng[0] + rnd.uniform(-max_delta, max_delta),
          latlng[1] + rnd.uniform(-max_delta, max_delta),
      )
      self.assertTrue(collection.contains(perturbed_latlng, max_delta))

    deltas = (
        (max_delta + 1e-6, 0),
        (0, max_delta + 1e-6),
        (-max_delta - 1e-6, 0),
        (0, -max_delta - 1e-6),
    )
    for delta_lat, delta_lng in deltas:
      perturbed_latlng = latlng[0] + delta_lat, latlng[1] + delta_lng
      self.assertFalse(collection.contains(perturbed_latlng, max_delta))

  def test_exact_latlng_lookup_large_set(self):
    # The number of coordinates added to the collection.
    num_collection_elements = 1000000
    # The number of lookups performed in the lookup tests. The test makes
    # `num_test_lookups` of lookups for points that are in the collection and
    # the same number of lookups for points that are not in the collection.
    num_test_lookups = 1000

    collection = waypoint_collection.WaypointCollection()

    rnd = random.Random(b"123456789")
    member_latlngs = set()
    while len(member_latlngs) < num_collection_elements:
      latlng = rnd.uniform(-80, 80), rnd.uniform(-180, 180)
      member_latlngs.add(latlng)

    collection.add_latlngs(member_latlngs)

    non_member_latlngs = set()
    while len(non_member_latlngs) < num_test_lookups:
      latlng = rnd.uniform(-80, 80), rnd.uniform(-180, 180)
      if latlng not in member_latlngs:
        non_member_latlngs.add(latlng)

    member_start = datetime.datetime.now()
    for latlng in itertools.islice(member_latlngs, num_test_lookups):
      self.assertTrue(collection.contains(latlng))
    non_member_start = datetime.datetime.now()
    for latlng in non_member_latlngs:
      self.assertFalse(collection.contains(latlng))
    non_member_end = datetime.datetime.now()

    logging.info(
        "member lookup = %fs",
        (non_member_start - member_start).total_seconds(),
    )
    logging.info(
        "non-member lookup = %fs",
        (non_member_end - non_member_start).total_seconds(),
    )

  def test_approximate_lookup_large_set(self):
    # The number of coordinates added to the collection.
    num_collection_elements = 1000000
    # The number of lookups performed in the lookup tests. The test makes
    # `num_test_lookups` of lookups for points that are in the collection and
    # the same number of lookups for points that are not in the collection.
    num_test_lookups = 1000

    max_delta = 0.0001

    collection = waypoint_collection.WaypointCollection()

    # Member and non-member coordinates are generated in different octants, so
    # that a query for a non-member never returns True.
    rnd = random.Random(b"123456789")
    member_latlngs = set()
    while len(member_latlngs) < num_collection_elements:
      latlng = rnd.uniform(0, 80), rnd.uniform(1, 90)
      member_latlngs.add(latlng)

    collection.add_latlngs(member_latlngs)

    non_member_latlngs = set()
    while len(non_member_latlngs) < num_test_lookups:
      latlng = rnd.uniform(0, 80), rnd.uniform(-90, -1)
      if latlng not in member_latlngs:
        non_member_latlngs.add(latlng)

    member_start = datetime.datetime.now()
    for latlng in itertools.islice(member_latlngs, num_test_lookups):
      # Create a version of the element that is randomly perturbed but that is
      # still within the tolerance specified by max_delta.
      perturbed_latlng = (
          latlng[0] + rnd.uniform(-max_delta, max_delta),
          latlng[1] + rnd.uniform(-max_delta, max_delta),
      )
      self.assertTrue(collection.contains(perturbed_latlng, max_delta))
    non_member_start = datetime.datetime.now()
    for latlng in non_member_latlngs:
      self.assertFalse(collection.contains(latlng), max_delta)
    non_member_end = datetime.datetime.now()

    logging.info(
        "member lookup: %fs",
        (non_member_start - member_start).total_seconds(),
    )
    logging.info(
        "non-member lookup: %fs",
        (non_member_end - non_member_start).total_seconds(),
    )


if __name__ == "__main__":
  logging.basicConfig(
      format="%(asctime)s %(levelname)-8s %(filename)s:%(lineno)d %(message)s",
      level=logging.INFO,
      datefmt="%Y-%m-%d %H:%M:%S",
  )
  unittest.main()
