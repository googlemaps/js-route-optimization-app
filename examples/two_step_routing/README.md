# Two-step routing example

This directory contains a Python library that uses the Cloud Fleet Routing (CFR)
API to optimize routes with two-step deliveries: under this model, shipments can
be handled in two ways:
- delivered directly: the vehicle handling the shipment arrives directly to the
  final delivery addres.
- delivered through a parking location: when handling the shipment, the vehicle
  parks at a specified parking location, while the driver delivers the shipment
  by foot.

This library solves the problem by decomposing it into two CFR requests that are
solved using the CFR API, and then combining their solution to build the
combined driving/walking routes.

## Example

```
CLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
CLOUD_PROJECT_ID=...
python3 two_step_routing_main.py \
  --request=example_request.json \
  --parking=example_parking.json \
  --project="${CLOUD_PROJECT_ID}" \
  --token="${CLOUD_ACCESS_TOKEN}"
```

## License

The example code is licensed under an MIT-style license, see
[LICENSE](../../LICENSE) for details.
