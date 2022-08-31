/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseVehicleOperatorsTableComponent } from './base-vehicle-operators-table.component';

describe('BaseVehicleOperatorsTableComponent', () => {
  let component: BaseVehicleOperatorsTableComponent;
  let fixture: ComponentFixture<BaseVehicleOperatorsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseVehicleOperatorsTableComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseVehicleOperatorsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
