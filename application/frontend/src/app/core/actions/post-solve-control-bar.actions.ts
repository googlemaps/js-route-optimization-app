/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

export const changeRangeOffset = createAction(
  '[PostSolveControlBar] Change Range Offset',
  props<{ rangeOffset: number }>()
);
