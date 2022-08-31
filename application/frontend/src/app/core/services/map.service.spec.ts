/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromMapApi from '../selectors/map-api.selectors';
import { MapService } from './map.service';

describe('MapService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: fromMapApi.selectScriptLoaded, value: false }],
        }),
        MapService,
      ],
    });
  });

  it('should be created', () => {
    const service: MapService = TestBed.inject(MapService);
    expect(service).toBeTruthy();
  });
});
