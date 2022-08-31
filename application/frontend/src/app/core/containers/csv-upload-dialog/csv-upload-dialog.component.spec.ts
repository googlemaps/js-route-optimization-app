/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
