/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
