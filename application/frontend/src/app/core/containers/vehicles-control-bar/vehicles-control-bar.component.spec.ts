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
import { FilterService } from 'src/app/shared/services';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';
import { VehiclesControlBarComponent } from './vehicles-control-bar.component';

describe('VehiclesControlBarComponent', () => {
  let component: VehiclesControlBarComponent;
  let fixture: ComponentFixture<VehiclesControlBarComponent>;
  let _filterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [VehiclesControlBarComponent],
      providers: [
        { provide: FilterService, useValue: jasmine.createSpyObj('filterService', ['create']) },
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: PreSolveVehicleSelectors.selectFilters, value: [] },
            { selector: PreSolveVehicleSelectors.selectAvailableDisplayColumnsOptions, value: [] },
            { selector: PreSolveVehicleSelectors.selectDisplayColumns, value: null },
            { selector: PreSolveVehicleSelectors.selectFilteredVehiclesSelectedIds, value: [] },
            { selector: PreSolveVehicleSelectors.selectShowBulkEdit, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    _filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;

    fixture = TestBed.createComponent(VehiclesControlBarComponent);
    component = fixture.componentInstance;
    spyOn(PreSolveVehicleSelectors, 'selectFiltersOptionById').and.returnValue(
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
