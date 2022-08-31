/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { DispatcherService } from './dispatcher.service';

describe('DispatcherService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    const service: DispatcherService = TestBed.inject(DispatcherService);
    expect(service).toBeTruthy();
  });
});
