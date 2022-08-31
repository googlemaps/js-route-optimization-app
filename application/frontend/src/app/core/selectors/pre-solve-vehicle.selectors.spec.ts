/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
