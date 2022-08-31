/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { select, Store } from '@ngrx/store';
import { concatMap, filter, map, take, tap } from 'rxjs/operators';
import * as UndoRedoActions from '../actions/undo-redo.actions';
import { Page } from '../models';
import * as fromUndoRedo from '../selectors/undo-redo.selectors';

@Injectable()
export class UndoRedoEffects {
  navigateAfterUndo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UndoRedoActions.undo),
      concatMap(() =>
        this.store.pipe(
          select(fromUndoRedo.selectRedo),
          take(1),
          // Current undo is now the first redo
          map((redo) => redo[0]),
          filter((currentUndo) => currentUndo != null),
          map(({ undoPage }) => undoPage),
          tap((page) => {
            const url = '/' + page !== Page.Welcome ? page : '';
            this.router.navigateByUrl(url, { skipLocationChange: true });
          }),
          map((page) => UndoRedoActions.changePage({ page }))
        )
      )
    );
  });

  navigateAfterRedo$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(UndoRedoActions.redo),
      concatMap(() =>
        this.store.pipe(
          select(fromUndoRedo.selectUndo),
          take(1),
          // Current redo is now the last undo
          map((undo) => undo[undo.length - 1]),
          filter((currentRedo) => currentRedo != null),
          map(({ undoPage, redoPage }) => redoPage ?? undoPage),
          tap((page) => {
            const url = '/' + page !== Page.Welcome ? page : '';
            this.router.navigateByUrl(url, { skipLocationChange: true });
          }),
          map((page) => UndoRedoActions.changePage({ page }))
        )
      )
    );
  });

  constructor(private actions$: Actions, private router: Router, private store: Store) {}
}
