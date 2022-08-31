/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Actions, ofType, createEffect } from '@ngrx/effects';

import { catchError, map, retryWhen, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { Config } from '../models/config';
import { loadConfig, loadConfigSuccess, loadConfigFailure } from '../actions/config.actions';
import { httpRetryStrategy } from 'src/app/util';
import { getDstAdjustedUserTimezone } from 'src/app/util/timezones';

@Injectable()
export class ConfigEffects {
  loadConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadConfig),
      mergeMap(() =>
        this.httpClient.get<Config>('./config.json').pipe(
          map((config) => {
            config.timezone = getDstAdjustedUserTimezone();
            return config;
          }),
          map((config) => loadConfigSuccess({ config })),
          retryWhen(httpRetryStrategy()),
          catchError((error) => of(loadConfigFailure({ error })))
        )
      )
    )
  );

  constructor(private actions$: Actions, private httpClient: HttpClient) {}
}
