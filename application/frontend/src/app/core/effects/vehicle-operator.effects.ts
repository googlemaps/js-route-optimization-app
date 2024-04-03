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
