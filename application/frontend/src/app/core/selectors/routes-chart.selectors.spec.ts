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
