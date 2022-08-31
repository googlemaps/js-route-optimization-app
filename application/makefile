.PHONY: build push release

build:
	docker build -t $(REGISTRY)/app:$(COMMIT_TAG) -f Dockerfile .

push:
	docker push $(REGISTRY)/app:$(COMMIT_TAG);

release:
	$(eval DIGEST = $(shell gcloud container images list-tags $(SNAPSHOT_REGISTRY)/app --filter=$(COMMIT_TAG) --format='get(digest)'))
	gcloud container images add-tag --quiet \
		$(SNAPSHOT_REGISTRY)/app@$(DIGEST) \
		$(RELEASE_REGISTRY)/app:$(COMMIT_TAG) \
		$(RELEASE_REGISTRY)/app:$(RELEASE_TAG)

default: build