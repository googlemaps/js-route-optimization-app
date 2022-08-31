/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';

import { ConfigEffects } from './config.effects';
import { Actions } from '@ngrx/effects';

describe('ConfigEffects', () => {
  let actions$: Observable<any>;
  let effects: ConfigEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ConfigEffects, provideMockActions(() => actions$)],
    });

    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<ConfigEffects>(ConfigEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
