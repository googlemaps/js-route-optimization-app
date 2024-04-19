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

import { google } from "@google-cloud/optimization/build/protos/protos";
import { CallOptions } from "google-gax";

import { log } from "../logging";
import { RouteOptimizationClient } from "@google-cloud/optimization/build/src/v1";

class FleetRoutingService {
  private readonly _client: RouteOptimizationClient;
  private readonly _parent: string;

  constructor() {
    if (!process.env.PROJECT_ID) {
      throw Error("Missing required environment variable: PROJECT_ID");
    }
    this._parent = `projects/${process.env.PROJECT_ID}`;

    this._client = new RouteOptimizationClient({
      "grpc.keepalive_time_ms": 120000, // 2m
      "grpc.keepalive_timeout_ms": 10000, // 10s
      "grpc.http2.max_pings_without_data": 0,
    });
  }

  public async optimizeTours(
    request: google.maps.routeoptimization.v1.IOptimizeToursRequest
  ): Promise<google.maps.routeoptimization.v1.IOptimizeToursResponse> {
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
