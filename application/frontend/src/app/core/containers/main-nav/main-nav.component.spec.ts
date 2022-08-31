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
import { RouterTestingModule } from '@angular/router/testing';
import { provideMockStore } from '@ngrx/store/testing';
import DenormalizeSelectors from 'src/app/core/selectors/denormalize.selectors';
import PreSolveShipmentSelectors from 'src/app/core/selectors/pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from 'src/app/core/selectors/pre-solve-vehicle.selectors';
import * as fromPreSolve from 'src/app/core/selectors/pre-solve.selectors';
import * as fromSolution from 'src/app/core/selectors/solution.selectors';
import * as fromUI from 'src/app/core/selectors/ui.selectors';
import { Page } from '../../models';
import DispatcherApiSelectors from '../../selectors/dispatcher-api.selectors';
import { MainNavComponent } from './main-nav.component';

@Component({
  selector: 'app-base-main-nav',
  template: '',
})
class MockBaseMainNavComponent {
  @Input() disabled: boolean;
  @Input() hasSolution: boolean;
  @Input() isSolutionStale: boolean;
  @Input() isSolutionIllegal: boolean;
  @Input() selectedShipmentCount: number;
  @Input() selectedVehicleCount: number;
  @Input() solving: boolean;
  @Input() page: Page;
  @Output() shipmentsClick = new EventEmitter();
  @Output() solutionClick = new EventEmitter();
  @Output() vehiclesClick = new EventEmitter();
}

describe('MainNavComponent', () => {
  let component: MainNavComponent;
  let fixture: ComponentFixture<MainNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromPreSolve.selectGenerateDisabled, value: false },
            { selector: fromSolution.selectHasSolution, value: false },
            { selector: DenormalizeSelectors.selectIsSolutionStale, value: false },
            { selector: DenormalizeSelectors.selectIsSolutionIllegal, value: false },
            { selector: PreSolveShipmentSelectors.selectTotalSelected, value: 0 },
            { selector: PreSolveVehicleSelectors.selectTotalSelected, value: 0 },
            { selector: DispatcherApiSelectors.selectOptimizeToursLoading, value: false },
            { selector: fromUI.selectPage, value: null },
          ],
        }),
      ],
      declarations: [MockBaseMainNavComponent, MainNavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MainNavComponent);
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
