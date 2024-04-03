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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { MaterialModule } from 'src/app/material';
import { VehicleOperator } from '../../models';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import * as fromVehicleOperator from '../../selectors/vehicle-operator.selectors';
import { PreSolveEditVehicleOperatorDialogComponent } from './pre-solve-edit-vehicle-operator-dialog.component';

@Component({
  selector: 'app-base-edit-vehicle-operator-dialog',
  template: '',
})
class MockBaseEditVehicleOperatorDialogComponent {
  @Input() bulkEdit: boolean;
  @Input() bulkNumber: number;
  @Input() timezoneOffset?: number;
  @Input() vehicleOperator: VehicleOperator;
  @Input() disabled: boolean;
  @Input() nextOperatorId: number;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ vehicleOperator: VehicleOperator }>();
}

describe('PreSolveEditVehicleOperatorDialogComponent', () => {
  let component: PreSolveEditVehicleOperatorDialogComponent;
  let fixture: ComponentFixture<PreSolveEditVehicleOperatorDialogComponent>;
  let _matDialogRef: jasmine.SpyObj<MatDialogRef<PreSolveEditVehicleOperatorDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [
        MockBaseEditVehicleOperatorDialogComponent,
        PreSolveEditVehicleOperatorDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('matDialogRef', ['close']) },
        provideMockStore({
          selectors: [
            { selector: selectTimezoneOffset, value: 0 },
            {
              selector: fromVehicleOperator.selectVehicleOperatorState,
              value: { entities: {}, ids: [] },
            },
            { selector: fromVehicleOperator.selectNextVehicleOperatorId, value: 0 },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
          ],
        }),
      ],
    }).compileComponents();
    _matDialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(PreSolveEditVehicleOperatorDialogComponent);
    component = fixture.componentInstance;
    component.vehicleOperatorIds = [];
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
