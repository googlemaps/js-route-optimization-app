/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as fromPreSolveVehicleOperator from '../reducers/pre-solve-vehicle-operator.reducer';
import { selectPreSolveVehicleOperatorState } from './pre-solve-vehicle-operator.selectors';

describe('PreSolveVehicleOperator Selectors', () => {
  it('should select the feature state', () => {
    const result = selectPreSolveVehicleOperatorState({
      [fromPreSolveVehicleOperator.preSolveVehicleOperatorFeatureKey]: {
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
