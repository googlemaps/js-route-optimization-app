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

import { ShipmentTypeRequirementDialogComponent } from './shipment-type-requirement-dialog.component';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import ShipmentSelectors from '../../selectors/shipment.selectors';
import { selectShipmentTypes as selectScenarioShipmentTypes } from '../../../core/selectors/scenario.selectors';

describe('ShipmentTypeRequirementDialogComponent', () => {
  let component: ShipmentTypeRequirementDialogComponent;
  let fixture: ComponentFixture<ShipmentTypeRequirementDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule, FormsModule, ReactiveFormsModule],
      declarations: [ShipmentTypeRequirementDialogComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectShipmentTypeRequirements, value: [] },
            { selector: ShipmentSelectors.selectShipmentTypes, value: [] },
            { selector: selectScenarioShipmentTypes, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentTypeRequirementDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
