/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { ShipmentMetadata } from '../../models';
import { BaseShipmentsMetadataTableComponent } from './base-shipments-metadata-table.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TableComponent } from 'src/app/shared/components';

@Component({
  selector: 'app-table',
  template: '',
})
class MockTableComponent<T = any> {
  @Input() mouseOverActive: boolean;
  @Input() dataSource: DataSource<T>;
  @Input() itemsSelected: { [id: number]: boolean } = {};
  @Input() columnsToDisplay: string[];
  @Input() totalSelectableItems = 0;
  @Input() itemSize = 49;
  @Input() selectDisabled = false;
  @Output() selectAll = new EventEmitter<void>();
  @Output() deselectAll = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<{ id: number; selected: boolean }>();
  @Output() mouseEnterRow = new EventEmitter<any>();
  @Output() mouseExitRow = new EventEmitter<any>();
  @Input() itemsDisabled: { [id: number]: boolean } = {};
}

describe('BaseShipmentsMetadataTableComponent', () => {
  let component: BaseShipmentsMetadataTableComponent;
  let fixture: ComponentFixture<BaseShipmentsMetadataTableComponent>;
  let dataSource: jasmine.SpyObj<DataSource<ShipmentMetadata>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule],
      declarations: [BaseShipmentsMetadataTableComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .overrideProvider(TableComponent, { useValue: new MockTableComponent() })
      .compileComponents();

    dataSource = jasmine.createSpyObj('dataSource', ['attach', 'connect', 'disconnect']);
    dataSource.connect.and.callFake(() => of([]));

    fixture = TestBed.createComponent(BaseShipmentsMetadataTableComponent);
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
