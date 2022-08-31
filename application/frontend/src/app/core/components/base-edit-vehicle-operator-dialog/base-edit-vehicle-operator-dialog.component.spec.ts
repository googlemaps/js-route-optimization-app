/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { TimeWindowComponent } from 'src/app/shared/components/time-window/time-window.component';
import { BaseEditVehicleOperatorDialogComponent } from './base-edit-vehicle-operator-dialog.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { provideMockStore } from '@ngrx/store/testing';

describe('BaseEditVehicleOperatorDialogComponent', () => {
  let component: BaseEditVehicleOperatorDialogComponent;
  let fixture: ComponentFixture<BaseEditVehicleOperatorDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule, SharedModule],
      declarations: [TimeWindowComponent, BaseEditVehicleOperatorDialogComponent],
      providers: [provideMockStore({})],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();
    fixture = TestBed.createComponent(BaseEditVehicleOperatorDialogComponent);
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
