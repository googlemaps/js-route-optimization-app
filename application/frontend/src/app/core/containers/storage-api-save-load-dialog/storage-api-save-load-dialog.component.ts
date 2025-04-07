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

import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { select, Store } from '@ngrx/store';
import { map, take } from 'rxjs/operators';
import * as fromDownload from 'src/app/core/selectors/download.selectors';
import { OptimizeToursRequest, OptimizeToursResponse } from 'src/app/core/models';
import { DispatcherService } from '../../services';
import { Page, Scenario, Solution } from '../../models';
import { Observable } from 'rxjs';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import { selectScenarioName } from '../../selectors/dispatcher.selectors';

@Component({
  selector: 'app-storage-api-save-load-dialog',
  templateUrl: './storage-api-save-load-dialog.component.html',
  styleUrls: ['./storage-api-save-load-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StorageApiSaveLoadDialogComponent implements OnInit {
  @Input() saving = false;

  onSolutionPage$: Observable<boolean>;
  scenario: OptimizeToursRequest;
  solution: OptimizeToursResponse;
  scenarioName: string;

  constructor(
    private dialogRef: MatDialogRef<StorageApiSaveLoadDialogComponent>,
    private dispatcherService: DispatcherService,
    private store: Store
  ) {}

  ngOnInit(): void {
    this.onSolutionPage$ = this.store.pipe(
      select(fromUI.selectPage),
      take(1),
      map(
        (page) => [Page.RoutesChart, Page.RoutesMetadata, Page.ShipmentsMetadata].indexOf(page) >= 0
      )
    );

    this.store
      .select(fromDownload.selectDownload)
      .pipe(take(1))
      .subscribe((res) => {
        if (!res) {
          return;
        }
        this.scenario = OptimizeToursRequest.fromObject(res.scenario);
        if (res.solution) {
          this.solution = OptimizeToursResponse.fromObject(res.solution);
        }
      });

    this.store
      .select(selectScenarioName)
      .pipe(take(1))
      .subscribe((res) => (this.scenarioName = res));
  }

  loadScenario(content: { scenario: Scenario; scenarioName: string }): void {
    this.dialogRef.close({
      scenario: this.dispatcherService.objectToScenario(content.scenario),
      scenarioName: content.scenarioName,
    });
  }

  loadSolution(content: { scenario: Scenario; solution: Solution; scenarioName: string }): void {
    this.dialogRef.close({
      scenario: this.dispatcherService.objectToScenario(content.scenario),
      solution: this.dispatcherService.objectToSolution(content.solution, { json: true }),
      scenarioName: content.scenarioName,
    });
  }
}
