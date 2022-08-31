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
import { provideMockStore } from '@ngrx/store/testing';
import { Shipment, Vehicle, Visit, VisitRequest } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromPreSolve from '../../selectors/post-solve.selectors';
import ShipmentRouteSelectors from '../../selectors/shipment-route.selectors';
import VisitRequestSelectors from 'src/app/core/selectors/visit-request.selectors';
import * as fromVisit from '../../selectors/visit.selectors';
import { VisitRequestInfoWindowComponent } from './visit-request-info-window.component';
import { createSelector } from '@ngrx/store';

@Component({
  selector: 'app-base-visit-request-info-window',
  template: '',
})
class MockBaseVisitRequestInfoWindowComponent {
  @Input() shipment: Shipment;
  @Input() visitRequest: VisitRequest;
  @Input() visit?: Visit;
  @Input() vehicle?: Vehicle;
  @Input() timezoneOffset = 0;
  @Input() postSolve = false;
  @Input() navigation = false;
  @Output() shipmentClick = new EventEmitter<Shipment>();
  @Output() vehicleClick = new EventEmitter<Vehicle>();
  @Output() visitClick = new EventEmitter<Visit>();
}

describe('VisitRequestInfoWindowComponent', () => {
  let component: VisitRequestInfoWindowComponent;
  let fixture: ComponentFixture<VisitRequestInfoWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockBaseVisitRequestInfoWindowComponent, VisitRequestInfoWindowComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromVisit.selectVisitState, value: { entities: {}, ids: [] } },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: fromPreSolve.selectActive, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VisitRequestInfoWindowComponent);
    component = fixture.componentInstance;

    spyOn(VisitRequestSelectors, 'selectVisitRequestShipment').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    spyOn(VisitRequestSelectors, 'selectById').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    spyOn(ShipmentRouteSelectors, 'selectVehicleByVisitId').and.returnValue(
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
