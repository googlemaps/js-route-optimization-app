/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlContainer,
  UntypedFormBuilder,
  FormGroupDirective,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';

import { TimeWindowComponent } from './time-window.component';

const form = TimeWindowComponent.createFormGroup(new UntypedFormBuilder());
const controlContainer = new FormGroupDirective([], []);
controlContainer.form = form;

describe('TimeWindowComponent', () => {
  let component: TimeWindowComponent;
  let fixture: ComponentFixture<TimeWindowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, ReactiveFormsModule, NoopAnimationsModule],
      declarations: [TimeWindowComponent],
      providers: [
        { provide: ControlContainer, useValue: controlContainer },
        { provide: UntypedFormBuilder },
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(TimeWindowComponent);
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
