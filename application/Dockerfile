# build frontend
FROM node:22-alpine as build

# Mirror the npm workspace structure
WORKDIR /usr/src/app

COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/package.tmp.json
COPY frontend/package.exclude.json ./frontend/package.exclude.json
# strip packages specific to lint and test
RUN npm install -g json-merger && \
  cd frontend && \
  json-merger package.tmp.json package.exclude.json > package.json && \
  rm package.tmp.json && \
  rm package.exclude.json && \
  cd .. && \
  npm install

COPY frontend/ ./frontend/
ARG configuration=production
RUN cd frontend && npm run build -- --output-path=./dist/out --configuration $configuration

# build backend
FROM node:22-alpine

WORKDIR /usr/src/app

COPY backend/package*.json ./
RUN npm install

COPY backend/ .
RUN npm run build

# copy frontend static content
COPY --from=build /usr/src/app/frontend/dist/out/ /usr/src/app/public/

EXPOSE 8080
CMD [ "node", "server.js" ]
