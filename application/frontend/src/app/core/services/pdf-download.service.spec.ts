/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveVehicleSelectors from '../selectors/pre-solve-vehicle.selectors';

import { PdfDownloadService } from './pdf-download.service';

describe('PdfDownloadService', () => {
  let service: PdfDownloadService;
  let _store: MockStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromConfig.selectMapApiKey, value: '' },
            { selector: fromConfig.selectMapOptions, value: {} },
            { selector: fromConfig.selectStorageApi, value: { apiRoot: null } },
            { selector: PreSolveVehicleSelectors.selectVehicles, value: [] },
          ],
        }),
      ],
    });
    service = TestBed.inject(PdfDownloadService);
    _store = TestBed.inject(Store) as MockStore<any>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
