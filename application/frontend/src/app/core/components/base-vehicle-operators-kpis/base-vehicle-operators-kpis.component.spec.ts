/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseVehicleOperatorsKpisComponent } from './base-vehicle-operators-kpis.component';

describe('BaseVehicleOperatorsKpisComponent', () => {
  let component: BaseVehicleOperatorsKpisComponent;
  let fixture: ComponentFixture<BaseVehicleOperatorsKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseVehicleOperatorsKpisComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseVehicleOperatorsKpisComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
