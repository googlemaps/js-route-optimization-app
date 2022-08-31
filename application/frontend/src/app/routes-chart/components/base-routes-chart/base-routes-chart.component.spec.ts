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
import { MatIconRegistry } from '@angular/material/icon';
import { ShipmentRoute } from 'src/app/core/models';
import { MaterialModule } from 'src/app/material';
import { SharedModule } from 'src/app/shared/shared.module';
import { FakeMatIconRegistry } from 'src/test/material-fakes';
import { BaseRoutesChartComponent } from './base-routes-chart.component';

@Component({
  selector: 'app-routes-row',
  template: '',
})
class MockRoutesRowComponent {
  @Input() route: ShipmentRoute;
}

@Component({
  selector: 'app-routes-row-column-header',
  template: '',
})
class MockRoutesRowColumnHeaderComponent {}

describe('BaseRoutesChartComponent', () => {
  let component: BaseRoutesChartComponent;
  let fixture: ComponentFixture<BaseRoutesChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MaterialModule, SharedModule],
      declarations: [
        MockRoutesRowColumnHeaderComponent,
        MockRoutesRowComponent,
        BaseRoutesChartComponent,
      ],
    })
      .overrideProvider(MatIconRegistry, { useFactory: () => new FakeMatIconRegistry() })
      .compileComponents();

    fixture = TestBed.createComponent(BaseRoutesChartComponent);
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
