/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { selectTimezoneOffset } from '../../selectors/config.selectors';
import {
  selectCurrentDragVisit,
  selectDragEnd,
  selectDragStart,
  selectDragVisitsToEdit,
  selectOverlapTimeline,
} from '../../selectors/point-of-interest.selectors';

import { PointOfInterestDragComponent } from './point-of-interest-drag.component';

describe('PointOfInterestDragComponent', () => {
  let component: PointOfInterestDragComponent;
  let fixture: ComponentFixture<PointOfInterestDragComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PointOfInterestDragComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: selectDragStart, value: null },
            { selector: selectDragEnd, value: null },
            { selector: selectCurrentDragVisit, value: null },
            { selector: selectOverlapTimeline, value: null },
            { selector: selectDragVisitsToEdit, value: null },
            { selector: selectTimezoneOffset, value: 0 },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PointOfInterestDragComponent);
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
