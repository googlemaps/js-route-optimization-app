"""Tests for the shared two-step routing code."""

import copy
import unittest

from ..json import cfr_json
from . import _shared


class CopySharedOptionsTest(unittest.TestCase):

  def _run_copy_shared_options_test(
      self, from_request, to_request, expected_to_request
  ):
    """Runs copy_shared_options() and checks that from_request was not changed."""
    from_request_copy = copy.deepcopy(from_request)
    _shared.copy_shared_options(
        from_request=from_request, to_request=to_request
    )
    self.assertEqual(
        from_request, from_request_copy, "The source request was modified"
    )
    self.assertEqual(to_request, expected_to_request)

  def test_empty_request(self):
    self._run_copy_shared_options_test({}, {}, {})

  def test_copy_search_mode(self):
    from_request: cfr_json.OptimizeToursRequest = {
        "searchMode": 1,
        "model": {"shipments": []},
    }
    to_request: cfr_json.OptimizeToursRequest = {}
    expected_to_request: cfr_json.OptimizeToursRequest = {"searchMode": 1}
    self._run_copy_shared_options_test(
        from_request=from_request,
        to_request=to_request,
        expected_to_request=expected_to_request,
    )

  def test_copy_allow_large_deadline(self):
    from_request: cfr_json.OptimizeToursRequest = {
        "allowLargeDeadlineDespiteInterruptionRisk": True,
        "model": {"shipments": []},
    }
    to_request: cfr_json.OptimizeToursRequest = {"model": {"vehicles": []}}
    expected_to_request: cfr_json.OptimizeToursRequest = {
        "allowLargeDeadlineDespiteInterruptionRisk": True,
        "model": {"vehicles": []},
    }
    self._run_copy_shared_options_test(
        from_request=from_request,
        to_request=to_request,
        expected_to_request=expected_to_request,
    )

  def test_copy_populate_polylines(self):
    from_request: cfr_json.OptimizeToursRequest = {
        "populatePolylines": True,
        "model": {"shipments": []},
    }
    to_request: cfr_json.OptimizeToursRequest = {"model": {"vehicles": []}}
    expected_to_request: cfr_json.OptimizeToursRequest = {
        "populatePolylines": True,
        "populateTransitionPolylines": True,
        "model": {"vehicles": []},
    }
    self._run_copy_shared_options_test(
        from_request=from_request,
        to_request=to_request,
        expected_to_request=expected_to_request,
    )

  def test_copy_populate_transition_polylines(self):
    from_request: cfr_json.OptimizeToursRequest = {
        "populateTransitionPolylines": True,
        "model": {"shipments": []},
    }
    to_request: cfr_json.OptimizeToursRequest = {"model": {"vehicles": []}}
    expected_to_request: cfr_json.OptimizeToursRequest = {
        "populateTransitionPolylines": True,
        "model": {"vehicles": []},
    }
    self._run_copy_shared_options_test(
        from_request=from_request,
        to_request=to_request,
        expected_to_request=expected_to_request,
    )

  def test_copy_parent(self):
    from_request: cfr_json.OptimizeToursRequest = {
        "parent": "foobar",
        "model": {"shipments": []},
    }
    to_request: cfr_json.OptimizeToursRequest = {"model": {"vehicles": []}}
    expected_to_request: cfr_json.OptimizeToursRequest = {
        "parent": "foobar",
        "model": {"vehicles": []},
    }
    self._run_copy_shared_options_test(
        from_request=from_request,
        to_request=to_request,
        expected_to_request=expected_to_request,
    )


if __name__ == "__main__":
  unittest.main()
