/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-overwrite',
  templateUrl: './confirm-overwrite-dialog.component.html',
  styleUrls: ['./confirm-overwrite-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmOverwriteDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { filename: string }) {}
}
