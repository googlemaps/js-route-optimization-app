/*
Copyright 2024 Google LLC

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    https://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
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
