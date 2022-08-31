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
import PreSolveShipmentSelectors from '../../selectors/pre-solve-shipment.selectors';
import PreSolveVehicleSelectors from '../../selectors/pre-solve-vehicle.selectors';
import { PreSolveMessageComponent } from './pre-solve-message.component';

@Component({
  selector: 'app-base-pre-solve-message',
  template: '',
})
class MockBasePreSolveMessageComponent {
  @Input() numberOfVehicles = 0;
  @Input() numberOfShipments = 0;
}

describe('PreSolveMessageComponent', () => {
  let component: PreSolveMessageComponent;
  let fixture: ComponentFixture<PreSolveMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: PreSolveShipmentSelectors.selectTotalSelected, value: null },
            { selector: PreSolveVehicleSelectors.selectTotalSelected, value: null },
          ],
        }),
      ],
      declarations: [MockBasePreSolveMessageComponent, PreSolveMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PreSolveMessageComponent);
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
