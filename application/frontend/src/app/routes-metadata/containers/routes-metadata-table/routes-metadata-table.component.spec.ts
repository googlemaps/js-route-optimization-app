/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { MaterialModule } from 'src/app/material';
import { DataSource } from 'src/app/shared/models';
import { RouteMetadata } from '../../models';
import { RoutesMetadataTableComponent } from './routes-metadata-table.component';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import * as fromScenario from 'src/app/core/selectors/scenario.selectors';
import RoutesMetadataSelectors from 'src/app/core/selectors/routes-metadata.selectors';

@Component({
  selector: 'app-base-routes-metadata-table',
  template: '',
})
class MockBaseRoutesMetadataTableComponent {
  @Input() changeDisabled = false;
  @Input() columnsToDisplay: string[];
  @Input() dataSource: DataSource<RouteMetadata>;
  @Input() selected: { [id: number]: boolean } = {};
  @Input() sort?: { active: string; direction: string };
  @Input() timezoneOffset = 0;
  @Input() total = 0;
  @Input() unitAbbreviations: { [unit: string]: string };
}

describe('RoutesMetadataTableComponent', () => {
  let component: RoutesMetadataTableComponent;
  let fixture: ComponentFixture<RoutesMetadataTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: RoutesMetadataSelectors.selectPagedRouteMetadata, value: [] },
            { selector: RoutesMetadataSelectors.selectSort, value: null },
            { selector: RoutesMetadataSelectors.selectFilteredRoutesSelectedLookup, value: {} },
            { selector: RoutesMetadataSelectors.selectColumnsToDisplay, value: [] },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: RoutesMetadataSelectors.selectTotalFiltered, value: 0 },
            { selector: RoutesMetadataSelectors.selectPageIndex, value: 0 },
            { selector: RoutesMetadataSelectors.selectPageSize, value: 0 },
            { selector: fromScenario.selectChangeDisabled, value: false },
            { selector: RoutesMetadataSelectors.selectFilteredRouteIds, value: [] },
            { selector: fromConfig.selectSkippedShipmentReasonDescriptions, value: {} },
            { selector: fromConfig.selectUnitAbbreviations, value: {} },
          ],
        }),
      ],
      declarations: [MockBaseRoutesMetadataTableComponent, RoutesMetadataTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutesMetadataTableComponent);
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
