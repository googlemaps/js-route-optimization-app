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

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BreakRequestFormComponent } from './break-request-form.component';
import {
  ControlContainer,
  UntypedFormControl,
  UntypedFormGroup,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { MaterialModule } from 'src/app/material';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const formDirective = new FormGroupDirective([], []);
formDirective.form = new UntypedFormGroup({
  earliestStartDate: new UntypedFormControl(new Date()),
  earliestStartTime: new UntypedFormControl(''),
  latestStartDate: new UntypedFormControl(new Date()),
  latestStartTime: new UntypedFormControl(''),
});

@Component({
  selector: 'app-duration-min-sec-form',
  template: '',
})
class MockAppDurationMinSecFormComponent {
  @Input() appearance = 'legacy';
  @Input() parentFormGroup: UntypedFormGroup;
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
      imports: [MaterialModule, ReactiveFormsModule, NoopAnimationsModule],
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
