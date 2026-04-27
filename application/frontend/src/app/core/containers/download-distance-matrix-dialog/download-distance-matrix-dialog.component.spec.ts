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
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import * as fromVehicle from '../../selectors/vehicle.selectors';
import * as fromVisitRequests from '../../selectors/visit-request.selectors';
import { FileService } from '../../services';
import { DistanceMatrixService } from '../../services/distance-matrix.service';

import { DownloadDistanceMatrixDialogComponent } from './download-distance-matrix-dialog.component';

describe('DownloadDistanceMatrixDialogComponent', () => {
  let component: DownloadDistanceMatrixDialogComponent;
  let fixture: ComponentFixture<DownloadDistanceMatrixDialogComponent>;
  let _matDialogRef: jasmine.SpyObj<MatDialogRef<DownloadDistanceMatrixDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [DownloadDistanceMatrixDialogComponent],
      providers: [
        {
          provide: MatDialogRef,
          useValue: jasmine.createSpyObj('matDialogRef', ['close']),
        },
        {
          provide: FileService,
          useValue: jasmine.createSpyObj('fileService', ['download']),
        },
        {
          provide: DistanceMatrixService,
          useValue: jasmine.createSpyObj('distanceMatrixService', ['generateDistanceMatrices']),
        },
        provideMockStore({
          selectors: [
            { selector: fromVehicle.selectAll, value: [] },
            { selector: fromVisitRequests.selectAll, value: [] },
          ],
        }),
      ],
    }).compileComponents();

    _matDialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(DownloadDistanceMatrixDialogComponent);
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
