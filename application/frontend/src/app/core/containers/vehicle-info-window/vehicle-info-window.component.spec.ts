/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { Vehicle } from '../../models';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { VehicleInfoWindowComponent } from './vehicle-info-window.component';

@Component({
  selector: 'app-base-vehicle-info-window',
  template: '',
})
class MockBaseVehicleInfoWindowComponent {
  @Input() vehicle: Vehicle;
  @Input() shipmentCount?: number;
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
