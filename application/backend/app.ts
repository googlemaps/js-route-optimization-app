/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { promises as fs } from "fs";

import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import express, { Response, Request } from "express";

import { router as apiRoutes } from "./routes/api";
import { router as optimizationRoutes } from "./routes/optimization";

import { log } from "./logging";

export const app = express();

// logging
app.use(log);

// headers
app.disable("x-powered-by");

// compression
app.use(
  compression()
);

// cors
app.use(
  cors({
    origin: "*",
    methods: "GET, PUT, POST, DELETE",
    allowedHeaders: "Content-Type, Content-Encoding, enctype, x-server-timeout"
  })
);

// body parser
app.use(bodyParser.json({ limit: "1gb" }));
app.use(bodyParser.urlencoded({ limit: "1gb", extended: true }));

/**
 * Readiness/liveness probe
 */
app.get("/healthz", async (req: Request, res: Response) => {
  log.logger.debug("Health check");
  res.status(200).send("OK");
});

/**
 * Generate front-end config from env vars
 */
app.get("/config.json", async (req: Request, res: Response) => {
  let config: any;

  // get config.json from angular app when proxied
  if (process.env.FRONTEND_PROXY) {
    try {
      const axios = (await import("axios") as any);
      const response = await axios.get(
        process.env.FRONTEND_PROXY + "config.json"
      );
      config = response.data;
    } catch (err) {
      log.logger.error(err);
    }
  }

  if (!config) {
    try {
      // Read config.json from cwd
      const data = await fs.readFile("public/config.json");
      config = JSON.parse(data.toString());
    } catch (err) {
      log.logger.error(err);
      return res.sendStatus(404);
    }
  }

  try {
    // self link to this api
    if (!config.backendApi) {
      config.backendApi = {};
    }
    config.backendApi.apiRoot = process.env.API_ROOT;

    // experimental features
    config.allowExperimentalFeatures = process.env.ALLOW_EXPERIMENTAL_FEATURES?.toLowerCase() === "true";

    // maps api
    if (!config.map) {
      config.map = {};
    }
    config.map.apiKey = process.env.MAP_API_KEY;

    // storage api
    if (!config.storageApi) {
      config.storageApi = {};
    }
    config.storageApi.apiRoot = process.env.API_ROOT;
    config.storageApi.allowUserStorage = process.env.ALLOW_USER_GCS_STORAGE?.toLowerCase() === "true";

    res.status(200).send(config);
  } catch (err) {
    log.logger.error(err);
    return res.sendStatus(500);
  }
});

/**
 * Front-end static content
 */
if (process.env.FRONTEND_PROXY) {
  import("http-proxy-middleware").then((module) => {
    app.use(
      "/",
      module.createProxyMiddleware({
        target: process.env.FRONTEND_PROXY,
      })
    );
  });
} else {
  app.use(express.static("public"));
}

// other routes
app.use("/api", apiRoutes);
app.use("/api/optimization", optimizationRoutes);
