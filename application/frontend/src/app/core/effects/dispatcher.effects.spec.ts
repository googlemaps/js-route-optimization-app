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

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { cold } from 'jasmine-marbles';
import { Observable } from 'rxjs';
import { DispatcherActions } from '../actions';
import DispatcherApiSelectors from '../selectors/dispatcher-api.selectors';
import * as fromPreSolve from '../selectors/pre-solve.selectors';
import RoutesChartSelectors from '../selectors/routes-chart.selectors';
import { DispatcherEffects } from './dispatcher.effects';

describe('DispatcherEffects', () => {
  let actions$: Observable<any>;
  let _matDialog: jasmine.SpyObj<MatDialog>;
  let effects: DispatcherEffects;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        { provide: MatDialog, useValue: jasmine.createSpyObj('matDialog', ['open']) },
        { provide: Router, useValue: jasmine.createSpyObj('router', ['navigateByUrl']) },
        DispatcherEffects,
        provideMockStore({
          selectors: [
            { selector: fromPreSolve.selectActive, value: false },
            { selector: RoutesChartSelectors.selectDefaultRangeOffset, value: 0 },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    });

    actions$ = TestBed.inject(Actions);
    _matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
    effects = TestBed.inject<DispatcherEffects>(DispatcherEffects);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    spyOn(DispatcherApiSelectors, 'selectSolveContext').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });

  describe('navigateToShipments$', () => {
    it('upload scenario success should navigate to scenario planning', () => {
      actions$ = cold('-a-----', { a: DispatcherActions.uploadScenarioSuccess(null) });
      effects.navigateToShipments$.subscribe(() => {
        expect(router.navigateByUrl).toHaveBeenCalledWith('scenarioPlanning', {
          skipLocationChange: true,
        });
      });
    });
  });
});
