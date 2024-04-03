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
