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
import { ConfirmOverwriteDialogComponent } from './confirm-overwrite-dialog.component';

describe('ConfirmOverwriteDialogComponent', () => {
  let component: ConfirmOverwriteDialogComponent;
  let fixture: ComponentFixture<ConfirmOverwriteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [ConfirmOverwriteDialogComponent],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            filename: '',
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmOverwriteDialogComponent);
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
