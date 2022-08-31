/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as fromPreSolveShipment from '../reducers/pre-solve-shipment.reducer';
import { selectPreSolveShipmentState } from './pre-solve-shipment.selectors';

describe('PreSolveShipment Selectors', () => {
  it('should select the feature state', () => {
    const selectedColors: [id: number, colorIdx: number][] = [];
    selectedColors.push([6, 0]);

    const result = selectPreSolveShipmentState({
      [fromPreSolveShipment.preSolveShipmentFeatureKey]: {
        pageIndex: 0,
        pageSize: 25,
        sort: { active: null, direction: null },
        filters: [],
        selected: [],
        selectedColors,
        requested: [],
      },
    });

    expect(result).toEqual({
      pageIndex: 0,
      pageSize: 25,
      sort: { active: null, direction: null },
      filters: [],
      selected: [],
      selectedColors,
      requested: [],
    });
  });
});
