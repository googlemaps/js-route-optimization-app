/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { animate, state, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { EXPANSION_PANEL_ANIMATION_TIMING } from '@angular/material/expansion';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import { State } from 'src/app/reducers';
import { UndoRedoActions, RequestSettingsActions } from '../../actions';
import { toggleMap } from '../../actions/map.actions';
import { Page } from '../../models';
import * as fromUndoRedo from '../../selectors/undo-redo.selectors';

@Component({
  selector: 'app-pre-solve-control-bar',
  templateUrl: './pre-solve-control-bar.component.html',
  styleUrls: ['./pre-solve-control-bar.component.scss'],
  animations: [
    trigger('indicatorRotate', [
      state('expanded', style({ transform: 'rotate(180deg)' })),
      state('collapsed', style({ transform: 'rotate(0deg)' })),
      transition('expanded <=> collapsed, void => collapsed', [
        animate(EXPANSION_PANEL_ANIMATION_TIMING),
      ]),
    ]),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PreSolveControlBarComponent implements OnInit {
  disabled$: Observable<boolean>;
  page$: Observable<Page>;
  canUndo$: Observable<boolean>;
  canRedo$: Observable<boolean>;

  get Page(): typeof Page {
    return Page;
  }

  constructor(private store: Store<State>) {}

  ngOnInit(): void {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.page$ = this.store.pipe(select(fromUI.selectPage));
    this.canUndo$ = this.store.pipe(select(fromUndoRedo.selectCanUndo));
    this.canRedo$ = this.store.pipe(select(fromUndoRedo.selectCanRedo));
  }

  onToggleMap(): void {
    this.store.dispatch(toggleMap());
  }

  onUndo(): void {
    this.store.dispatch(UndoRedoActions.undo());
  }

  onRedo(): void {
    this.store.dispatch(UndoRedoActions.redo());
  }

  openSettings(): void {
    this.store.dispatch(RequestSettingsActions.editSettings());
  }
}
