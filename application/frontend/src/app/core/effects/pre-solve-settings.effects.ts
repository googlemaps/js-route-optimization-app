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
import { RequestSettingsActions } from '../actions';
import { PreSolveSettingsDialogComponent } from '../containers';
import { Modal } from '../models';

@Injectable()
export class PreSolveSettingsEffects {
  edit$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(RequestSettingsActions.editSettings),
        exhaustMap(() => {
          const dialogRef = this.dialog.open(PreSolveSettingsDialogComponent, {
            id: Modal.EditSettings,
            maxHeight: '100%',
            maxWidth: '100%',
            position: { right: '0' },
            panelClass: 'fly-out-dialog',
          });
          return dialogRef.afterClosed();
        })
      ),
    { dispatch: false }
  );

  constructor(private actions$: Actions, private dialog: MatDialog) {}
}
