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
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { ShipmentRoute, Vehicle } from '../../models';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import * as fromShipmentRoute from '../../selectors/shipment-route.selectors';
import { VehicleInfoWindowComponent } from './vehicle-info-window.component';
import * as fromConfig from '../../selectors/config.selectors';

@Component({
  selector: 'app-base-vehicle-info-window',
  template: '',
})
class MockBaseVehicleInfoWindowComponent {
  @Input() vehicle: Vehicle;
  @Input() shipmentCount?: number;
  @Input() route: ShipmentRoute;
  @Input() timezoneOffset = 0;
  @Input() navigation = false;
  @Output() vehicleClick = new EventEmitter<Vehicle>();
}

describe('VehicleInfoWindowComponent', () => {
  let component: VehicleInfoWindowComponent;
  let fixture: ComponentFixture<VehicleInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockBaseVehicleInfoWindowComponent, VehicleInfoWindowComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },
            {
              selector: fromShipmentRoute.selectShipmentRouteState,
              value: { entities: {}, ids: [] },
            },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleInfoWindowComponent);
    component = fixture.componentInstance;

    spyOn(ShipmentRouteSelectors, 'selectRouteShipmentCount').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
