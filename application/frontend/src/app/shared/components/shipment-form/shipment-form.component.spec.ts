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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { ShipmentFormComponent } from './shipment-form.component';
import { ErrorStateMatcher } from '@angular/material/core';

@Component({
  selector: 'app-load-demands-form',
  template: '',
})
class MockCapacityQuantityFormComponent {
  @Input() abbreviations: { [unit: string]: string };
  @Input() appearance: string;
  @Input() disabled = false;
  @Input() scenarioCapacities: Set<string>;
  @Input() scenarioDemands: Set<string>;
}

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

describe('ShipmentFormComponent', () => {
  let component: ShipmentFormComponent;
  let fixture: ComponentFixture<ShipmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [
        MockCapacityQuantityFormComponent,
        ShipmentFormComponent,
        MockAppDurationMinSecFormComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should export costsPerVehicle, costsPerVehicleIndices', () => {
    // test that costs and vehicle indices are exported correctly
    // from the ids of the vehicles stored in the mapping array
    component.vehicles = {
      1: { id: 1 },
      2: { id: 2 },
      3: { id: 3 },
      4: { id: 4 },
      5: { id: 5 },
      6: { id: 6 },
      7: { id: 7 },
      8: { id: 8 },
      9: { id: 9 },
      10: { id: 10 },
    };
    component.vehicleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    component.costsPerVehicleMap = [
      [5, [{ id: 2 }, { id: 3 }, { id: 4 }]],
      [10, [{ id: 8 }, { id: 9 }]],
    ];

    const costs = component.costsPerVehicle;
    const indices = component.costsPerVehicleIndices;

    expect(costs).toEqual([5, 5, 5, 10, 10]);
    expect(indices).toEqual([1, 2, 3, 7, 8]); // map vehicle IDs to indices
  });

  it('should export undefined when costsPerVehicleMap is empty', () => {
    // test that costs and vehicle indices are exported correctly
    // from the ids of the vehicles stored in the mapping array
    component.vehicles = {
      1: { id: 1 },
      2: { id: 2 },
      3: { id: 3 },
      4: { id: 4 },
      5: { id: 5 },
      6: { id: 6 },
      7: { id: 7 },
      8: { id: 8 },
      9: { id: 9 },
      10: { id: 10 },
    };
    component.vehicleIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    component.costsPerVehicleMap = [];

    const costs = component.costsPerVehicle;
    const indices = component.costsPerVehicleIndices;

    expect(costs).toBeUndefined();
    expect(indices).toBeUndefined();
  });
});
