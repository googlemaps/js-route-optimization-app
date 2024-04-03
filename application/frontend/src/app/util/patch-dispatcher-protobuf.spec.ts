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

import { google } from '@google-cloud/optimization/build/protos/protos';
import { configureProtobuf } from './configure-protobuf';
import masterCanon from 'src/samples/master_test.json';
import masterNonCanon from 'src/samples/master_test_noncanonical.json';
import masterSolution from 'src/samples/master_solution.json';
import masterSolutionNonCanon from 'src/samples/master_solution_noncanonical.json';

describe('util', () => {
  beforeAll(() => {
    configureProtobuf();
  });

  it('should convert canonical master JSON', async () => {
    const expected = google.cloud.optimization.v1.OptimizeToursRequest.fromObject(masterNonCanon);
    const result = google.cloud.optimization.v1.OptimizeToursRequest.fromObject(masterCanon);

    expect(result).toEqual(expected);
  });

  it('should convert canonical master JSON solution', async () => {
    const expected =
      google.cloud.optimization.v1.OptimizeToursResponse.fromObject(masterSolutionNonCanon);
    const result = google.cloud.optimization.v1.OptimizeToursResponse.fromObject(masterSolution);

    expect(result).toEqual(expected);
  });

  it('should convert canonical constraint relaxation', () => {
    const relaxation = {
      relaxations: [{ thresholdTime: '2019-10-02T22:39:00.000Z' }],
    };

    const result =
      google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.fromObject(
        relaxation
      );
    const expected =
      google.cloud.optimization.v1.InjectedSolutionConstraint.ConstraintRelaxation.fromObject({
        relaxations: [
          {
            thresholdTime: { seconds: (Date.parse('2019-10-02T22:39:00.000Z') / 1000).toString() },
          },
        ],
      });

    expect(result).toEqual(expected);
  });

  it('should convert canonical distance matrix row', () => {
    const expected =
      google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject({
        meters: [1000, 2000],
        durations: [{ seconds: 100 }, { seconds: 200 }],
      });

    const result = google.cloud.optimization.v1.ShipmentModel.DurationDistanceMatrix.Row.fromObject(
      {
        meters: [1000, 2000],
        durations: ['100s', '200s'],
      }
    );

    expect(result).toEqual(expected);
  });

  it('should convert canonical break request', () => {
    const expected = google.cloud.optimization.v1.BreakRule.BreakRequest.fromObject({
      earliestStartTime: { seconds: (Date.parse('2022-06-02T11:00:00.000Z') / 1000).toString() },
      latestStartTime: { seconds: (Date.parse('2022-06-02T11:45:00.000Z') / 1000).toString() },
      minDuration: { seconds: 2700 },
    });
    const result = google.cloud.optimization.v1.BreakRule.BreakRequest.fromObject({
      earliestStartTime: '2022-06-02T11:00:00.000Z',
      latestStartTime: '2022-06-02T11:45:00.000Z',
      minDuration: '2700s',
    });

    expect(result).toEqual(expected);
  });

  it('should convert canonical frequency constraint', () => {
    const result = google.cloud.optimization.v1.BreakRule.FrequencyConstraint.fromObject({
      minBreakDuration: '1800s',
      maxInterBreakDuration: '5400s',
    });

    const expected = google.cloud.optimization.v1.BreakRule.FrequencyConstraint.fromObject({
      minBreakDuration: { seconds: 1800 },
      maxInterBreakDuration: { seconds: 5400 },
    });

    expect(result).toEqual(expected);
  });
});
