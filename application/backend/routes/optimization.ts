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

import express, { Response, Request } from "express";
import * as pako from "pako";
export const router = express.Router();

import { google } from "@google-cloud/routeoptimization/build/protos/protos";

import { log } from "../logging";
import { fleetRouting } from "../services/optimization";
import { GRPC_TO_HTTP_STATUS_CODES, OPTIMIZATION_VALIDATION_CODES } from "../services/optimization-status-codes";
import { upload } from "../upload";

router.get("/healthz", async (req: Request, res: Response) => {
  log.debug("Health check (Optimization)");
  res.status(200).send("OK");
});

router.post(
  "/fleet-routing/optimize-tours",
  upload.single('file'),
  async (req: Request, res: Response) => {
    let body: google.maps.routeoptimization.v1.IOptimizeToursRequest;
    if(req.headers['content-encoding'] == 'gzip') {
      try {
        const jsonString = pako.inflate(req.file!.buffer!, { to: 'string' });
        body = JSON.parse(jsonString) as google.maps.routeoptimization.v1.IOptimizeToursRequest;
      } catch (err: unknown) {
        log.warn('Unable to parse request body as gzip-compressed JSON string', err);
        return res.status(400).send("Invalid request body, expected a gzip-compressed JSON string");
      }
    } else {
      body = req.body as google.maps.routeoptimization.v1.IOptimizeToursRequest;
    }

    if (!body?.model) {
      return res
        .status(400)
        .send("Invalid request body, missing `model` property");
    }

    if (!body.model.shipments) {
      return res
        .status(400)
        .send("Invalid model, missing `shipments` property");
    }

    if (!body.model.vehicles) {
      return res.status(400).send("Invalid model, missing `vehicles` property");
    }

    try {
      const response = await fleetRouting.optimizeTours(body);
      return res.status(200).send(response);
    } catch (err: any) {
      log.error(err);

      const message = (err as Error).message || "UNKNOWN_ERROR";

      // unable to determine service account credentials
      // and/or credentials are invalid (keep error internal)
      if (
        message.includes("default credentials") ||
        message.includes("UNAUTHENTICATED")
      ) {
        return res.sendStatus(500);
      }

      let status = 500;
      if(err.code) {
        if(GRPC_TO_HTTP_STATUS_CODES[err.code]) {
          status = GRPC_TO_HTTP_STATUS_CODES[err.code];
        } else if(OPTIMIZATION_VALIDATION_CODES[err.code]) {
          status = 400;
        }
      }

      return res.status(status).send(message);
    }
  }
);
