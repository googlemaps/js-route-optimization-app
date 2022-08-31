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
import { Store } from '@ngrx/store';
import { MainNavActions } from '../../actions';
import { MapService, VehicleLayer } from '../../services';

@Component({
  selector: 'app-regenerate-confirmation-dialog',
  templateUrl: './regenerate-confirmation-dialog.component.html',
  styleUrls: ['./regenerate-confirmation-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [MapService, VehicleLayer],
})
export class RegenerateConfirmationDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<RegenerateConfirmationDialogComponent>,
    private store: Store
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.store.dispatch(MainNavActions.solve());
    this.dialogRef.close();
  }
}
