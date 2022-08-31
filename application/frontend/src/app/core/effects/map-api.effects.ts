/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
