/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Actions } from '@ngrx/effects';
import { provideMockActions } from '@ngrx/effects/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { Observable } from 'rxjs';
import * as fromUndoRedo from '../selectors/undo-redo.selectors';
import { UndoRedoEffects } from './undo-redo.effects';

describe('UndoRedoEffects', () => {
  let actions$: Observable<any>;
  let effects: UndoRedoEffects;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        UndoRedoEffects,
        provideMockStore({
          selectors: [
            { selector: fromUndoRedo.selectUndo, value: [] },
            { selector: fromUndoRedo.selectRedo, value: [] },
          ],
        }),
        provideMockActions(() => actions$),
      ],
    });

    effects = TestBed.inject(UndoRedoEffects);
    actions$ = TestBed.inject(Actions);
  });

  it('should be created', () => {
    expect(effects).toBeTruthy();
  });
});
