/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

export const mapVehicleClicked = createAction('[UI] Map Vehicle Clicked', props<{ id: number }>());

export const mapVisitRequestClicked = createAction(
  '[UI] Map Visit Request Clicked',
  props<{ id: number }>()
);

export const changeSplitSizes = createAction(
  '[UI] Change Split Sizes',
  props<{ splitSizes: number[] }>()
);
