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
