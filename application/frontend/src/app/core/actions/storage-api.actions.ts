/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction } from '@ngrx/store';

export const openLoadDialog = createAction('[Storage API] Open Load Dialog');

export const openSaveDialog = createAction('[Storage API] Open Save Dialog');
