/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import * as fromConfig from '../selectors/config.selectors';
import { InitEffects } from './init.effects';

describe('InitEffects', () => {
  let actions$: Observable<any>;
  let effects: InitEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        InitEffects,
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMapConfig, value: null }],
        }),
        provideMockActions(() => actions$),
      ],
    });

    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<InitEffects>(InitEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
