/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeLabelComponent } from './time-label.component';

describe('TimeLabelComponent', () => {
  let component: TimeLabelComponent;
  let fixture: ComponentFixture<TimeLabelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TimeLabelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeLabelComponent);
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
