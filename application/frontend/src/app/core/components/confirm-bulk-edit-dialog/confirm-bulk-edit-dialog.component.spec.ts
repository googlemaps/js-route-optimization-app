/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { ConfirmBulkEditDialogComponent } from './confirm-bulk-edit-dialog.component';

describe('ConfirmBulkEditDialogComponent', () => {
  let component: ConfirmBulkEditDialogComponent;
  let fixture: ComponentFixture<ConfirmBulkEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [ConfirmBulkEditDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            filename: '',
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmBulkEditDialogComponent);
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
