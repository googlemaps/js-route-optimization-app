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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { VehicleOperatorsKpis } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import PreSolveVehicleOperatorSelectors from '../../selectors/pre-solve-vehicle-operator.selectors';
import { VehicleOperatorsKpisComponent } from './vehicle-operators-kpis.component';

@Component({
  selector: 'app-base-vehicle-operators-kpis',
  template: '',
})
class MockBaseVehicleOperatorsKpisComponent {
  @Input() vehicleOperatorKpis: VehicleOperatorsKpis;
  @Input() unitAbbreviations: { [unit: string]: string };
}

describe('VehicleOperatorsKpisComponent', () => {
  let component: VehicleOperatorsKpisComponent;
  let fixture: ComponentFixture<VehicleOperatorsKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleOperatorSelectors.selectVehicleOperatorsKpis, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
          ],
        }),
      ],
      declarations: [MockBaseVehicleOperatorsKpisComponent, VehicleOperatorsKpisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleOperatorsKpisComponent);
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
