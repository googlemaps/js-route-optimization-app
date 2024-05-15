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

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideMockStore } from '@ngrx/store/testing';
import { ShipmentRoute } from 'src/app/core/models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromPointsOfInterest from 'src/app/core/selectors/point-of-interest.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { MaterialModule } from 'src/app/material';
import { ChartColumnLabelFormatter, UnitStep } from 'src/app/shared/models';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { RoutesChartComponent } from './routes-chart.component';

@Component({
  selector: 'app-point-of-interest-drag',
  template: '',
})
class MockPointOfInterestDragComponent {}

@Component({
  selector: 'app-base-routes-chart',
  template: '',
})
class MockBaseRoutesChartComponent {
  @Input() range = 0;
  @Input() duration: [Long, Long] = null;
  @Input() unitStep: UnitStep;
  @Input() columnLabelFormatter: ChartColumnLabelFormatter;
  @Input() routes: ShipmentRoute[] = [];
  @Input() nextRangeOffset: number;
  @Input() previousRangeOffset: number;
  @Input() timezoneOffset: number;
  @Output() selectPreviousRangeOffset = new EventEmitter<number>();
  @Output() selectNextRangeOffset = new EventEmitter<number>();
}

describe('RoutesChartComponent', () => {
  let component: RoutesChartComponent;
  let fixture: ComponentFixture<RoutesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, SharedModule],
      declarations: [
        MockBaseRoutesChartComponent,
        MockPointOfInterestDragComponent,
        RoutesChartComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [
            { selector: RoutesChartSelectors.selectPagedRoutes, value: [] },
            { selector: RoutesChartSelectors.selectRanges, value: [] },
            { selector: RoutesChartSelectors.selectRangeIndex, value: 0 },
            { selector: RoutesChartSelectors.selectUnitStep, value: null },
            { selector: RoutesChartSelectors.selectPreviousColumnOffset, value: null },
            { selector: RoutesChartSelectors.selectNextColumnOffset, value: null },
            { selector: RoutesChartSelectors.selectColumnLabelFormatter, value: null },
            { selector: RoutesChartSelectors.selectTotalFilteredRoutes, value: 0 },
            { selector: RoutesChartSelectors.selectPageIndex, value: 0 },
            { selector: RoutesChartSelectors.selectPageSize, value: 0 },
            { selector: RoutesChartSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: RoutesChartSelectors.selectFilters, value: [] },
            { selector: RoutesChartSelectors.selectRange, value: 0 },
            { selector: RoutesChartSelectors.selectDuration, value: null },
            {
              selector: fromConfig.selectTimezone,
              value: {
                description: 'UTC',
                offset: 0,
                label: '\u00b10:00',
              },
            },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: fromPointsOfInterest.selectIsDragging, value: null },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(RoutesChartComponent);
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
