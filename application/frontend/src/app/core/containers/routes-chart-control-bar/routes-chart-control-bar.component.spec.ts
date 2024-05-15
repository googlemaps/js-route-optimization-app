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
import { MatIconRegistry } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { MaterialModule } from 'src/app/material';
import { FilterService } from 'src/app/shared/services';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { RoutesChartControlBarComponent } from './routes-chart-control-bar.component';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import Long from 'long';
import { Page } from '../../models';
import * as fromUI from 'src/app/core/selectors/ui.selectors';

describe('RoutesChartControlBarComponent', () => {
  let component: RoutesChartControlBarComponent;
  let fixture: ComponentFixture<RoutesChartControlBarComponent>;
  let _filterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, SharedModule],
      providers: [
        { provide: FilterService, useValue: jasmine.createSpyObj('filterService', ['create']) },
        provideMockStore({
          selectors: [
            { selector: RoutesChartSelectors.selectRanges, value: [] },
            { selector: RoutesChartSelectors.selectRangeIndex, value: 0 },
            { selector: RoutesChartSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: RoutesChartSelectors.selectFilters, value: [] },
            { selector: RoutesChartSelectors.selectRange, value: 0 },
            {
              selector: fromConfig.selectTimezone,
              value: {
                description: 'UTC',
                offset: 0,
                label: '\u00b10:00',
              },
            },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            {
              selector: ShipmentModelSelectors.selectGlobalDuration,
              value: [Long.ZERO, Long.ZERO],
            },
            { selector: RoutesChartSelectors.selectNowRangeOffset, value: 0 },
            { selector: RoutesChartSelectors.selectRangeOffset, value: 0 },
            { selector: RoutesChartSelectors.selectSelectedRange, value: null },
            { selector: fromUI.selectPage, value: Page.RoutesChart },
          ],
        }),
      ],
      declarations: [RoutesChartControlBarComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    _filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;

    fixture = TestBed.createComponent(RoutesChartControlBarComponent);
    component = fixture.componentInstance;

    spyOn(RoutesChartSelectors, 'selectFiltersOptionById').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
