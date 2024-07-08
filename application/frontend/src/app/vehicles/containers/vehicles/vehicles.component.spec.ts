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
import { Vehicle } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromVehicle from 'src/app/core/selectors/vehicle.selectors';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { VehiclesComponent } from './vehicles.component';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';

@Component({
  selector: 'app-base-vehicles-table',
  template: '',
})
class MockBaseVehiclesTableComponent {
  @Input() dataSource: DataSource<Vehicle>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [vehicleId: number]: boolean } = {};
  @Input() itemsDisabled: { [vehicleId: number]: boolean } = {};
  @Input() capacityTypes: string[];
  @Input() columnsToDisplay: string[];
  @Input() totalItems = 0;
  @Input() duration: [Long, Long];
  @Input() relativeTo: Long;
  @Input() unitAbbreviations: { [unit: string]: string };
  @Input() changeDisabled = false;
  @Input() showBulkEdit: boolean;
  @Input() showBulkDelete: boolean;
  @Input() shipmentCount: number;
  @Output() bulkEdit = new EventEmitter();
  @Output() bulkDelete = new EventEmitter();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() editVehicle = new EventEmitter<number>();
  @Output() deleteVehicle = new EventEmitter<Vehicle>();
}

describe('VehiclesComponent', () => {
  let component: VehiclesComponent;
  let fixture: ComponentFixture<VehiclesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockBaseVehiclesTableComponent, VehiclesComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleSelectors.selectPagedVehicles, value: [] },
            { selector: PreSolveVehicleSelectors.selectSort, value: {} },
            { selector: PreSolveVehicleSelectors.selectFilteredVehiclesSelectedLookup, value: {} },
            { selector: PreSolveVehicleSelectors.selectCapacityTypes, value: [] },
            { selector: PreSolveVehicleSelectors.selectColumnsToDisplay, value: [] },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: [] },
            { selector: fromVehicle.selectVehicleState, value: { entities: {}, ids: [] } },
            { selector: PreSolveVehicleSelectors.selectTotalFiltered, value: 0 },
            { selector: PreSolveVehicleSelectors.selectPageIndex, value: 0 },
            { selector: PreSolveVehicleSelectors.selectPageSize, value: 10 },
            { selector: fromScenario.selectChangeDisabled, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VehiclesComponent);
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
