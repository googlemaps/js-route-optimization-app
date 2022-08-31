/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material';
import { TimezoneEditComponent } from './timezone-edit.component';

describe('TimezoneEditComponent', () => {
  let component: TimezoneEditComponent;
  let fixture: ComponentFixture<TimezoneEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, FormsModule, ReactiveFormsModule],
      declarations: [TimezoneEditComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimezoneEditComponent);
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
