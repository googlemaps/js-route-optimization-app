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
