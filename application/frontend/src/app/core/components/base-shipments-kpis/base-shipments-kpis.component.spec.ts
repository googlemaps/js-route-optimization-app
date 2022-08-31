/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseShipmentsKpisComponent } from './base-shipments-kpis.component';

describe('BaseShipmentsKpisComponent', () => {
  let component: BaseShipmentsKpisComponent;
  let fixture: ComponentFixture<BaseShipmentsKpisComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BaseShipmentsKpisComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BaseShipmentsKpisComponent);
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
