export SNAPSHOT_REGISTRY ?= us-docker.pkg.dev/fleetrouting-app-ops/fleetrouting-app/snapshot
export RELEASE_REGISTRY ?= us-docker.pkg.dev/fleetrouting-app-ops/fleetrouting-app/release
export REGISTRY ?= $(SNAPSHOT_REGISTRY)
export COMMIT_TAG ?= fffffff
export RELEASE_TAG  ?= 0.0.0

application := application

.PHONY: build push release

build:
	$(MAKE) -C application build

push:
	$(MAKE) -C application push

release:
	$(MAKE) -C application release
