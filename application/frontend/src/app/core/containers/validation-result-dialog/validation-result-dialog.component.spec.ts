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
