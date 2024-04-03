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

import * as fromPreSolveVehicle from '../reducers/pre-solve-vehicle.reducer';
import { selectPreSolveVehicleState } from './pre-solve-vehicle.selectors';

describe('PreSolveVehicle Selectors', () => {
  it('should select the feature state', () => {
    const result = selectPreSolveVehicleState({
      [fromPreSolveVehicle.preSolveVehicleFeatureKey]: {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        requested: [],
      },
    });

    expect(result).toEqual({
      pageIndex: 0,
      pageSize: 25,
      sort: { active: null, direction: null },
      filters: [],
      selected: [],
      requested: [],
    });
  });
});
