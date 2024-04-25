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
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Store, select } from '@ngrx/store';
import { Observable } from 'rxjs';
import { UndoRedoActions } from 'src/app/core/actions';
import * as fromUndoRedo from 'src/app/core/selectors/undo-redo.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';

@Component({
  selector: 'app-undo-redo',
  templateUrl: './undo-redo.component.html',
  styleUrls: ['./undo-redo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UndoRedoComponent implements OnInit {
  disabled$: Observable<boolean>;
  canUndo$: Observable<boolean>;
  canRedo$: Observable<boolean>;

  constructor(private store: Store) {}

  ngOnInit(): void {
    this.disabled$ = this.store.pipe(select(fromScenario.selectChangeDisabled));
    this.canUndo$ = this.store.pipe(select(fromUndoRedo.selectCanUndo));
    this.canRedo$ = this.store.pipe(select(fromUndoRedo.selectCanRedo));
  }

  onUndo(): void {
    this.store.dispatch(UndoRedoActions.undo());
  }

  onRedo(): void {
    this.store.dispatch(UndoRedoActions.redo());
  }
}
