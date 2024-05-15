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
