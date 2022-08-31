/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
