/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
