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

import { TravelSimulatorComponent } from './travel-simulator.component';
import { provideMockStore } from '@ngrx/store/testing';
import ShipmentModelSelectors from '../../selectors/shipment-model.selectors';
import TravelSimulatorSelectors from '../../selectors/travel-simulator.selectors';
import { MaterialModule } from 'src/app/material';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('TravelSimulatorComponent', () => {
  let component: TravelSimulatorComponent;
  let fixture: ComponentFixture<TravelSimulatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, NoopAnimationsModule],
      declarations: [TravelSimulatorComponent],
      providers: [
        provideMockStore({
          selectors: [
            { selector: ShipmentModelSelectors.selectGlobalStartTime, value: 0 },
            { selector: ShipmentModelSelectors.selectGlobalEndTime, value: 0 },
            { selector: TravelSimulatorSelectors.selectTime, value: 0 },
            { selector: TravelSimulatorSelectors.selectActive, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TravelSimulatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
