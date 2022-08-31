/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { MaterialModule } from 'src/app/material';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { ActiveFilter, Timezone } from '../../models';
import { GanttChartControlBarComponent } from './gantt-chart-control-bar.component';

@Component({
  selector: 'app-filter-list',
  template: '',
})
class MockFilterListComponent {
  @Input() filters: ActiveFilter[];
  @Output() editFilter = new EventEmitter<{ filter: ActiveFilter; element: HTMLElement }>();
  @Output() removeFilter = new EventEmitter<ActiveFilter>();
}

@Component({
  selector: 'app-timezone-edit',
  template: '',
})
class MockTimezoneEditComponent {
  @Input() currentTimezone: Timezone;
  @Output() timezoneSelected = new EventEmitter<Timezone>();
}

describe('GanttChartControlBarComponent', () => {
  let component: GanttChartControlBarComponent;
  let fixture: ComponentFixture<GanttChartControlBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      declarations: [
        MockFilterListComponent,
        MockTimezoneEditComponent,
        GanttChartControlBarComponent,
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(GanttChartControlBarComponent);
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
