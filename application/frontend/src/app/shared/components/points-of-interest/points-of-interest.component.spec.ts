/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PointsOfInterestComponent } from './points-of-interest.component';

describe('PointsOfInterestComponent', () => {
  let component: PointsOfInterestComponent;
  let fixture: ComponentFixture<PointsOfInterestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PointsOfInterestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PointsOfInterestComponent);
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
