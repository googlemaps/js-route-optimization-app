"""Tests for the shared two-step routing code."""

import copy
import unittest

from ..json import cfr_json
from . import _shared


class OverrideInternalParametersTest(unittest.TestCase):
  """Tests for override_internal_parameters."""

  def test_no_initial_and_no_overrides(self):
    request: cfr_json.OptimizeToursRequest = {}
    _shared.override_internal_parameters(request)
    self.assertEqual(request, {})
    _shared.override_internal_parameters(request, None)
    self.assertEqual(request, {})
    _shared.override_internal_parameters(request, None, None, None)
    self.assertEqual(request, {})

  def test_no_initial_and_some_overrides(self):
    test_cases = (
        (("foo",), "foo"),
        (("foo", None, "bar"), "bar"),
        (("foo", None, "bar", None), "bar"),
    )
    for overrides, expected_value in test_cases:
      with self.subTest(overrides=overrides):
        request: cfr_json.OptimizeToursRequest = {}
        _shared.override_internal_parameters(request, *overrides)
        self.assertEqual(request, {"internalParameters": expected_value})

  def test_some_initial_and_no_overrides(self):
    request: cfr_json.OptimizeToursRequest = {"internalParameters": "foo"}
    _shared.override_internal_parameters(request)
    self.assertEqual(request, {"internalParameters": "foo"})
    _shared.override_internal_parameters(request, None, None, None)
    self.assertEqual(request, {"internalParameters": "foo"})

  def test_some_initial_and_some_overrides(self):
    test_cases = (
        (("bar",), "bar"),
        (("bar", None, "baz"), "baz"),
        (("bar", None, "baz", None), "baz"),
    )
    for overrides, expected_value in test_cases:
      with self.subTest(overrides=overrides):
        request: cfr_json.OptimizeToursRequest = {"internalParameters": "foo"}
        _shared.override_internal_parameters(request, *overrides)
        self.assertEqual(request, {"internalParameters": expected_value})


class CopySharedOptionsTest(unittest.TestCase):
  """Tests for copy_shared_options."""

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
