/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { FilterService } from './filter.service';

describe('FilterService', () => {
  let service: FilterService;
  let _matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('matDialog', ['open', 'afterClosed']),
        },
      ],
    });
    service = TestBed.inject(FilterService);
    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
