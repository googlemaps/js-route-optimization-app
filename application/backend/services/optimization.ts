/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { v1 } from "@google-cloud/optimization";
import { google } from "@google-cloud/optimization/build/protos/protos";
import { CallOptions } from "google-gax";

import { log } from "../logging";

class FleetRoutingService {
  private readonly _client: v1.FleetRoutingClient;
  private readonly _parent: string;

  constructor() {
    if (!process.env.PROJECT_ID) {
      throw Error("Missing required environment variable: PROJECT_ID");
    }
    this._parent = `projects/${process.env.PROJECT_ID}`;

    this._client = new v1.FleetRoutingClient({
      "grpc.keepalive_time_ms": 120000, // 2m
      "grpc.keepalive_timeout_ms": 10000, // 10s
      "grpc.http2.max_pings_without_data": 0,
    });
  }

  public async optimizeTours(
    request: google.cloud.optimization.v1.IOptimizeToursRequest
  ): Promise<google.cloud.optimization.v1.IOptimizeToursResponse> {
    request.parent = this._parent;

    // `IOptimizeToursRequest` defines timeout as an `IDuraion` object
    // where `seconds` can be either a number or a string.
    // `CallOptions` expects timeout as a number in milliseconds.
    // convert optimizeTours.timeout to a number in milliseconds
    let timeout = request.timeout?.seconds;
    if (typeof timeout === "string") {
      timeout = parseInt(timeout);
    }
    if (typeof timeout === "number") {
      // convert to milliseconds
      timeout *= 1000;
    }
    log.debug(`gRPC timeout: ${timeout}ms`);

    log.debug("FleetRoutingService.optimizeTours: begin request");

    const [response] = await this._client.optimizeTours(request, <CallOptions>{
      timeout,
    });

    log.debug("FleetRoutingService.optimizeTours: end request");

    return response;
  }
}

export const fleetRouting = new FleetRoutingService();
