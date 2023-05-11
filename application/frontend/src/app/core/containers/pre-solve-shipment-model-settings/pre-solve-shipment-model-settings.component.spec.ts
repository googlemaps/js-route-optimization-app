/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
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
  template: ''
})
class MockAppDurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: FormGroup;
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
