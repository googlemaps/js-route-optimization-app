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

      test("basic model", async () => {
        const response = await request(app)
          .post("/api/optimization/fleet-routing/optimize-tours")
          .set("content-type", "application/json")
          .send(SCENARIOS_AND_SOLUTIONS["optimize-tours-basic"].scenario);

        expect(response.statusCode).toBe(200);
        expect(response.headers["content-type"]).toMatch(/json/);
        expect(response.body.routes).toBeDefined();
      });
    });
  });
});
