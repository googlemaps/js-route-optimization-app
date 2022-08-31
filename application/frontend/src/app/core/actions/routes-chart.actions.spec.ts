/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as fromRoutesChart from './routes-chart.actions';

describe('selectRange', () => {
  it('should return an action', () => {
    expect(fromRoutesChart.selectRange({ rangeIndex: 1 }).type).toBe('[RoutesChart] Select Range');
    expect(fromRoutesChart.selectRange({ rangeIndex: 2 }).rangeIndex).toBe(2);
  });
});
