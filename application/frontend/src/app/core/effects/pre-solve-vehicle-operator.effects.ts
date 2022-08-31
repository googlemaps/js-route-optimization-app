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
import { exhaustMap } from 'rxjs/operators';
import { PreSolveVehicleOperatorActions } from '../actions';
import { PreSolveEditVehicleOperatorDialogComponent } from '../containers/pre-solve-edit-vehicle-operator-dialog/pre-solve-edit-vehicle-operator-dialog.component';
import { Modal } from '../models';

@Injectable()
export class PreSolveVehicleOperatorEffects {
  edit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(
          PreSolveVehicleOperatorActions.editVehicleOperator,
          PreSolveVehicleOperatorActions.addVehicleOperator
        ),
        exhaustMap(({ vehicleOperatorId }) => {
          const dialogRef = this.dialog.open(PreSolveEditVehicleOperatorDialogComponent, {
            id: Modal.EditVehicleOperator,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.vehicleOperatorIds = [vehicleOperatorId];
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  bulkEdit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(PreSolveVehicleOperatorActions.editVehicleOperators),
        exhaustMap(({ vehicleOperatorIds }) => {
          const dialogRef = this.dialog.open(PreSolveEditVehicleOperatorDialogComponent, {
            id: Modal.EditVehicleOperator,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          dialogRef.componentInstance.vehicleOperatorIds = vehicleOperatorIds;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private dialog: MatDialog) {}
}
