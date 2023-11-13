import unittest

from . import analysis
from ..json import cfr_json


class VehicleShipmentGroupsTest(unittest.TestCase):

  def test_without_allowed_vehicle_indices(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S001"},
            {"label": "S002"},
            {"label": "S003"},
            {"label": "S004"},
            {"label": "S005"},
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
        ],
    }
    self.assertSequenceEqual(
        analysis.get_vehicle_shipment_groups(model),
        (({0, 1}, {0, 1, 2, 3, 4}),),
    )

  def test_with_some_allowed_vehicle_indices(self):
    model: cfr_json.ShipmentModel = {
        "shipments": [
            {"label": "S001", "allowedVehicleIndices": [0, 2]},
            {"label": "S002", "allowedVehicleIndices": [0, 2]},
            {"label": "S003", "allowedVehicleIndices": [1]},
            {"label": "S004", "allowedVehicleIndices": [1, 2, 3]},
            {"label": "S005"},
        ],
        "vehicles": [
            {"label": "V001"},
            {"label": "V002"},
            {"label": "V003"},
            {"label": "V004"},
        ],
    }
    self.assertCountEqual(
        analysis.get_vehicle_shipment_groups(model),
        (({0, 2}, {0, 1}), ({1}, {2}), ({1, 2, 3}, {3}), ({0, 1, 2, 3}, {4})),
    )


if __name__ == "__main__":
  unittest.main()
