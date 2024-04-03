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

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { of } from 'rxjs';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { ShipmentItem } from '../../models';
import { BaseShipmentsTableComponent } from './base-shipments-table.component';
import { TableComponent } from 'src/app/shared/components';
import { Component, EventEmitter, Input, Output } from '@angular/core';

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

describe('BaseShipmentsTableComponent', () => {
  let component: BaseShipmentsTableComponent;
  let fixture: ComponentFixture<BaseShipmentsTableComponent>;
  let dataSource: jasmine.SpyObj<DataSource<ShipmentItem>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule],
      declarations: [BaseShipmentsTableComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .overrideProvider(TableComponent, { useValue: new MockTableComponent() })
      .compileComponents();

    dataSource = jasmine.createSpyObj('dataSource', ['attach', 'connect', 'disconnect']);
    dataSource.connect.and.callFake(() => of([]));

    fixture = TestBed.createComponent(BaseShipmentsTableComponent);
    component = fixture.componentInstance;
    component.dataSource = dataSource;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
