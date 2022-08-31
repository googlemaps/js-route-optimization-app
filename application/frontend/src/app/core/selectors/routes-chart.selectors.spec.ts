/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import * as fromRoutesChart from '../reducers/routes-chart.reducer';
import { selectRoutesChartState } from './routes-chart.selectors';

describe('RoutesChart Selectors', () => {
  it('should select the feature state', () => {
    const selectedRoutesColors: [id: number, colorIdx: number][] = [];
    selectedRoutesColors.push([6, 0]);

    const result = selectRoutesChartState({
      [fromRoutesChart.routesChartFeatureKey]: {
        view: 'day',
        rangeIndex: 0,
        rangeOffset: 1,
        filters: [{ id: '1', label: 'foo', params: null }],
        pageIndex: 10,
        pageSize: 100,
        addedRange: 1000,
        selectedRoutes: [6],
        selectedRoutesColors,
      },
    });

    expect(result).toEqual({
      view: 'day',
      rangeIndex: 0,
      rangeOffset: 1,
      filters: [{ id: '1', label: 'foo', params: null }],
      pageIndex: 10,
      pageSize: 100,
      addedRange: 1000,
      selectedRoutes: [6],
      selectedRoutesColors,
    });
  });
});
