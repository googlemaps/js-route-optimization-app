/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtraVisitDurationFormComponent } from './extra-visit-duration-form.component';
import { ControlContainer, FormGroup } from '@angular/forms';

const controlContainer = new FormGroup({});
describe('ExtraVisitDurationFormComponent', () => {
  let component: ExtraVisitDurationFormComponent;
  let fixture: ComponentFixture<ExtraVisitDurationFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExtraVisitDurationFormComponent],
      providers: [{ provide: ControlContainer, useValue: controlContainer }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExtraVisitDurationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
