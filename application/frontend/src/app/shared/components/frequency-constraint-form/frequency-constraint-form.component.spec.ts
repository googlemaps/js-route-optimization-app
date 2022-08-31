/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrequencyConstraintFormComponent } from './frequency-constraint-form.component';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective } from '@angular/forms';

const formDirective = new FormGroupDirective([], []);
formDirective.form = new FormGroup({
  minBreakDuration: new FormControl(''),
  maxInterBreakDuration: new FormControl(''),
});

describe('FrequencyConstraitsFormComponent', () => {
  let component: FrequencyConstraintFormComponent;
  let fixture: ComponentFixture<FrequencyConstraintFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrequencyConstraintFormComponent],
      providers: [{ provide: ControlContainer, useValue: formDirective }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FrequencyConstraintFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
