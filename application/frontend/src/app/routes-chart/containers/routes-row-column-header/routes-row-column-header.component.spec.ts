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
import { provideMockStore } from '@ngrx/store/testing';
import RoutesChartSelectors from 'src/app/core/selectors/routes-chart.selectors';
import { RoutesRowColumnHeaderComponent } from './routes-row-column-header.component';

@Component({
  selector: 'app-base-routes-row-column-header',
  template: '',
})
class MockBaseRoutesRowColumnHeaderComponent {
  @Input() totalRoutes: number;
  @Input() totalSelectedRoutes: number;
  @Output() selectAllRoutes = new EventEmitter<void>();
  @Output() deselectAllRoutes = new EventEmitter<void>();
}

describe('RoutesRowColumnHeaderComponent', () => {
  let component: RoutesRowColumnHeaderComponent;
  let fixture: ComponentFixture<RoutesRowColumnHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MockBaseRoutesRowColumnHeaderComponent, RoutesRowColumnHeaderComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: RoutesChartSelectors.selectFilteredRoutes, value: [] },
            { selector: RoutesChartSelectors.selectTotalFilteredRoutes, value: 0 },
            { selector: RoutesChartSelectors.selectTotalFilteredRoutesSelected, value: 0 },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RoutesRowColumnHeaderComponent);
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
