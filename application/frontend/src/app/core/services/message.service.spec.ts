/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from '../selectors/config.selectors';
import { MessageService } from './message.service';

describe('MessageService', () => {
  let _snackBar: jasmine.SpyObj<MatSnackBar>;
  let _store: MockStore<any>;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('snackBar', ['open']) },
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMessagesConfig, value: null }],
        }),
      ],
    });
    _snackBar = TestBed.inject(MatSnackBar) as jasmine.SpyObj<MatSnackBar>;
    _store = TestBed.inject(Store) as MockStore<any>;
  });

  it('should be created', () => {
    const service: MessageService = TestBed.inject(MessageService);
    expect(service).toBeTruthy();
  });
});
