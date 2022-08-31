/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { MapConfig } from '../models';

export const loadScript = createAction('[Map/API] Load Script', props<{ mapConfig: MapConfig }>());

export const loadScriptSuccess = createAction('[Map/API] Load Script Success');

export const loadScriptFailure = createAction(
  '[Map/API] Load Script Failure',
  props<{ error: any }>()
);
