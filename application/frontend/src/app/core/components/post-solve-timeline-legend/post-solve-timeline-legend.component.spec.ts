/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PostSolveTimelineLegendComponent } from './post-solve-timeline-legend.component';

describe('PostSolveTimelineLegendComponent', () => {
  let component: PostSolveTimelineLegendComponent;
  let fixture: ComponentFixture<PostSolveTimelineLegendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PostSolveTimelineLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PostSolveTimelineLegendComponent);
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
