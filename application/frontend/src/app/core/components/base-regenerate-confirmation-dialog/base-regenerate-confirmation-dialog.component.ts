/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-base-regenerate-confirmation-dialog',
  templateUrl: './base-regenerate-confirmation-dialog.component.html',
  styleUrls: ['./base-regenerate-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseRegenerateConfirmationDialogComponent {
  @Output() cancel = new EventEmitter();
  @Output() confirm = new EventEmitter();
}
