/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';

export const download = createAction('[Download] Download');

export const downloadSuccess = createAction(
  '[Download] Download Success',
  props<{ name: string; blob: Blob }>()
);

export const downloadFailure = createAction('[Download] Download Failure', props<{ error: any }>());

export const downloadCSV = createAction('[Download] Download CSV');

export const downloadPDF = createAction('[Download] Download PDF');
