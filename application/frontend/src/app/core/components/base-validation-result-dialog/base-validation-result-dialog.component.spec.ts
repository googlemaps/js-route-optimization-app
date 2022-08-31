/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseValidationResultDialogComponent } from './base-validation-result-dialog.component';

describe('BaseValidationResultDialogComponent', () => {
  let component: BaseValidationResultDialogComponent;
  let fixture: ComponentFixture<BaseValidationResultDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseValidationResultDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseValidationResultDialogComponent);
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
