/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import RoutesChartSelectors from '../../core/selectors/routes-chart.selectors';
import { RoutesChartEffects } from './routes-chart.effects';
import ShipmentModelSelectors from '../selectors/shipment-model.selectors';

describe('RoutesChartEffects', () => {
  let actions$: Observable<any>;
  let effects: RoutesChartEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        RoutesChartEffects,
        provideMockActions(() => actions$),
        provideMockStore({
          selectors: [
            { selector: RoutesChartSelectors.selectSelectedRange, value: null },
            { selector: RoutesChartSelectors.selectRangeOffset, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },
          ],
        }),
      ],
    });

    actions$ = TestBed.inject(Actions);
    effects = TestBed.inject<RoutesChartEffects>(RoutesChartEffects);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
