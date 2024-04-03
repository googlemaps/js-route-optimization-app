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
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { PreSolveShipmentModelSettingsComponent } from './pre-solve-shipment-model-settings.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-duration-min-sec-form',
  template: '',
})
class MockAppDurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: UntypedFormGroup;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() labelName: string;
  @Input() showUnset: boolean;
  @Input() isUnset: boolean;
  @Input() fieldName: string;
  @Output() unsetEvent = new EventEmitter<{ field: string }>();
}

describe('PreSolveShipmentModelSettingsComponent', () => {
  let component: PreSolveShipmentModelSettingsComponent;
  let fixture: ComponentFixture<PreSolveShipmentModelSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      declarations: [PreSolveShipmentModelSettingsComponent, MockAppDurationMinSecFormComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectGlobalDurationCostPerHour, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalEndTime, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalStartTime, value: 0 },
            { selector: ShipmentModelSelectors.selectMaxActiveVehicles, value: 0 },
            { selector: ShipmentModelSelectors.selectPrecedenceRules, value: null },
            { selector: ShipmentModelSelectors.selectShipmentTypeIncompatibilities, value: null },
            { selector: ShipmentModelSelectors.selectShipmentTypeRequirements, value: null },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(PreSolveShipmentModelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
