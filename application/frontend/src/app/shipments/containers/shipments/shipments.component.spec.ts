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
  @Input() hasMap: boolean;
  @Input() dataSource: DataSource<ShipmentItem>;
  @Input() sort?: { active: string; direction: string };
  @Input() itemsSelected: { [shipmentId: number]: boolean } = {};
  @Input() demandTypes: string[];
  @Input() columnsToDisplay: string[];
  @Input() totalShipments = 0;
  @Input() duration: [Long, Long];
  @Input() relativeTo: Long;
  @Input() unitAbbreviations: { [unit: string]: string };
  @Input() timezoneOffset: number;
  @Input() changeDisabled = false;
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ shipmentId: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() showOnMap = new EventEmitter<number>();
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
