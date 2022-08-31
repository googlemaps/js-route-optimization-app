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
import PreSolveVehicleOperatorSelectors from '../../selectors/pre-solve-vehicle-operator.selectors';
import { VehicleOperatorsControlBarComponent } from './vehicle-operators-control-bar.component';

describe('VehicleOperatorsControlBarComponent', () => {
  let component: VehicleOperatorsControlBarComponent;
  let fixture: ComponentFixture<VehicleOperatorsControlBarComponent>;
  let _filterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [VehicleOperatorsControlBarComponent],
      providers: [
        { provide: FilterService, useValue: jasmine.createSpyObj('filterService', ['create']) },
        provideMockStore({
          selectors: [
            { selector: PreSolveVehicleOperatorSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: PreSolveVehicleOperatorSelectors.selectFilters, value: [] },
            {
              selector: PreSolveVehicleOperatorSelectors.selectAvailableDisplayColumnsOptions,
              value: [],
            },
            { selector: PreSolveVehicleOperatorSelectors.selectDisplayColumns, value: null },
            {
              selector: PreSolveVehicleOperatorSelectors.selectFilteredVehicleOperatorsSelectedIds,
              value: [],
            },
            { selector: PreSolveVehicleOperatorSelectors.selectShowBulkEdit, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    _filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;

    fixture = TestBed.createComponent(VehicleOperatorsControlBarComponent);
    component = fixture.componentInstance;
    spyOn(PreSolveVehicleOperatorSelectors, 'selectFiltersOptionById').and.returnValue(
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
