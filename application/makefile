.PHONY: build push release

build:
	docker build -t $(REGISTRY):$(COMMIT_TAG) -f Dockerfile .

push:
	docker push $(REGISTRY):$(COMMIT_TAG);

release:
	$(eval DIGEST = $(shell gcloud container images list-tags $(SNAPSHOT_REGISTRY) --filter=$(COMMIT_TAG) --format='get(digest)'))
	gcloud container images add-tag --quiet \
		$(SNAPSHOT_REGISTRY)@$(DIGEST) \
		$(RELEASE_REGISTRY):$(COMMIT_TAG) \
		$(RELEASE_REGISTRY):$(RELEASE_TAG)

default: build
