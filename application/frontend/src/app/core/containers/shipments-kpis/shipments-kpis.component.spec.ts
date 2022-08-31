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
