# How to evaluate an alternative solution with the CFR API

A very common question of CFR users is "why did the solver pick solution A
instead of an alternative solution B?" Very often, the answer is "because A is
more efficient", but it might not be immediately clear just from the distances
or the visualization of the solution on a map.

To help answer these questions, we provide a\
[Python script](http://python/cfr/json/evaluate_solution.py) that uses the CFR
API to evaluate alternative solutions to a scenario. With this tool, the user
can create alternative sequences of visits on the routes of the vehicles (e.g.
by modifying a solution returned by CFR) and see the metrics and the costs of
the solution.

The script is an end-to-end tool that takes the original scenario, a modified
solution (from which only the order of the visits is used). It makes a CFR
`optimizeTours` request with a modified original scenario that forces the solver
to use the alternative solution and recompute the metrics and costs as part of
the process. The metrics on the alternative solution can then be compared with
the solution returned by CFR for the original problem to better understand the
choices made.

## Usage of the script

The script is a stand-alone Python script. To run it, run the following from the
root of the CFR repository:
```
cd python
python3 -m cfr.json.evaluate_solution \
  --project "${YOUR_GCLOUD_PROJECT}" \
  --token "${YOUR_GCLOUD_TOKEN}" \
  --input_request "${INPUT_SCENARIO}" \
  --input_response "${INPUT_SOLUTION_TO_EVALUATE}" \
  --output_response "${OUTPUT_EXPANDED_SOLUTION}"
```

## A small example

Let's take an example scenario (assuming it is stored in `/tmp/scenario.json`):
```json
{
  "model": {
      "globalStartTime": "2024-03-07T08:00:00Z",
      "globalEndTime": "2024-03-07T20:00:00Z",
      "shipments": [
          {
              "label": "S0001",
              "pickups": [{
                  "arrivalLocation": {
                      "latitude": 48.883812,
                      "longitude": 2.361237
                  },
                  "duration": "300s"
              }],
              "deliveries": [{
                  "arrivalLocation": {
                      "latitude": 48.879442,
                      "longitude": 2.381168
                  },
                  "duration": "300s"
              }]
          },
          {
              "label": "S0002",
              "deliveries": [{
                  "arrivalLocation": {
                      "latitude": 48.890648,
                      "longitude": 2.351776
                  },
                  "duration": "300s"
              }]
          }
      ],
      "vehicles": [
          {
              "label": "V0001",
              "costPerKilometer": 1.0,
              "costPerHour": 60.0,
              "startLocation": {
                  "latitude": 48.879833,
                  "longitude": 2.349798
              },
          }
      ]
  }
}
```

It has a single vehicle V0001, and two shipments: S0001 with a pickup and a
delivery, and S0002 that has only a delivery. When sent to the CFR API, the
response will contain a solution like:
```json
{
  "routes": [
    {
      "vehicleLabel": "V0001",
      "vehicleStartTime": "2024-03-07T08:00:00Z",
      "vehicleEndTime": "2024-03-07T08:43:22Z",
      "visits": [
        {
          "shipmentIndex": 1,
          "startTime": "2024-03-07T08:06:58Z",
          "detour": "0s",
          "shipmentLabel": "S0002"
        },
        {
          "isPickup": true,
          "startTime": "2024-03-07T08:21:24Z",
          "detour": "886s",
          "shipmentLabel": "S0001"
        },
        {
          "startTime": "2024-03-07T08:38:22Z",
          "detour": "0s",
          "shipmentLabel": "S0001"
        }
      ],
      "transitions": [
        {
          "travelDuration": "418s",
          "travelDistanceMeters": 1327,
          "waitDuration": "0s",
          "totalDuration": "418s",
          "startTime": "2024-03-07T08:00:00Z"
        },
        {
          "travelDuration": "566s",
          "travelDistanceMeters": 2245,
          "waitDuration": "0s",
          "totalDuration": "566s",
          "startTime": "2024-03-07T08:11:58Z"
        },
        {
          "travelDuration": "718s",
          "travelDistanceMeters": 2887,
          "waitDuration": "0s",
          "totalDuration": "718s",
          "startTime": "2024-03-07T08:26:24Z"
        },
        {
          "travelDuration": "0s",
          "waitDuration": "0s",
          "totalDuration": "0s",
          "startTime": "2024-03-07T08:43:22Z"
        }
      ],
      "metrics": {
        "performedShipmentCount": 2,
        "travelDuration": "1702s",
        "waitDuration": "0s",
        "delayDuration": "0s",
        "breakDuration": "0s",
        "visitDuration": "900s",
        "totalDuration": "2602s",
        "travelDistanceMeters": 6459
      },
      "travelSteps": [
        {
          "duration": "448s",
          "distanceMeters": 1325
        },
        {
          "duration": "566s",
          "distanceMeters": 2248
        },
        {
          "duration": "687s",
          "distanceMeters": 2700
        },
        {
          "duration": "0s"
        }
      ],
      "vehicleDetour": "2602s",
      "routeCosts": {
        "model.vehicles.fixed_cost": 1000,
        "model.vehicles.cost_per_hour": 43.366666666666667,
        "model.vehicles.cost_per_kilometer": 6.459
      },
      "routeTotalCost": 1049.8256666666666
    }
  ],
  "totalCost": 1049.8256666666666,
  "metrics": {
    "aggregatedRouteMetrics": {
      "performedShipmentCount": 2,
      "travelDuration": "1702s",
      "waitDuration": "0s",
      "delayDuration": "0s",
      "breakDuration": "0s",
      "visitDuration": "900s",
      "totalDuration": "2602s",
      "travelDistanceMeters": 6459
    },
    "usedVehicleCount": 1,
    "earliestVehicleStartTime": "2024-03-07T08:00:00Z",
    "latestVehicleEndTime": "2024-03-07T08:43:22Z",
    "totalCost": 1049.8256666666666,
    "costs": {
      "model.vehicles.fixed_cost": 1000,
      "model.vehicles.cost_per_kilometer": 6.459,
      "model.vehicles.cost_per_hour": 43.366666666666667
    }
  }
}
```

We see that the solver chose to first deliver shipment S0002, and only then
pickup and deliver S0001. However, a driver might suggest that it would be
better to first pick up and deliver S0001, and deliver S0002 later. We can use
`evaluate_solution.py` to check whether this alternative is more efficient than
the solution proposed by CFR.

To do this, we first need to create a JSON file with the alternative solution.
Only the
[sequences of visits](https://cloud.google.com/optimization/docs/reference/rpc/google.cloud.optimization.v1#google.cloud.optimization.v1.ShipmentRoute.Visit)
on the shipment routes is required, all other fields are ignored by the script
and they can be omitted. We create a file `/tmp/solution-alt.json` with the
alternative solution:
```json
{
  "routes": [
    {
      "vehicleIndex": 0,
      "visits": [
        {
          "isPickup": true,
          "shipmentIndex": 0
        },
        {
          "shipmentIndex": 0
        },
        {
          "shipmentIndex": 1
        }
      ]
    }
  ]
}
```
Then, we can invoke the script to expand this to a full response. In the root of
the CFR repository, run:
```bash
cd python
python3 -m cfr.json.evaluate_solution \
  --project "${YOUR_GCLOUD_PROJECT}" \
  --token "${YOUR_GCLOUD_TOKEN}" \
  --input_request /tmp/scenario.json \
  --input_response /tmp/response-alt.json \
  --output_response /tmp/response-alt-full.json
```
where `${YOUR_GCLOUD_PROJECT}` is the name of the Google cloud project, and
`${YOUR_GCLOUD_TOKEN}` is the Google cloud token obtained from
`gcloud auth print-access-token`. It will create a new file
`/tmp/response-alt-full.json`:
```
{
  "routes": [
    {
      "vehicleLabel": "V0001",
      "vehicleStartTime": "2024-03-07T08:00:00Z",
      "vehicleEndTime": "2024-03-07T08:50:45Z",
      "visits": [
        {
          "isPickup": true,
          "startTime": "2024-03-07T08:06:38Z",
          "detour": "0s",
          "shipmentLabel": "S0001",
          "shipmentIndex": 0
        },
        {
          "startTime": "2024-03-07T08:23:36Z",
          "detour": "0s",
          "shipmentLabel": "S0001",
          "shipmentIndex": 0
        },
        {
          "shipmentIndex": 1,
          "startTime": "2024-03-07T08:45:45Z",
          "detour": "2327s",
          "shipmentLabel": "S0002"
        }
      ],
      "transitions": [
        {
          "travelDuration": "398s",
          "travelDistanceMeters": 1417,
          "waitDuration": "0s",
          "totalDuration": "398s",
          "startTime": "2024-03-07T08:00:00Z"
        },
        {
          "travelDuration": "718s",
          "travelDistanceMeters": 2887,
          "waitDuration": "0s",
          "totalDuration": "718s",
          "startTime": "2024-03-07T08:11:38Z"
        },
        {
          "travelDuration": "1029s",
          "travelDistanceMeters": 4000,
          "waitDuration": "0s",
          "totalDuration": "1029s",
          "startTime": "2024-03-07T08:28:36Z"
        },
        {
          "travelDuration": "0s",
          "waitDuration": "0s",
          "totalDuration": "0s",
          "startTime": "2024-03-07T08:50:45Z"
        }
      ],
      "metrics": {
        "performedShipmentCount": 2,
        "travelDuration": "2145s",
        "waitDuration": "0s",
        "delayDuration": "0s",
        "breakDuration": "0s",
        "visitDuration": "900s",
        "totalDuration": "3045s",
        "travelDistanceMeters": 8304
      },
      "travelSteps": [
        {
          "duration": "397s",
          "distanceMeters": 1414
        },
        {
          "duration": "687s",
          "distanceMeters": 2700
        },
        {
          "duration": "1019s",
          "distanceMeters": 4001
        },
        {
          "duration": "0s"
        }
      ],
      "vehicleDetour": "3045s",
      "routeCosts": {
        "model.vehicles.cost_per_hour": 50.75,
        "model.vehicles.fixed_cost": 1000,
        "model.vehicles.cost_per_kilometer": 8.304
      },
      "routeTotalCost": 1059.054
    }
  ],
  "totalCost": 1059.054,
  "metrics": {
    "aggregatedRouteMetrics": {
      "performedShipmentCount": 2,
      "travelDuration": "2145s",
      "waitDuration": "0s",
      "delayDuration": "0s",
      "breakDuration": "0s",
      "visitDuration": "900s",
      "totalDuration": "3045s",
      "travelDistanceMeters": 8304
    },
    "usedVehicleCount": 1,
    "earliestVehicleStartTime": "2024-03-07T08:00:00Z",
    "latestVehicleEndTime": "2024-03-07T08:50:45Z",
    "totalCost": 1059.054,
    "costs": {
      "model.vehicles.cost_per_kilometer": 8.304,
      "model.vehicles.fixed_cost": 1000,
      "model.vehicles.cost_per_hour": 50.75,
      "model.shipments.penalty_cost": 0
    },
    "skippedMandatoryShipmentCount": 0
  },
  "skippedShipments": []
}
```

By comparing the "metrics" section from the original CFR solution
```
  "metrics": {
    "aggregatedRouteMetrics": {
      "performedShipmentCount": 2,
      "travelDuration": "1702s",
      "waitDuration": "0s",
      "delayDuration": "0s",
      "breakDuration": "0s",
      "visitDuration": "900s",
      "totalDuration": "2602s",
      "travelDistanceMeters": 6459
    },
    "usedVehicleCount": 1,
    "earliestVehicleStartTime": "2024-03-07T08:00:00Z",
    "latestVehicleEndTime": "2024-03-07T08:43:22Z",
    "totalCost": 1049.8256666666666,
    "costs": {
      "model.vehicles.fixed_cost": 1000,
      "model.vehicles.cost_per_kilometer": 6.459,
      "model.vehicles.cost_per_hour": 43.366666666666667
    }
  }
```
and the same section from the alternative solution
```
  "metrics": {
    "aggregatedRouteMetrics": {
      "performedShipmentCount": 2,
      "travelDuration": "2145s",
      "waitDuration": "0s",
      "delayDuration": "0s",
      "breakDuration": "0s",
      "visitDuration": "900s",
      "totalDuration": "3045s",
      "travelDistanceMeters": 8304
    },
    "usedVehicleCount": 1,
    "earliestVehicleStartTime": "2024-03-07T08:00:00Z",
    "latestVehicleEndTime": "2024-03-07T08:50:45Z",
    "totalCost": 1059.054,
    "costs": {
      "model.vehicles.cost_per_kilometer": 8.304,
      "model.vehicles.fixed_cost": 1000,
      "model.vehicles.cost_per_hour": 50.75,
      "model.shipments.penalty_cost": 0
    },
    "skippedMandatoryShipmentCount": 0
  },
```
and we see that the original CFR solution is more efficient, and the route takes
takes 443 seconds more (compare "travelDuration" and "totalDuration"), it is
longer by 1845 meters (compare "travelDistanceMeters"), and the total cost is
higher by ~9.23 (compare "totalCost").
