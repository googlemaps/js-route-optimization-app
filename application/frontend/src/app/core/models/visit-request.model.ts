/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IVisitRequest } from './dispatcher.model';

export interface VisitRequest extends IVisitRequest {
  /** Equivalent to visit id */
  id: number;
  shipmentId: number;
  pickup: boolean;
  changeTime?: number;
}
