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
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import * as fromShipmentsMetadata from 'src/app/core/selectors/shipments-metadata.selectors';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { ShipmentMetadata } from '../../models';
import { ShipmentsMetadataTableComponent } from './shipments-metadata-table.component';
import { selectHasMap } from 'src/app/core/selectors/ui.selectors';

@Component({
  selector: 'app-base-shipments-metadata-table',
  template: '',
})
class MockBaseShipmentsMetadataTableComponent {
  @Input() hasMap: boolean;
  @Input() dataSource: DataSource<ShipmentMetadata>;
  @Input() sort?: { active: string; direction: string };
  @Input() selected: { [id: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() total = 0;
  @Input() timezoneOffset = 0;
  @Input() changeDisabled = false;
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() sortChange = new EventEmitter<{ active: string; direction: string }>();
  @Output() edit = new EventEmitter<number>();
  @Output() showOnMap = new EventEmitter<number>();
}

describe('ShipmentsMetadataTableComponent', () => {
  let component: ShipmentsMetadataTableComponent;
  let fixture: ComponentFixture<ShipmentsMetadataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromShipmentsMetadata.selectPagedShipmentMetadata, value: [] },
            { selector: fromShipmentsMetadata.selectSort, value: null },
            { selector: fromShipmentsMetadata.selectFilteredShipmentsSelectedLookup, value: {} },
            { selector: fromShipmentsMetadata.selectColumnsToDisplay, value: [] },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: fromShipmentsMetadata.selectTotalFiltered, value: 0 },
            { selector: fromShipmentsMetadata.selectPageIndex, value: 0 },
            { selector: fromShipmentsMetadata.selectPageSize, value: 0 },
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: fromShipmentsMetadata.selectFilteredShipmentIds, value: [] },
            { selector: fromConfig.selectSkippedShipmentReasonDescriptions, value: {} },
            { selector: selectHasMap, value: false },
          ],
        }),
      ],
      declarations: [MockBaseShipmentsMetadataTableComponent, ShipmentsMetadataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentsMetadataTableComponent);
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
