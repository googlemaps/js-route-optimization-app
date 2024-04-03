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

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-scenario-solution-help-dialog',
  templateUrl: './scenario-solution-help-dialog.component.html',
  styleUrls: ['./scenario-solution-help-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScenarioSolutionHelpDialogComponent {
  constructor(private dialogRef: MatDialogRef<ScenarioSolutionHelpDialogComponent>) {}

  cancel(): void {
    this.dialogRef.close();
  }
}
