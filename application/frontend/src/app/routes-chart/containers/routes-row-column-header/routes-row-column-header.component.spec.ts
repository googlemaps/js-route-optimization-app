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
