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
import { Store } from '@ngrx/store';
import { combineLatest } from 'rxjs';
import { filter, map, mergeMap, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { ShipmentActions, ShipmentModelActions } from '../actions';
import ShipmentModelSelectors from '../selectors/shipment-model.selectors';
import ShipmentSelectors from '../selectors/shipment.selectors';

@Injectable()
export class ShipmentModelEffects {
  deleteShipment$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ShipmentActions.deleteShipment, ShipmentActions.deleteShipments),
      mergeMap((_action) =>
        combineLatest([
          this.store.select(ShipmentSelectors.selectLastDeletedIndices),
          this.store.select(ShipmentModelSelectors.selectPrecedenceRules),
        ]).pipe(take(1))
      ),
      filter(([_deletedIndices, oldPrecedenceRules]) => !!oldPrecedenceRules),
      map(([deletedIndices, oldPrecedenceRules]) => {
        const precedenceRules = [];
        oldPrecedenceRules.forEach((rule) => {
          if (
            deletedIndices.includes(rule.firstIndex) ||
            deletedIndices.includes(rule.secondIndex)
          ) {
            return;
          }
          const firstShift = deletedIndices.reduce(
            (count, deleteIndex) => count + (deleteIndex <= rule.firstIndex ? 1 : 0),
            0
          );
          const secondShift = deletedIndices.reduce(
            (count, deleteIndex) => count + (deleteIndex <= rule.secondIndex ? 1 : 0),
            0
          );

          precedenceRules.push({
            ...rule,
            firstIndex: rule.firstIndex - firstShift,
            secondIndex: rule.secondIndex - secondShift,
          });
        });
        return ShipmentModelActions.setPrecedenceRules({ precedenceRules });
      })
    )
  );

  constructor(private actions$: Actions, private store: Store<fromRoot.State>) {}
}
