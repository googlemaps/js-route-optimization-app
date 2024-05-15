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

import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { ShipmentsKpis } from '../../models';
import * as fromConfig from '../../selectors/config.selectors';
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';
import { ShipmentsKpisComponent } from './shipments-kpis.component';

@Component({
  selector: 'app-base-shipments-kpis',
  template: '',
})
class MockBaseShipmentsKpisComponent {
  @Input() shipmentsKpis: ShipmentsKpis;
  @Input() unitAbbreviations: { [unit: string]: string };
}

describe('ShipmentsKpisComponent', () => {
  let component: ShipmentsKpisComponent;
  let fixture: ComponentFixture<ShipmentsKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveShipmentSelectors.selectShipmentsKpis, value: null },
            { selector: fromConfig.selectUnitAbbreviations, value: null },
          ],
        }),
      ],
      declarations: [MockBaseShipmentsKpisComponent, ShipmentsKpisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShipmentsKpisComponent);
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
