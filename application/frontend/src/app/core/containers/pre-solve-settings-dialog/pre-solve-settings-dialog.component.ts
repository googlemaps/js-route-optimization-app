/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Store } from '@ngrx/store';
import { setTimezone } from '../../actions/config.actions';
import { RequestSettingsActions, ShipmentModelActions } from '../../actions';
import { PreSolveGlobalSettingsComponent } from '../pre-solve-global-settings/pre-solve-global-settings.component';
import { PreSolveShipmentModelSettingsComponent } from '../pre-solve-shipment-model-settings/pre-solve-shipment-model-settings.component';
import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-pre-solve-settings-dialog',
  templateUrl: './pre-solve-settings-dialog.component.html',
  styleUrls: ['./pre-solve-settings-dialog.component.scss'],
})
export class PreSolveSettingsDialogComponent implements AfterViewInit {
  @ViewChild(PreSolveGlobalSettingsComponent)
  private globalSettingsComponent: PreSolveGlobalSettingsComponent;
  @ViewChild(PreSolveShipmentModelSettingsComponent)
  private shipmentSettingsComponent: PreSolveShipmentModelSettingsComponent;

  saveDisabled = false;

  constructor(
    private dialogRef: MatDialogRef<PreSolveSettingsDialogComponent>,
    private store: Store
  ) {}

  ngAfterViewInit(): void {
    combineLatest([
      this.globalSettingsComponent.form.statusChanges.pipe(startWith('VALID')),
      this.shipmentSettingsComponent.form.statusChanges.pipe(startWith('VALID')),
    ]).subscribe(([globalSettingsStatus, shipmentSettingsStatus]) => {
      this.saveDisabled = globalSettingsStatus !== 'VALID' || shipmentSettingsStatus !== 'VALID';
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // save global settings
    if (this.globalSettingsComponent.newTimeZone) {
      this.store.dispatch(setTimezone({ newTimezone: this.globalSettingsComponent.newTimeZone }));
    }
    this.store.dispatch(
      RequestSettingsActions.setRequestSettings(this.globalSettingsComponent.globalSettings)
    );
    this.store.dispatch(
      RequestSettingsActions.setGlobalConstraints({
        constraints: this.globalSettingsComponent.updatedTimeThresholds,
      })
    );
    // save shipment settings
    this.store.dispatch(
      ShipmentModelActions.setShipmentModel(
        this.shipmentSettingsComponent.updatedShipmentModelSettings
      )
    );
    this.dialogRef.close();
  }
}
