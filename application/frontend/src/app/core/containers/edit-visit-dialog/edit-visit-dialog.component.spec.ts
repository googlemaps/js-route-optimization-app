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
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { Shipment, Vehicle, Visit, VisitRequest } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromEditVisit from 'src/app/core/selectors/edit-visit.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import { EditVisitDialogComponent } from './edit-visit-dialog.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';

@Component({
  selector: 'app-base-edit-visit-dialog',
  template: '',
})
class MockBaseEditVisitDialogComponent {
  @Input() shipment: Shipment;
  @Input() pickup?: Visit;
  @Input() pickupRequest?: VisitRequest;
  @Input() delivery?: Visit;
  @Input() deliveryRequest?: VisitRequest;
  @Input() vehicles: Vehicle[];
  @Input() disabled = false;
  @Input() timezoneOffset = 0;
  @Input() globalDuration: [Long, Long];
  @Input() savePending: boolean;
  @Input() saveError: boolean;
  @Output() cancel = new EventEmitter<void>();
  @Output() detail = new EventEmitter<{ shipmentId: number }>();
  @Output() save = new EventEmitter<{ visits: Visit[] }>();
}

describe('EditVisitDialogComponent', () => {
  let component: EditVisitDialogComponent;
  let fixture: ComponentFixture<EditVisitDialogComponent>;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<EditVisitDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockBaseEditVisitDialogComponent, EditVisitDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
        provideMockStore({
          selectors: [
            { selector: fromEditVisit.selectVisitShipment, value: null },
            { selector: fromEditVisit.selectVisitPickup, value: null },
            { selector: fromEditVisit.selectVisitPickupRequest, value: null },
            { selector: fromEditVisit.selectVisitDelivery, value: null },
            { selector: fromEditVisit.selectVisitDeliveryRequest, value: null },
            { selector: fromEditVisit.selectCommitChanges, value: null },
            { selector: fromEditVisit.selectSavePending, value: false },
            { selector: fromEditVisit.selectSaveError, value: null },
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: PreSolveVehicleSelectors.selectRequestedVehicles, value: null },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },
          ],
        }),
      ],
    }).compileComponents();

    matDialogRef = TestBed.inject(MatDialogRef) as any;
    const mockMouseEvent = jasmine.createSpyObj('mouseEvent', [
      'stopImmediatePropagation',
    ]) as MouseEvent;
    matDialogRef.backdropClick.and.callFake(() => of(mockMouseEvent));

    fixture = TestBed.createComponent(EditVisitDialogComponent);
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
