/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { IDuration } from '../../core/models';

export interface ExtraVisitDurationFormValue {
  visitType: string;
  extraDuration: IDuration;
}

export interface ExtraVisitDurationValue {
  visitType?: string;
  extraDuration?: { min: number; sec: number };
}
