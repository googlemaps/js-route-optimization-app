/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as fromRoot from 'src/app/reducers';
import {
  DocumentationActions,
  DownloadActions,
  StorageApiActions,
  UploadActions,
} from '../../actions';
import * as fromDownload from '../../selectors/download.selectors';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';

@Component({
  selector: 'app-main-actions',
  templateUrl: './main-actions.component.html',
  styleUrls: ['./main-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainActionsComponent implements OnInit {
  allowUserStorage$: Observable<boolean>;
  hasDownload$: Observable<boolean>;
  hasSolution$: Observable<boolean>;
  hasStorageApi$: Observable<boolean>;

  constructor(private store: Store<fromRoot.State>) {}

  ngOnInit(): void {
    this.hasDownload$ = this.store.pipe(select(fromDownload.selectHasDownload));
    this.hasStorageApi$ = this.store.pipe(select(fromConfig.selectHasStorageApiRoot));
    this.hasSolution$ = this.store.pipe(select(fromSolution.selectHasSolution));
    this.allowUserStorage$ = this.store.pipe(select(fromConfig.selectAllowUserStorage));
  }

  onDownload(): void {
    this.store.dispatch(DownloadActions.download());
  }

  onUpload(): void {
    this.store.dispatch(UploadActions.openDialog());
  }

  onLoad(): void {
    this.store.dispatch(StorageApiActions.openLoadDialog());
  }

  onSave(): void {
    this.store.dispatch(StorageApiActions.openSaveDialog());
  }

  onCsvUpload(): void {
    this.store.dispatch(UploadActions.openCsvDialog());
  }

  onCSVDownload(): void {
    this.store.dispatch(DownloadActions.downloadCSV());
  }

  onPDFDownload(): void {
    this.store.dispatch(DownloadActions.downloadPDF());
  }

  onHelp(): void {
    this.store.dispatch(DocumentationActions.open());
  }
}
