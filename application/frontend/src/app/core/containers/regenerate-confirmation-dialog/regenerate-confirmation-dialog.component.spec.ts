/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { provideMockStore } from '@ngrx/store/testing';
import { RegenerateConfirmationDialogComponent } from './regenerate-confirmation-dialog.component';

@Component({
  selector: 'app-base-regenerate-confirmation-dialog',
  template: '',
})
export class MockBaseRegenerateConfirmationDialogComponent {}

describe('RegenerateConfirmationDialogComponent', () => {
  let component: RegenerateConfirmationDialogComponent;
  let fixture: ComponentFixture<RegenerateConfirmationDialogComponent>;
  let _matDialogRef: jasmine.SpyObj<MatDialogRef<RegenerateConfirmationDialogComponent>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockBaseRegenerateConfirmationDialogComponent,
        RegenerateConfirmationDialogComponent,
      ],
      providers: [
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('matDialogRef', ['close']) },
        provideMockStore(),
      ],
    }).compileComponents();
    _matDialogRef = TestBed.inject(MatDialogRef) as any;

    fixture = TestBed.createComponent(RegenerateConfirmationDialogComponent);
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
