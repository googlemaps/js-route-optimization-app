/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction } from '@ngrx/store';

export const openDialog = createAction('[Upload] Open Dialog');

export const closeDialog = createAction('[Upload] Close Dialog');

export const openCsvDialog = createAction('[Upload] Open CSV Dialog');
export const closeCsvDialog = createAction('[Upload] Close CSV Dialog');
