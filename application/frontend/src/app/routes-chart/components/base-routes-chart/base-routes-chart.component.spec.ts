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
