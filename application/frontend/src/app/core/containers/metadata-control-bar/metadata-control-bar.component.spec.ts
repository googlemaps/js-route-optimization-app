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
import { RouterTestingModule } from '@angular/router/testing';
import { createSelector } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { FilterService } from 'src/app/shared/services';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import RoutesMetadataSelectors from '../../selectors/routes-metadata.selectors';
import * as fromUI from '../../selectors/ui.selectors';
import { MetadataControlBarComponent } from './metadata-control-bar.component';

describe('MetadataControlBarComponent', () => {
  let component: MetadataControlBarComponent;
  let fixture: ComponentFixture<MetadataControlBarComponent>;
  let _filterService: jasmine.SpyObj<FilterService>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule, RouterTestingModule, SharedModule],
      providers: [
        { provide: FilterService, useValue: jasmine.createSpyObj('filterService', ['create']) },
        provideMockStore({
          selectors: [
            { selector: fromUI.selectPage, value: null },
            { selector: RoutesMetadataSelectors.selectAvailableFiltersOptions, value: [] },
            { selector: RoutesMetadataSelectors.selectAvailableDisplayColumnsOptions, value: [] },
            { selector: RoutesMetadataSelectors.selectFilters, value: [] },
            { selector: RoutesMetadataSelectors.selectDisplayColumns, value: null },
          ],
        }),
      ],
      declarations: [MetadataControlBarComponent],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(MetadataControlBarComponent);
    component = fixture.componentInstance;

    spyOn(RoutesMetadataSelectors, 'selectFiltersOptionById').and.returnValue(
      createSelector(
        () => null,
        (_state) => null
      )
    );
    fixture.detectChanges();

    _filterService = TestBed.inject(FilterService) as jasmine.SpyObj<FilterService>;
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
