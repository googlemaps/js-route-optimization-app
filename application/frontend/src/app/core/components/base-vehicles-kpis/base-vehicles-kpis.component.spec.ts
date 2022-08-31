/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseVehiclesKpisComponent } from './base-vehicles-kpis.component';

describe('BaseVehiclesKpisComponent', () => {
  let component: BaseVehiclesKpisComponent;
  let fixture: ComponentFixture<BaseVehiclesKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseVehiclesKpisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseVehiclesKpisComponent);
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
