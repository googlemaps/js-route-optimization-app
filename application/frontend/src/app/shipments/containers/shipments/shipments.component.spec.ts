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
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromShipment from 'src/app/core/selectors/shipment.selectors';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { ShipmentItem } from '../../models';
import { ShipmentsComponent } from './shipments.component';
import { selectHasMap } from 'src/app/core/selectors/ui.selectors';
import ShipmentModelSelectors from '../../../core/selectors/shipment-model.selectors';

@Component({
  selector: 'app-base-shipments-table',
  template: '',
})
class MockBaseShipmentsTableComponent {
  @Input() dataSource: DataSource<ShipmentItem>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [shipmentId: number]: boolean } = {};
  @Input() demandTypes: string[];
  @Input() columnsToDisplay: string[];
  @Input() totalShipments = 0;
  @Input() duration: [Long, Long];
  @Input() relativeTo: Long;
  @Input() unitAbbreviations: { [unit: string]: string };
  @Input() timezoneOffset = 0;
  @Input() changeDisabled = false;
  @Input() hasMap = false;
  @Input() showBulkEdit: boolean;
  @Input() showBulkDelete: boolean;
  @Output() bulkEdit = new EventEmitter();
  @Output() bulkDelete = new EventEmitter();
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() edit = new EventEmitter<number>();
  @Output() delete = new EventEmitter<ShipmentItem>();
  @Output() mouseEnterVisitRequest = new EventEmitter<number>();
  @Output() mouseExitVisitRequest = new EventEmitter<number>();
}

describe('ShipmentsComponent', () => {
  let component: ShipmentsComponent;
  let fixture: ComponentFixture<ShipmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [MockBaseShipmentsTableComponent, ShipmentsComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveShipmentSelectors.selectPagedShipmentItems, value: [] },
            { selector: PreSolveShipmentSelectors.selectSort, value: {} },
            {
              selector: PreSolveShipmentSelectors.selectFilteredShipmentsSelectedLookup,
              value: {},
            },
            { selector: PreSolveShipmentSelectors.selectDemandTypes, value: [] },
            { selector: PreSolveShipmentSelectors.selectColumnsToDisplay, value: [] },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalDuration, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: [] },
            { selector: fromShipment.selectShipmentState, value: { entities: {}, ids: [] } },
            { selector: PreSolveShipmentSelectors.selectTotalFiltered, value: 0 },
            { selector: PreSolveShipmentSelectors.selectPageIndex, value: 0 },
            { selector: PreSolveShipmentSelectors.selectPageSize, value: 10 },
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: selectHasMap, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentsComponent);
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
