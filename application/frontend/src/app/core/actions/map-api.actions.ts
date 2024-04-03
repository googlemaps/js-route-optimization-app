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
import { MapConfig } from '../models';

export const loadScript = createAction('[Map/API] Load Script', props<{ mapConfig: MapConfig }>());

export const loadScriptSuccess = createAction('[Map/API] Load Script Success');

export const loadScriptFailure = createAction(
  '[Map/API] Load Script Failure',
  props<{ error: any }>()
);
