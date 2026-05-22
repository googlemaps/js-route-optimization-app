SHORT_SHA=$(git rev-parse --short HEAD)
TAG=$REGISTRY:$SHORT_SHA
docker build -t $TAG --platform linux/amd64 .
docker push $TAG
echo $TAG