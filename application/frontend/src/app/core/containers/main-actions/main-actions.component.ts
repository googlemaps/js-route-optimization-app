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

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
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
import { Page } from '../../models';
import { selectPage } from '../../selectors/ui.selectors';
import { CdkAccordionItem } from '@angular/cdk/accordion';

@Component({
  selector: 'app-main-actions',
  templateUrl: './main-actions.component.html',
  styleUrls: ['./main-actions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainActionsComponent implements OnInit, AfterViewInit {
  @ViewChild('accordionItem2') accordion: CdkAccordionItem;
  allowUserStorage$: Observable<boolean>;
  hasDownload$: Observable<boolean>;
  hasSolution$: Observable<boolean>;
  hasStorageApi$: Observable<boolean>;
  page: Page;

  constructor(private store: Store<fromRoot.State>, private detectorRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.hasDownload$ = this.store.pipe(select(fromDownload.selectHasDownload));
    this.hasStorageApi$ = this.store.pipe(select(fromConfig.selectHasStorageApiRoot));
    this.hasSolution$ = this.store.pipe(select(fromSolution.selectHasSolution));
    this.allowUserStorage$ = this.store.pipe(select(fromConfig.selectAllowUserStorage));
  }

  ngAfterViewInit(): void {
    this.store.pipe(select(selectPage)).subscribe((page) => {
      const wasPostSolve = this.isPostSolve();
      this.page = page;

      if (this.isPostSolve() && !wasPostSolve) {
        this.accordion.open();
        this.detectorRef.detectChanges();
      }
    });
  }

  isPostSolve(): boolean {
    return (
      this.page === Page.RoutesChart ||
      this.page === Page.RoutesMetadata ||
      this.page === Page.ShipmentsMetadata
    );
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
    this.store.dispatch(UploadActions.openCsvDialog({}));
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
