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
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';

const formDirective = new FormGroupDirective([], []);
formDirective.form = new FormGroup({
  earliestStartDate: new FormControl(''),
  earliestStartTime: new FormControl(''),
  latestStartDate: new FormControl(''),
  latestStartTime: new FormControl(''),
});

@Component({
  selector: 'app-duration-min-sec-form',
  template: ''
})
class MockAppDurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: FormGroup;
  @Input() errorStateMatcher: ErrorStateMatcher;
  @Input() labelName: string;
  @Input() showUnset: boolean;
  @Input() isUnset: boolean;
  @Input() fieldName: string;
  @Output() unsetEvent = new EventEmitter<{ field: string }>();
}

describe('BreakRuleFormComponent', () => {
  let component: BreakRequestFormComponent;
  let fixture: ComponentFixture<BreakRequestFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule],
      declarations: [BreakRequestFormComponent, MockAppDurationMinSecFormComponent],
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
