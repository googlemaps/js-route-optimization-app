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
