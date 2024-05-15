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
