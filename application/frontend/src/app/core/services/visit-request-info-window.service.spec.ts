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
import { MockMapService } from 'src/test/service-mocks';
import * as fromMap from '../selectors/map.selectors';
import * as fromUI from '../selectors/ui.selectors';
import { MapService } from './map.service';
import { VisitRequestInfoWindowService } from './visit-request-info-window.service';

describe('VisitRequestInfoWindowService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromUI.selectClickedVisitRequestId, value: null },
            { selector: fromMap.selectInfoWindowVisitRequest, value: null },
          ],
        }),
        { provide: MapService, value: MockMapService },
      ],
    })
  );

  it('should be created', () => {
    const service: VisitRequestInfoWindowService = TestBed.inject(VisitRequestInfoWindowService);
    expect(service).toBeTruthy();
  });
});
