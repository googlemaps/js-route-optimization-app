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
