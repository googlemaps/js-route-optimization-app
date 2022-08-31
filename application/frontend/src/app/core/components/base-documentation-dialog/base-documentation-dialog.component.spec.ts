/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialModule } from 'src/app/material';

import { BaseDocumentationDialogComponent } from './base-documentation-dialog.component';

describe('BaseDocumentationDialogComponent', () => {
  let component: BaseDocumentationDialogComponent;
  let fixture: ComponentFixture<BaseDocumentationDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, MaterialModule],
      declarations: [BaseDocumentationDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseDocumentationDialogComponent);
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
