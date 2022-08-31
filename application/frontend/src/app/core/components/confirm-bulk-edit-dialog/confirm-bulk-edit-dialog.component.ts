/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-bulk-edit-dialog',
  templateUrl: './confirm-bulk-edit-dialog.component.html',
  styleUrls: ['./confirm-bulk-edit-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmBulkEditDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { fields: string[] }) {}
}
