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
import { MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import * as fromConfig from '../../selectors/config.selectors';
import { DispatcherService, FileService } from '../../services';
import { UploadDialogComponent } from './upload-dialog.component';

describe('UploadDialogComponent', () => {
  let component: UploadDialogComponent;
  let fixture: ComponentFixture<UploadDialogComponent>;
  let dispatcherService: any;
  let fileService: any;

  beforeEach(async () => {
    dispatcherService = jasmine.createSpyObj('dispatcherService', ['parseScenario']);
    fileService = jasmine.createSpyObj('fileService', ['readAsText']);

    await TestBed.configureTestingModule({
      imports: [RouterTestingModule, ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      declarations: [UploadDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: DispatcherService, useValue: dispatcherService },
        { provide: FileService, useValue: fileService },
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMessagesConfig, value: null }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UploadDialogComponent);
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
