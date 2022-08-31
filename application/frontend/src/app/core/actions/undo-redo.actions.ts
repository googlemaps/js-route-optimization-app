/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { Page } from '../models';

export const undo = createAction('[Undo Redo] Undo');

export const redo = createAction('[Undo Redo] Redo');

export const changePage = createAction('[Undo Redo] Change Page', props<{ page: Page }>());
