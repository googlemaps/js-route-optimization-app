/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BaseVehicleOperatorsTableComponent } from './base-vehicle-operators-table.component';
import { MaterialModule } from 'src/app/material';
import { MatIconRegistry } from '@angular/material/icon';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

describe('BaseVehicleOperatorsTableComponent', () => {
  let component: BaseVehicleOperatorsTableComponent;
  let fixture: ComponentFixture<BaseVehicleOperatorsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [BaseVehicleOperatorsTableComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseVehicleOperatorsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
