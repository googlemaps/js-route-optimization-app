/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
  @Input() vehicleOperatorsKpis: VehicleOperatorsKpis;
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
