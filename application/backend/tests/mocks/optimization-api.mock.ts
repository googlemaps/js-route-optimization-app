/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import fs from "fs";
import path from "path";

import { jest } from "@jest/globals";

import { google } from "@google-cloud/optimization/build/protos/protos";

export const SCENARIOS_AND_SOLUTIONS: {
  [label: string]: {
    scenario: google.cloud.optimization.v1.IOptimizeToursRequest;
    solution?: google.cloud.optimization.v1.IOptimizeToursResponse;
  };
} = {};

// load scenarios
["./models/fleet-routing/basic-scenario.json"].forEach((scenarioFile) => {
  const scenario = JSON.parse(
    fs.readFileSync(path.join(__dirname, scenarioFile)).toString()
  ) as google.cloud.optimization.v1.IOptimizeToursRequest;

  if (!scenario.label) {
    console.error(`Missing label in mock scenario file:  ${scenarioFile}`);
    return;
  }

  SCENARIOS_AND_SOLUTIONS[scenario.label] = {
    scenario,
    solution: undefined, // expect solution to be loaded later
  };
});

// load solutions
["./models/fleet-routing/basic-solution.json"].forEach((solutionFile) => {
  const solution = JSON.parse(
    fs.readFileSync(path.join(__dirname, solutionFile)).toString()
  ) as google.cloud.optimization.v1.IOptimizeToursResponse;

  if (!solution.requestLabel) {
    console.error(`Missing requestLabel in mock solution file:  ${solutionFile}`);
    return;
  }

  if (!SCENARIOS_AND_SOLUTIONS[solution.requestLabel]) {
    console.error(
      `requestLabel does not match any scenarios:  ${solution.requestLabel}`
    );
    return;
  }

  SCENARIOS_AND_SOLUTIONS[solution.requestLabel].solution = solution;
});

export function mockGoogleCloudOptimization() {
  const mockImp = jest.fn().mockImplementation(() => {
    return {
      optimizeTours: async (
        req: google.cloud.optimization.v1.IOptimizeToursRequest
      ) => {
        if(!req.label || !SCENARIOS_AND_SOLUTIONS[req.label]?.solution) {
          throw new Error(`Request label does not match any solutions:  ${req.label}`)
        }

        return [SCENARIOS_AND_SOLUTIONS[req.label].solution, null, null];
      },
    };
  });

  return jest.mock("@google-cloud/optimization", () => {
    return {
      FleetRoutingClient: mockImp, // alias for v1.FleetRoutingClient
      v1: {
        FleetRoutingClient: mockImp,
      },
    };
  });
}
