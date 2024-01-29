/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormControl, UntypedFormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { DurationMinSecFormComponent } from './duration-min-sec-form.component';

describe('DurationMinSecFormComponent', () => {
  let component: DurationMinSecFormComponent;
  let fixture: ComponentFixture<DurationMinSecFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, ReactiveFormsModule],
      declarations: [DurationMinSecFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DurationMinSecFormComponent);
    component = fixture.componentInstance;
    component.parentFormGroup = new UntypedFormGroup({
      min: new UntypedFormControl([null, [Validators.min(0)]]),
      sec: new UntypedFormControl([null, [Validators.min(0)]]),
    });
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
