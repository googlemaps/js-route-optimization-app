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
