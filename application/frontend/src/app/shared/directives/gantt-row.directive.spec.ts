/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { GanttRowDirective } from './gantt-row.directive';

describe('GanttRowDirective', () => {
  it('should create an instance', () => {
    const directive = new GanttRowDirective(null);
    expect(directive).toBeTruthy();
  });
});
