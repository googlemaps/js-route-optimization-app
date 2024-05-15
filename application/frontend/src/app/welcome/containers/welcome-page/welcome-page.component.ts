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

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DocumentationActions, StorageApiActions } from 'src/app/core/actions';
import { selectHasStorageApiRoot } from 'src/app/core/selectors/config.selectors';
import { State } from 'src/app/reducers';
import { WelcomePageActions } from '../../actions';
import * as fromConfig from 'src/app/core/selectors/config.selectors';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomePageComponent implements OnInit {
  allowUserStorage$: Observable<boolean>;
  hasStorageApi$: Observable<boolean>;

  constructor(private store: Store<State>) {
    store.dispatch(WelcomePageActions.initialize());
  }

  ngOnInit(): void {
    this.hasStorageApi$ = this.store.pipe(select(selectHasStorageApiRoot));
    this.allowUserStorage$ = this.store.pipe(select(fromConfig.selectAllowUserStorage));
  }

  upload(): void {
    this.store.dispatch(WelcomePageActions.openUploadDialog());
  }

  newScenario(): void {
    this.store.dispatch(WelcomePageActions.newScenario());
  }

  loadFromStorage(): void {
    this.store.dispatch(StorageApiActions.openLoadDialog());
  }

  onHelp(): void {
    this.store.dispatch(DocumentationActions.open());
  }
}
