/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
