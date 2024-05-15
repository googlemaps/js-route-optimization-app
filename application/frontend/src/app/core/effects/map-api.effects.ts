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

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, first, map, mergeMap, retryWhen } from 'rxjs/operators';
import { httpRetryStrategy } from 'src/app/util';
import { loadScript, loadScriptFailure, loadScriptSuccess } from '../actions/map-api.actions';
import { MapApiService } from '../services';

@Injectable()
export class MapApiEffects {
  loadScript$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadScript),
      first(),
      mergeMap(({ mapConfig }) =>
        this.mapApiService.loadScript(mapConfig).pipe(
          map(() => loadScriptSuccess()),
          retryWhen(httpRetryStrategy()),
          catchError((error) => of(loadScriptFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private mapApiService: MapApiService) {}
}
