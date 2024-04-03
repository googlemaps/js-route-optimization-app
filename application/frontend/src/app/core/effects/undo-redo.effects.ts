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
