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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShipmentTypeIncompatibilityDialogComponent } from './shipment-type-incompatibility-dialog.component';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/shared/shared.module';
import { MaterialModule } from 'src/app/material';
import { provideMockStore } from '@ngrx/store/testing';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import { selectShipmentTypes as selectScenarioShipmentTypes } from '../../../core/selectors/scenario.selectors';

describe('ShipmentTypeIncompatibilityDialogComponent', () => {
  let component: ShipmentTypeIncompatibilityDialogComponent;
  let fixture: ComponentFixture<ShipmentTypeIncompatibilityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule, FormsModule, ReactiveFormsModule],
      declarations: [ShipmentTypeIncompatibilityDialogComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectShipmentTypeIncompatibilities, value: [] },
            { selector: ShipmentSelectors.selectShipmentTypes, value: [] },
            { selector: selectScenarioShipmentTypes, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentTypeIncompatibilityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
