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
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { Store } from '@ngrx/store';
import { ShipmentTypeIncompatibilityDialogComponent } from '../../components/shipment-type-incompatibility-dialog/shipment-type-incompatibility-dialog.component';
import { ShipmentTypeRequirementDialogComponent } from '../../components/shipment-type-requirement-dialog/shipment-type-requirement-dialog.component';
import { PrecedenceRulesDialogComponent } from '../../components/precedence-rules-dialog/precedence-rules-dialog.component';
import { TransitionAttributesDialogComponent } from '../../components/transition-attributes-dialog/transition-attributes-dialog.component';
import { ShipmentModelActions } from '../../actions';

@Component({
  selector: 'app-shipment-model-settings',
  templateUrl: './shipment-model-settings.component.html',
  styleUrls: ['./shipment-model-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShipmentModelSettingsComponent {
  @ViewChild('shipmentTypeIncompatibilities')
  shipmentTypeIncompatibilities: ShipmentTypeIncompatibilityDialogComponent;
  @ViewChild('shipmentTypeRequirements')
  shipmentTypeRequirements: ShipmentTypeRequirementDialogComponent;
  @ViewChild('precedenceRules') precedenceRules: PrecedenceRulesDialogComponent;
  @ViewChild('transitionAttributes') transitionAttributes: TransitionAttributesDialogComponent;

  constructor(
    private store: Store,
    private dialogRef: MatDialogRef<ShipmentModelSettingsComponent>
  ) {}

  onSave(): void {
    this.store.dispatch(
      ShipmentModelActions.setShipmentModel({
        shipmentTypeIncompatibilities:
          this.shipmentTypeIncompatibilities.shipmentTypeIncompatibilities,
        shipmentTypeRequirements: this.shipmentTypeRequirements.shipmentTypeRequirements,
        precedenceRules: this.precedenceRules.precedenceRules,
        transitionAttributes: this.transitionAttributes.transitionAttributes,
      })
    );
    this.dialogRef.close();
  }

  canSave(): boolean {
    return (
      this.shipmentTypeIncompatibilities?.form.valid &&
      this.shipmentTypeRequirements?.form.valid &&
      this.precedenceRules?.form.valid &&
      this.transitionAttributes?.form.valid
    );
  }
}
