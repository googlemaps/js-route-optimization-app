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
import { DocumentationActions } from 'src/app/core/actions';
import { exhaustMap } from 'rxjs/operators';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
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
