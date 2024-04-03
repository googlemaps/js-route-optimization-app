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

import { CsvUploadDialogComponent } from './csv-upload-dialog.component';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { selectAllowExperimentalFeatures, selectTimezone } from '../../selectors/config.selectors';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Timezone } from 'src/app/shared/models';
import { EXPERIMENTAL_API_FIELDS_VEHICLES, VehicleFields } from '../../models';

@Component({
  selector: 'app-timezone-edit',
  template: '',
})
class MockTimezoneEditComponent {
  @Input() currentTimezone: Timezone;
  @Output() timezoneSelected = new EventEmitter<Timezone>();
}

describe('CsvUploadDialogComponent', () => {
  let component: CsvUploadDialogComponent;
  let fixture: ComponentFixture<CsvUploadDialogComponent>;
  let store: Store;
  let matDialogRef: jasmine.SpyObj<MatDialogRef<CsvUploadDialogComponent>>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        MaterialModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        StoreModule.forRoot({}),
      ],
      declarations: [CsvUploadDialogComponent, MockTimezoneEditComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close', 'backdropClick']),
        },
        provideMockStore({
          selectors: [
            { selector: selectTimezone, value: {} },
            { selector: selectAllowExperimentalFeatures, value: false },
          ],
        }),
      ],
    });

    await TestBed.compileComponents();

    fixture = TestBed.createComponent(CsvUploadDialogComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);

    matDialogRef = TestBed.inject(MatDialogRef) as any;
    const mockMouseEvent = jasmine.createSpyObj('mouseEvent', [
      'stopImmediatePropagation',
    ]) as MouseEvent;
    matDialogRef.backdropClick.and.callFake(() => of(mockMouseEvent));

    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not filter experimental fields from vehicle mappings', () => {
    const vehicleFieldKeys = Object.values(VehicleFields).filter((key) => typeof key === 'string');
    component.allowExperimentalFeatures = true;
    component.loadFieldMappings();
    expect(component.vehicleFieldKeys.length).toEqual(vehicleFieldKeys.length);
  });

  it('should filter experimental fields from vehicle mappings', () => {
    const vehicleFieldKeys = Object.values(VehicleFields).filter((key) => typeof key === 'string');
    component.allowExperimentalFeatures = false;
    component.loadFieldMappings();
    expect(component.vehicleFieldKeys.length).toEqual(
      vehicleFieldKeys.length - EXPERIMENTAL_API_FIELDS_VEHICLES.length
    );
  });
});
