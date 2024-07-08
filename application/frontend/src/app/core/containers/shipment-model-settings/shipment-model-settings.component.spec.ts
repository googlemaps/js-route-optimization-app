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
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ShipmentModelSettingsComponent } from './shipment-model-settings.component';
import { provideMockStore } from '@ngrx/store/testing';
import { Component } from '@angular/core';
import { MaterialModule } from 'src/app/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

@Component({
  selector: 'app-shipment-type-incompatibility-dialog',
  template: '',
})
class MockShipmentTypeIncompatibilityDialogComponent {
  shipmentTypeIncompatibilities = [];
  form = {
    valid: true,
  };
  shipmentTypeIncompatsControl = { value: [] };
}

@Component({
  selector: 'app-shipment-type-requirement-dialog',
  template: '',
})
class MockShipmentTypeRequirementsDialogComponent {
  shipmentTypeReqsControl = { value: [] };
  shipmentTypeRequirements = [];
  form = { valid: true };
}

@Component({
  selector: 'app-precedence-rules-dialog',
  template: '',
})
class MockPrecedenceRulesDialogComponent {
  precedenceRules = [];
  form = { valid: true };
  precedenceRulesControl = { controls: [] };
}

@Component({
  selector: 'app-transition-attributes-dialog',
  template: '',
})
class MockTransitionAttributesDialogComponent {
  transitionAttributes = [];
  form = { valid: true };
  transitionAttributesControl = { controls: [] };
}

describe('ShipmentModelSettingsComponent', () => {
  let component: ShipmentModelSettingsComponent;
  let fixture: ComponentFixture<ShipmentModelSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [
        ShipmentModelSettingsComponent,
        MockShipmentTypeIncompatibilityDialogComponent,
        MockShipmentTypeRequirementsDialogComponent,
        MockPrecedenceRulesDialogComponent,
        MockTransitionAttributesDialogComponent,
      ],
      providers: [
        provideMockStore(),
        {
          provide: MatDialog,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
        { provide: MatDialogRef, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentModelSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
