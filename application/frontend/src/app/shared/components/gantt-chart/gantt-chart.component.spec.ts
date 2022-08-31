/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { GanttChartComponent } from './gantt-chart.component';

describe('GanttChartComponent', () => {
  let component: GanttChartComponent;
  let fixture: ComponentFixture<GanttChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScrollingModule],
      declarations: [GanttChartComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectTimezoneOffset, value: 0 }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GanttChartComponent);
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
