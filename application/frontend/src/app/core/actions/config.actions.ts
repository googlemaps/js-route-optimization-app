/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { Timezone } from 'src/app/shared/models';
import { Config } from '../models/config';

export const loadConfig = createAction('[Config] Load Config');

export const loadConfigSuccess = createAction(
  '[Config] Load Config Success',
  props<{ config: Config }>()
);

export const loadConfigFailure = createAction(
  '[Config] Load Config Failure',
  props<{ error: any }>()
);

export const setTimezone = createAction(
  '[Config] Set Timezone',
  props<{ newTimezone: Timezone }>()
);
