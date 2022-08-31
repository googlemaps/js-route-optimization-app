/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { map, mergeMap, take, withLatestFrom } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import RoutesChartSelectors from '../../core/selectors/routes-chart.selectors';
import { RoutesChartActions } from '../actions';
import ShipmentModelSelectors from '../selectors/shipment-model.selectors';

@Injectable()
export class RoutesChartEffects {
  anchorRangeOffset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(RoutesChartActions.selectRange),
      mergeMap(() =>
        this.store.pipe(
          select(RoutesChartSelectors.selectSelectedRange),
          take(1),
          withLatestFrom(
            this.store.pipe(select(RoutesChartSelectors.selectRangeOffset)),
            this.store.pipe(select(ShipmentModelSelectors.selectGlobalDuration))
          ),
          map(([range, rangeOffset, globalDuration]) => {
            const globalStart = globalDuration[0].toNumber();
            const globalEnd = globalDuration[1].toNumber();
            if (rangeOffset + range.value < globalStart) {
              // Range ends before global duration, use the global duration's start for the range offset/start instead
              rangeOffset = globalStart;
            } else if (rangeOffset > globalEnd) {
              // Range starts after global duration, use the global duration's end for the range end instead
              rangeOffset = globalEnd - range.value;
            }

            // Adjust to unit steps anchored on midnight
            const date = new Date(rangeOffset * 1000);
            date.setUTCHours(0, 0, 0, 0);
            const midnightSeconds = date.getTime() / 1000;

            rangeOffset =
              midnightSeconds +
              Math.floor((rangeOffset - midnightSeconds) / range.unitStep.value) *
                range.unitStep.value;
            return RoutesChartActions.anchorRangeOffset({ rangeOffset });
          })
        )
      )
    )
  );

  constructor(private actions$: Actions, private store: Store<fromRoot.State>) {}
}
