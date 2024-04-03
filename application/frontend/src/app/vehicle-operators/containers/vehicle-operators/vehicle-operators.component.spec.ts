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
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { VehicleOperator } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveVehicleOperatorSelectors from 'src/app/core/selectors/pre-solve-vehicle-operator.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromVehicleOperator from 'src/app/core/selectors/vehicle-operator.selectors';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { VehicleOperatorsComponent } from './vehicle-operators.component';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';

@Component({
  selector: 'app-base-vehicle-operators-table',
  template: '',
})
class MockBaseVehicleOperatorsTableComponent {
  @Input() dataSource: DataSource<VehicleOperator>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [vehicleOperatorId: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() totalItems = 0;
  @Input() changeDisabled = false;
  @Output() add = new EventEmitter();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() editVehicleOperator = new EventEmitter<number>();
  @Output() deleteVehicleOperator = new EventEmitter<VehicleOperator>();
  @Input() timezoneOffset = 0;
}

describe('VehicleOperatorsComponent', () => {
  let component: VehicleOperatorsComponent;
  let fixture: ComponentFixture<VehicleOperatorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockBaseVehicleOperatorsTableComponent, VehicleOperatorsComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleOperatorSelectors.selectPagedVehicleOperators, value: [] },
            { selector: PreSolveVehicleOperatorSelectors.selectSort, value: {} },
            {
              selector:
                PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperatorsSelectedLookup,
              value: {},
            },
            { selector: PreSolveVehicleOperatorSelectors.selectColumnsToDisplay, value: [] },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: [] },
            {
              selector: fromVehicleOperator.selectVehicleOperatorState,
              value: { entities: {}, ids: [] },
            },
            { selector: PreSolveVehicleOperatorSelectors.selectTotalFiltered, value: 0 },
            { selector: PreSolveVehicleOperatorSelectors.selectPageIndex, value: 0 },
            { selector: PreSolveVehicleOperatorSelectors.selectPageSize, value: 10 },
            { selector: fromScenario.selectChangeDisabled, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehicleOperatorsComponent);
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
