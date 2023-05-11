/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakRequestFormComponent } from './break-request-form.component';
import { ControlContainer, FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material';

const formDirective = new FormGroupDirective([], []);
formDirective.form = new FormGroup({
  earliestStartDate: new FormControl(''),
  earliestStateTime: new FormControl(''),
  latestStartDate: new FormControl(''),
  latestStartTime: new FormControl(''),
});

describe('BreakRuleFormComponent', () => {
  let component: BreakRequestFormComponent;
  let fixture: ComponentFixture<BreakRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule],
      declarations: [BreakRequestFormComponent],
      providers: [{ provide: ControlContainer, useValue: formDirective }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BreakRequestFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
