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
import { VehiclesKpis } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';
import { VehiclesKpisComponent } from './vehicles-kpis.component';

@Component({
  selector: 'app-base-vehicles-kpis',
  template: '',
})
class MockBaseVehiclesKpisComponent {
  @Input() vehiclesKpis: VehiclesKpis;
  @Input() unitAbbreviations: { [unit: string]: string };
}

describe('VehiclesKpisComponent', () => {
  let component: VehiclesKpisComponent;
  let fixture: ComponentFixture<VehiclesKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleSelectors.selectVehiclesKpis, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
          ],
        }),
      ],
      declarations: [MockBaseVehiclesKpisComponent, VehiclesKpisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesKpisComponent);
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
