/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { createAction, props } from '@ngrx/store';
import { ActiveFilter } from 'src/app/shared/models';
import { Page } from '../models';

export const addFilter = createAction(
  '[MetadataControlBar] Add Filter',
  props<{ filter: ActiveFilter; page: Page }>()
);

export const editFilter = createAction(
  '[MetadataControlBar] Edit Filter',
  props<{ currentFilter: ActiveFilter; previousFilter: ActiveFilter; page: Page }>()
);

export const removeFilter = createAction(
  '[MetadataControlBar] Remove Filter',
  props<{ filter: ActiveFilter; page: Page }>()
);

export const changeDisplayColumns = createAction(
  '[MetadataControlBar] Change Display Columns',
  props<{ displayColumns: { [columnId: string]: boolean }; page: Page }>()
);
