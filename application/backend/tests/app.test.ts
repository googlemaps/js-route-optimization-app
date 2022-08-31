/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import request from "supertest";
import { describe, expect, test } from "@jest/globals";

import { app } from "../app";

describe("app", () => {
  test("responds success to /healthz", async () => {
    const response = await request(app).get("/healthz");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text/);
    expect(response.text).toContain("OK");
  });

  test("generates config.json", async () => {
    // set up environment
    const apiRoot = "https://test.fleetrouting.app/v0/test/not-a-real-endpoint";
    process.env.API_ROOT = apiRoot;

    const mapKey = "abd123def456ghi789jkl";
    process.env.MAP_API_KEY = mapKey;

    process.env.ALLOW_EXPERIMENTAL_FEATURES = "true";
    process.env.ALLOW_USER_GCS_STORAGE = "true";

    // send request
    const response = await request(app).get("/config.json");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/json/);

    // check body matches env vars
    expect(response.body.allowExperimentalFeatures).toBe(true);
    expect(response.body.backendApi.apiRoot).toBe(apiRoot);
    expect(response.body.dispatcherApi).toBeUndefined(); // removed for v1
    expect(response.body.map.apiKey).toBe(mapKey);
    expect(response.body.storageApi.apiRoot).toBe(apiRoot);
    expect(response.body.storageApi.allowUserStorage).toBe(true);
  });

  test("returns static content", async () => {
    const response = await request(app).get("/");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/html/);
    expect(response.text).toContain("<html>");
  });
});
