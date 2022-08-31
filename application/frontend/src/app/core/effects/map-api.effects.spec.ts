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
import { Observable } from 'rxjs';
import { MapApiService } from '../services';
import { MapApiEffects } from './map-api.effects';

describe('MapApiEffects', () => {
  let actions$: Observable<any>;
  let effects: MapApiEffects;
  let mapApiService: jasmine.SpyObj<MapApiService>;

  beforeEach(() => {
    mapApiService = jasmine.createSpyObj('mapApiService', ['loadScript']);

    TestBed.configureTestingModule({
      providers: [
        MapApiEffects,
        { provide: MapApiService, useValue: mapApiService },
        provideMockActions(() => actions$),
      ],
    });

    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<MapApiEffects>(MapApiEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
