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

import * as fromRoutesChart from './routes-chart.actions';

describe('selectRange', () => {
  it('should return an action', () => {
    expect(fromRoutesChart.selectRange({ rangeIndex: 1 }).type).toBe('[RoutesChart] Select Range');
    expect(fromRoutesChart.selectRange({ rangeIndex: 2 }).rangeIndex).toBe(2);
  });
});
