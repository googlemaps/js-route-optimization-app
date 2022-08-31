/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimeSet } from '../../models';

import { BasePostSolveMetricsComponent } from './base-post-solve-metrics.component';

@Component({
  selector: 'app-post-solve-timeline-legend',
  template: '',
})
class MockPostSolveTimelineLegendComponent {
  @Input() vehicleTimeAverages: TimeSet;
}

describe('BasePostSolveMetricsComponent', () => {
  let component: BasePostSolveMetricsComponent;
  let fixture: ComponentFixture<BasePostSolveMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BasePostSolveMetricsComponent, MockPostSolveTimelineLegendComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BasePostSolveMetricsComponent);
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
