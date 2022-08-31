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
import { exhaustMap, first, map } from 'rxjs/operators';
import { newScenario } from 'src/app/welcome/actions/welcome-page.actions';
import { editAllGlobalRelaxationConstraints } from '../actions/request-settings.actions';
import { EditGlobalRelaxationConstraintsDialogComponent } from '../containers';
import { Modal } from '../models';
import { setShipmentModel } from '../actions/shipment-model.actions';

@Injectable()
export class RequestSettingsEffects {
  editGlobalRelaxationConstraints$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(editAllGlobalRelaxationConstraints),
        exhaustMap((action) => {
          const dialogRef = this.dialog.open(EditGlobalRelaxationConstraintsDialogComponent, {
            id: Modal.EditGlobalRelaxationConstraints,
            width: '100%',
            maxWidth: '900px',
          });
          dialogRef.componentInstance.constraintRelaxations = action.constraintRelaxations;
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  initializeRequestSettings$ = createEffect(() =>
    this.actions$.pipe(
      ofType(newScenario),
      first(),
      map(() => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const globalStartTime = now.getTime() / 1000;
        now.setHours(24);
        const globalEndTime = now.getTime() / 1000;
        return setShipmentModel({ globalStartTime, globalEndTime });
      })
    )
  );

  constructor(private actions$: Actions, private dialog: MatDialog) {}
}
