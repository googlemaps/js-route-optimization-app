/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IVisit } from '.';
import { VisitRequest } from './visit-request.model';

export interface Visit extends Omit<IVisit, 'visits'> {
  /** Equivalent to visit request id */
  id: number;
  shipmentRouteId: number;
  changeTime?: number;
}

export type VisitVisitRequest = { visit: Visit; visitRequest: VisitRequest };
