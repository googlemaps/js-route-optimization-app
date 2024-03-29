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
  @Input() allowExperimentalFeatures: boolean;
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
  @Output() addShipment = new EventEmitter();
  @Output() addVehicle = new EventEmitter();
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
