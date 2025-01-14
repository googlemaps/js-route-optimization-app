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

import { describe, expect, test } from "@jest/globals";
import * as pako from "pako";
import request from "supertest";

import { mockGoogleCloudOptimization } from "./mocks/optimization-api.mock";
mockGoogleCloudOptimization();

import { app } from "../app";

import { SCENARIOS_AND_SOLUTIONS } from "./mocks/optimization-api.mock";

describe("optimization", () => {
  test("responds success to /healthz", async () => {
    const response = await request(app).get("/api/optimization/healthz");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toMatch(/text/);
    expect(response.text).toContain("OK");
  });

  describe("fleet-routing", () => {
    describe("optimize-tours", () => {
      test("responds bad request to missing body", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send();

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request to missing model", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send({});

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request to empty model", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send({ model: {} });

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request to missing model.shipments", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send({ model: { vehicles: [] } });

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request to missing model.vehicles", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send({ model: { shipments: [] } });

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request when file is not compressed", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-encoding", "gzip")
          .set('enctype', 'multipart/form-data')
          .attach("file", Buffer.from(JSON.stringify(SCENARIOS_AND_SOLUTIONS["optimize-tours-basic"].scenario)), "scenario.json.gz");

        expect(response.statusCode).toBe(400);
      });

      test("responds bad request when compressed file is not json", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-encoding", "gzip")
          .set('enctype', 'multipart/form-data')
          .attach("file", Buffer.from(pako.gzip("Not JSON")), "scenario.json.gz");

        expect(response.statusCode).toBe(400);
      });

      test("basic model", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send(SCENARIOS_AND_SOLUTIONS["optimize-tours-basic"].scenario);

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.routes).toBeDefined();
      });

      test("basic model, compressed", async () => {
        const json = JSON.stringify(SCENARIOS_AND_SOLUTIONS["optimize-tours-basic"].scenario);

        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-encoding", "gzip")
          .set('enctype', 'multipart/form-data')
          .attach("file", Buffer.from(pako.gzip(json)), "scenario.json.gz");

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.routes).toBeDefined();
      });
    });
  });
});
