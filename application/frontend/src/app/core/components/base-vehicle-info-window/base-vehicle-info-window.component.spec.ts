/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from 'src/app/shared/shared.module';
import { BaseVehicleInfoWindowComponent } from './base-vehicle-info-window.component';

describe('BaseVehicleInfoWindowComponent', () => {
  let component: BaseVehicleInfoWindowComponent;
  let fixture: ComponentFixture<BaseVehicleInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, SharedModule],
      declarations: [BaseVehicleInfoWindowComponent],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BaseVehicleInfoWindowComponent);
        component = fixture.componentInstance;
        component.vehicle = { id: 1 };
        component.shipmentCount = 0;

        fixture.detectChanges();
      });
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
