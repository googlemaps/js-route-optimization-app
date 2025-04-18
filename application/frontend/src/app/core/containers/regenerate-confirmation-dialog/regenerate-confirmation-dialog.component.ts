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
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
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
