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
