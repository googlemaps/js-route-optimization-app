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
import { BaseValidationResultDialogComponent } from '../../components';
import { Shipment, Vehicle } from '../../models';
import * as fromShipment from '../../selectors/shipment.selectors';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import { ValidationService } from '../../services';
import { ValidationResultDialogComponent } from './validation-result-dialog.component';

@Component({
  selector: 'app-base-validation-result-dialog',
  template: '',
})
class MockBaseValidationResultDialogComponent {
  @Input() allowedVehicleWarnings: Shipment[];
  @Input() shipmentTimeRangeWarnings: Shipment[];
  @Input() vehicleTimeRangeWarnings: Vehicle[];
  @Output() cancel = new EventEmitter<void>();
  @Output() ok = new EventEmitter<void>();
  @Output() editShipment = new EventEmitter<Shipment>();
  @Output() editVehicle = new EventEmitter<Vehicle>();
}

describe('ValidationResultDialogComponent', () => {
  let component: ValidationResultDialogComponent;
  let fixture: ComponentFixture<ValidationResultDialogComponent>;
  let _dialogRef: jasmine.SpyObj<MatDialogRef<BaseValidationResultDialogComponent>>;
  let _validationService: jasmine.SpyObj<ValidationService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('matDialogRef', ['close']) },
        {
          provide: ValidationService,
          useValue: jasmine.createSpyObj('validationService', ['getErrorEntityIds']),
        },
        provideMockStore({
          selectors: [
            { selector: fromShipment.selectShipmentState, value: { entities: {}, ids: [] } },
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },
          ],
        }),
      ],
      declarations: [MockBaseValidationResultDialogComponent, ValidationResultDialogComponent],
    }).compileComponents();

    _dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<
      MatDialogRef<BaseValidationResultDialogComponent>
    >;
    _validationService = TestBed.inject(ValidationService) as jasmine.SpyObj<ValidationService>;

    fixture = TestBed.createComponent(ValidationResultDialogComponent);
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
