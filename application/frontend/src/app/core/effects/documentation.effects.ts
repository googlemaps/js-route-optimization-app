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
import { DocumentationActions } from 'src/app/core/actions';
import { exhaustMap } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { DocumentationDialogComponent } from '../containers';
import { Modal } from '../models';

@Injectable()
export class DocumentationEffects {
  openDocumentation$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(DocumentationActions.open),
        exhaustMap(() => {
          const dialogRef = this.dialog.open(DocumentationDialogComponent, {
            id: Modal.Documentation,
            maxHeight: '100%',
            maxWidth: '1000px',
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
