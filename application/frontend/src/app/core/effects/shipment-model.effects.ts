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
