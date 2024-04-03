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
