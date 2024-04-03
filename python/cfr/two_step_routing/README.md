# Two-step routing example

This directory contains a Python library that uses the Cloud Fleet Routing (CFR)
API to optimize routes with two-step deliveries: under this model, shipments can
be handled in two ways:
- delivered directly: the vehicle handling the shipment arrives directly to the
  final delivery address.
- delivered through a parking location: when handling the shipment, the vehicle
  parks at a specified parking location, while the driver delivers the shipment
  by foot.

This library solves the problem by decomposing it into two CFR requests that are
solved using the CFR API, and then combining their solution to build the
combined driving/walking routes.

## Example

In the root of the repository, run:

```
CLOUD_ACCESS_TOKEN=$(gcloud auth print-access-token)
CLOUD_PROJECT_ID=...
python3 -m examples.two_step_routing.two_step_routing_main \
  --request=examples/two_step_routing/example_request.json \
  --parking=examples/two_step_routing/example_parking.json \
  --project="${CLOUD_PROJECT_ID}" \
  --token="${CLOUD_ACCESS_TOKEN}"
```

## License

The example code is licensed under the Apache 2.0 license, see
[LICENSE](../../LICENSE) for details.
