/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { select, Store } from '@ngrx/store';
import { asyncScheduler, race, scheduled, zip } from 'rxjs';
import { filter, first } from 'rxjs/operators';
import { InitActions } from './core/actions';
import * as fromRoot from './reducers';
import * as fromConfig from './core/selectors/config.selectors';
import * as fromMapApi from './core/selectors/map-api.selectors';

export function initApp(store: Store<fromRoot.State>) {
  return () => {
    return new Promise((resolve) => {
      /**
       * @remarks
       * Dispatch startInitialization only after NgRx has had time to setup.
       * Source: https://github.com/ngrx/platform/issues/103#issuecomment-459313665
       */
      scheduled([InitActions.startInitialization()], asyncScheduler).subscribe(
        (startInitialization) => store.dispatch(startInitialization)
      );

      return zip(
        race(
          store.pipe(
            select(fromConfig.selectConfigLoaded),
            filter((loaded) => loaded)
          ),
          store.pipe(
            select(fromConfig.selectConfigError),
            filter((error) => error != null)
          )
        ),
        race(
          store.pipe(
            select(fromMapApi.selectScriptLoaded),
            filter((loaded) => loaded)
          ),
          store.pipe(
            select(fromMapApi.selectScriptError),
            filter((error) => error != null)
          )
        )
      )
        .pipe(
          filter(([configComplete, scriptComplete]) => configComplete && scriptComplete),
          first()
        )
        .subscribe(() => {
          store.dispatch(InitActions.finishInitialization());
          resolve(true);
        });
    });
  };
}
