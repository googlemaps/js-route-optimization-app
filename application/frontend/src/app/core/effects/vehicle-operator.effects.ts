/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { exhaustMap, filter, map, mergeMap, switchMapTo, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { MainNavActions, VehicleOperatorActions } from '../actions';
import { selectHasSolution } from '../selectors/solution.selectors';
import PreSolveVehicleOperatorSelectors from '../selectors/pre-solve-vehicle-operator.selectors';

@Injectable()
export class VehicleOperatorEffects {
  confirmDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleOperatorActions.confirmDeleteVehicleOperator),
      exhaustMap((action) =>
        this.store.select(selectHasSolution).pipe(
          take(1),
          mergeMap((hasSolution) => {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Confirm delete',
                message:
                  `Delete Vehicle Operator#${action.id}?` +
                  (hasSolution ? ' This will also clear the current solution.' : ''),
              },
            });
            return dialogRef.afterClosed().pipe(
              filter((res) => res),
              map(() => VehicleOperatorActions.deleteVehicleOperator({ id: action.id }))
            );
          })
        )
      )
    )
  );

  confirmBulkDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleOperatorActions.confirmDeleteVehicleOperators),
      exhaustMap((action) =>
        this.store.select(selectHasSolution).pipe(
          take(1),
          mergeMap((hasSolution) => {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Confirm delete',
                message:
                  `Delete ${action.ids.length} vehicle Operators?` +
                  (hasSolution ? ' This will also clear the current solution.' : ''),
              },
            });
            return dialogRef.afterClosed().pipe(
              filter((res) => res),
              map(() => VehicleOperatorActions.deleteVehicleOperators({ ids: action.ids }))
            );
          })
        )
      )
    )
  );

  requestedIds$ = createEffect(() =>
    this.actions$.pipe(
      ofType(MainNavActions.solve),
      switchMapTo(
        this.store.pipe(
          select(PreSolveVehicleOperatorSelectors.selectSelectedVehicleOperators),
          take(1)
        )
      ),
      map((selectSelected) => {
        return VehicleOperatorActions.setRequestIds({
          requestedIDs: selectSelected.map((obj) => obj.id),
        });
      })
    )
  );

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private store: Store<fromRoot.State>
  ) {}
}
