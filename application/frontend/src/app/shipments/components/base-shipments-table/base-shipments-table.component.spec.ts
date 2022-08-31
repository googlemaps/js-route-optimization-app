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
import { ShipmentItem } from '../../models';
import { BaseShipmentsTableComponent } from './base-shipments-table.component';

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
