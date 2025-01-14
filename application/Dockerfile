# build frontend
FROM node:22-alpine as build

WORKDIR /usr/src/app

COPY frontend/package.json ./package.tmp.json
COPY frontend/package.exclude.json ./package.exclude.json
# strip packages specific to lint and test
RUN npm install -g json-merger && \
  json-merger package.tmp.json package.exclude.json > package.json && \
  rm package.tmp.json && \
  rm package.exclude.json && \
  npm install

COPY frontend/ .
ARG configuration=production
RUN npm run build -- --output-path=./dist/out --configuration $configuration

# build backend
FROM node:22-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
RUN npm run build

# copy frontend static content
COPY --from=build /usr/src/app/dist/out/ /usr/src/app/public/

EXPOSE 8080
CMD [ "node", "server.js" ]
