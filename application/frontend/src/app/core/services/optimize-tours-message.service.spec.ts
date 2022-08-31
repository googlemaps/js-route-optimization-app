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
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { MessageService } from './message.service';
import { OptimizeToursMessageService } from './optimize-tours-message.service';

describe('OptimizeToursMessageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MessageService,
        { provide: MatSnackBar, useValue: jasmine.createSpyObj('snackBar', ['open']) },
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMessagesConfig, value: null }],
        }),
      ],
    });
  });

  it('should be created', () => {
    const service: OptimizeToursMessageService = TestBed.inject(OptimizeToursMessageService);
    expect(service).toBeTruthy();
  });
});
