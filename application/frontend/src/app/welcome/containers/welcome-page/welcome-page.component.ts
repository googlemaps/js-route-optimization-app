/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { DocumentationActions, StorageApiActions, UploadActions } from 'src/app/core/actions';
import { selectHasStorageApiRoot } from 'src/app/core/selectors/config.selectors';
import { State } from 'src/app/reducers';
import { WelcomePageActions } from '../../actions';
import * as fromConfig from 'src/app/core/selectors/config.selectors';

@Component({
  selector: 'app-welcome-page',
  templateUrl: './welcome-page.component.html',
  styleUrls: ['./welcome-page.component.css'],
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

  loadFromCsv(): void {
    this.store.dispatch(UploadActions.openCsvDialog());
  }

  onHelp(): void {
    this.store.dispatch(DocumentationActions.open());
  }
}
