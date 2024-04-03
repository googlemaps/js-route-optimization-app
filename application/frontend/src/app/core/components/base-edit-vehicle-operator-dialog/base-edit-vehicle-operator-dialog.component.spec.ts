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
