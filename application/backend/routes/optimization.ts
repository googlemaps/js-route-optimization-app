/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import express, { Response, Request } from "express";
export const router = express.Router();

import { google } from "@google-cloud/optimization/build/protos/protos";

import { log } from "../logging";
import { fleetRouting } from "../services/optimization";
import { GRPC_TO_HTTP_STATUS_CODES, OPTIMIZATION_VALIDATION_CODES } from "../services/optimization-status-codes";

router.get("/healthz", async (req: Request, res: Response) => {
  log.debug("Health check (Optimization)");
  res.status(200).send("OK");
});

router.post(
  "/fleet-routing/optimize-tours",
  async (req: Request, res: Response) => {
    const body = req.body as google.cloud.optimization.v1.IOptimizeToursRequest;

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
