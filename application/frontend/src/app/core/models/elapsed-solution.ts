/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IOptimizeToursRequest, IOptimizeToursResponse } from 'src/app/core/models';

export interface ElapsedSolution {
  scenario: IOptimizeToursRequest;
  solution: IOptimizeToursResponse;
  elapsedTime: number;
  requestTime: number;
  timeOfResponse?: number;
  batchTime?: number;
}
