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
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';
import { ShipmentsControlBarComponent } from './shipments-control-bar.component';

describe('ShipmentsControlBarComponent', () => {
  let component: ShipmentsControlBarComponent;
  let fixture: ComponentFixture<ShipmentsControlBarComponent>;
  let _filterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule, NoopAnimationsModule],
      declarations: [ShipmentsControlBarComponent],
      providers: [
        { provide: FilterService, useValue: jasmine.createSpyObj('filterService', ['create']) },
        provideMockStore({
          selectors: [
            { selector: PreSolveShipmentSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: PreSolveShipmentSelectors.selectFilters, value: [] },
            { selector: PreSolveShipmentSelectors.selectAvailableDisplayColumnsOptions, value: [] },
            { selector: PreSolveShipmentSelectors.selectDisplayColumns, value: null },
            { selector: PreSolveShipmentSelectors.selectFilteredShipmentsSelectedIds, value: [] },
            { selector: PreSolveShipmentSelectors.selectShowBulkEdit, value: false },
          ],
        }),
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    _filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;

    fixture = TestBed.createComponent(ShipmentsControlBarComponent);
    component = fixture.componentInstance;

    spyOn(PreSolveShipmentSelectors, 'selectFiltersOptionById').and.returnValue(
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
