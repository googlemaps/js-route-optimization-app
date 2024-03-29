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

import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { setTimezone } from '../../../core/actions/config.actions';
import { RequestSettingsActions, ShipmentModelActions } from '../../../core/actions';
import { PreSolveGlobalSettingsComponent } from '../pre-solve-global-settings/pre-solve-global-settings.component';
import { PreSolveShipmentModelSettingsComponent } from '../pre-solve-shipment-model-settings/pre-solve-shipment-model-settings.component';
import { combineLatest } from 'rxjs';
import { startWith } from 'rxjs/operators';

@Component({
  selector: 'app-pre-solve-settings',
  templateUrl: './pre-solve-settings.component.html',
  styleUrls: ['./pre-solve-settings.component.scss'],
})
export class PreSolveSettingsComponent implements AfterViewInit {
  @ViewChild(PreSolveGlobalSettingsComponent)
  private globalSettingsComponent: PreSolveGlobalSettingsComponent;
  @ViewChild(PreSolveShipmentModelSettingsComponent)
  private shipmentSettingsComponent: PreSolveShipmentModelSettingsComponent;

  saveDisabled = false;

  constructor(private store: Store) {}

  ngAfterViewInit(): void {
    combineLatest([
      this.globalSettingsComponent.form.statusChanges.pipe(startWith('VALID')),
      this.shipmentSettingsComponent.form.statusChanges.pipe(startWith('VALID')),
    ]).subscribe(([globalSettingsStatus, shipmentSettingsStatus]) => {
      this.saveDisabled = globalSettingsStatus !== 'VALID' || shipmentSettingsStatus !== 'VALID';
    });
  }

  onCancel(): void {
    this.globalSettingsComponent.resetData();
    this.shipmentSettingsComponent.resetData();
  }

  onSave(): void {
    // save global settings
    if (this.globalSettingsComponent.currentTimezone) {
      this.store.dispatch(
        setTimezone({ newTimezone: this.globalSettingsComponent.currentTimezone })
      );
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
  }
}
