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

import { createEffect, ofType, Actions, EffectNotification, OnRunEffects } from '@ngrx/effects';
import { first, exhaustMap, takeUntil, map, mergeMapTo } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import * as fromConfig from '../selectors/config.selectors';
import { ConfigActions, MapApiActions, InitActions } from '../actions';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { startInitialization } from '../actions/init.actions';
import { loadConfigSuccess } from '../actions/config.actions';

/**
 * @remarks
 * Based on: https://medium.com/@remohy1/initialize-angular-app-with-ngrx-app-initializer-6556b819e0e3
 */
@Injectable()
export class InitEffects implements OnRunEffects {
  initConfig$ = createEffect(() =>
    this.actions$.pipe(
      ofType(startInitialization),
      first(),
      map(() => ConfigActions.loadConfig())
    )
  );

  initMapApi$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadConfigSuccess),
      mergeMapTo(this.store.select(fromConfig.selectMapConfig)),
      first(),
      map((mapConfig) => MapApiActions.loadScript({ mapConfig }))
    )
  );

  constructor(private actions$: Actions, private store: Store<fromRoot.State>) {}

  ngrxOnRunEffects(
    resolvedEffects$: Observable<EffectNotification>
  ): Observable<EffectNotification> {
    return this.actions$.pipe(
      exhaustMap(() =>
        resolvedEffects$.pipe(
          takeUntil(this.actions$.pipe(ofType(InitActions.finishInitialization)))
        )
      )
    );
  }
}
