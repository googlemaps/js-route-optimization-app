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
import { Store } from '@ngrx/store';
import { exhaustMap, filter, map, mergeMap, take } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { VehicleActions } from '../actions';
import { selectHasSolution } from '../selectors/solution.selectors';

@Injectable()
export class VehicleEffects {
  confirmDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleActions.confirmDeleteVehicle),
      exhaustMap((action) =>
        this.store.select(selectHasSolution).pipe(
          take(1),
          mergeMap((hasSolution) => {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Confirm delete',
                message:
                  `Delete Vehicle #${action.id}?` +
                  (hasSolution ? ' This will also clear the current solution.' : ''),
              },
            });
            return dialogRef.afterClosed().pipe(
              filter((res) => res),
              map(() => VehicleActions.deleteVehicle({ id: action.id }))
            );
          })
        )
      )
    )
  );

  confirmBulkDelete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(VehicleActions.confirmDeleteVehicles),
      exhaustMap((action) =>
        this.store.select(selectHasSolution).pipe(
          take(1),
          mergeMap((hasSolution) => {
            const dialogRef = this.dialog.open(ConfirmDialogComponent, {
              data: {
                title: 'Confirm delete',
                message:
                  `Delete ${action.ids.length} vehicles?` +
                  (hasSolution ? ' This will also clear the current solution.' : ''),
              },
            });
            return dialogRef.afterClosed().pipe(
              filter((res) => res),
              map(() => VehicleActions.deleteVehicles({ ids: action.ids }))
            );
          })
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private dialog: MatDialog,
    private store: Store<fromRoot.State>
  ) {}
}
