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
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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
