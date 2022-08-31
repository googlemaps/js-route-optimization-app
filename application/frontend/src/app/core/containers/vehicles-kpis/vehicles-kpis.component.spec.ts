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
