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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import DenormalizeSelectors from '../selectors/denormalize.selectors';
import PreSolveVehicleSelectors from '../selectors/pre-solve-vehicle.selectors';
import { DispatcherClient } from '../services';
import { EditVisitEffects } from './edit-visit.effects';

describe('EditVisitEffects', () => {
  let actions$: Observable<any>;
  let effects: EditVisitEffects;
  let _dispatcherClient: jasmine.SpyObj<DispatcherClient>;
  let _matDialog: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EditVisitEffects,
        {
          provide: DispatcherClient,
          useValue: jasmine.createSpyObj('dispatcherClient', ['optimizeToursProgressive']),
        },
        { provide: MatDialog, useValue: jasmine.createSpyObj('matDialog', ['open']) },
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [{ selector: PreSolveVehicleSelectors.selectSelectedVehicles, value: [] }],
        }),
      ],
    });

    _dispatcherClient = TestBed.inject(DispatcherClient) as jasmine.SpyObj<DispatcherClient>;
    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<EditVisitEffects>(EditVisitEffects);

    spyOn(DenormalizeSelectors, 'selectRequestRecalculatePolylines').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
