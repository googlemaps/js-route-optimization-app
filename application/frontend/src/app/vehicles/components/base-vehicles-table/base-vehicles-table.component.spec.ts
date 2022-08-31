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
import { Vehicle } from 'src/app/core/models';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { BaseVehiclesTableComponent } from './base-vehicles-table.component';

describe('BaseVehiclesTableComponent', () => {
  let component: BaseVehiclesTableComponent;
  let fixture: ComponentFixture<BaseVehiclesTableComponent>;
  let dataSource: jasmine.SpyObj<DataSource<Vehicle>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule],
      declarations: [BaseVehiclesTableComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    dataSource = jasmine.createSpyObj('dataSource', ['attach', 'connect', 'disconnect']);
    dataSource.connect.and.callFake(() => of([]));

    fixture = TestBed.createComponent(BaseVehiclesTableComponent);
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
