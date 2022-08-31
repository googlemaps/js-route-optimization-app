/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from '../selectors/config.selectors';
import { DispatcherClient } from './dispatcher-client';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DispatcherClient', () => {
  let _store: MockStore<any>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectBackendApiRoot, value: null }],
        }),
      ],
    });
    _store = TestBed.inject(Store) as MockStore<any>;
  });

  it('should be created', () => {
    const service: DispatcherClient = TestBed.inject(DispatcherClient);
    expect(service).toBeTruthy();
  });

  describe('optimizeToursProgressive', () => {
    it('should create request', () => {
      const service: DispatcherClient = TestBed.inject(DispatcherClient);
      const request = service.optimizeTours({}, Date.now());
      expect(request).toBeTruthy();
    });
  });
});
