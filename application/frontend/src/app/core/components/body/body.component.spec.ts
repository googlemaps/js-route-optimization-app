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
import { RouterTestingModule } from '@angular/router/testing';
import { BodyComponent } from './body.component';

@Component({
  selector: 'app-metadata-control-bar',
  template: '',
})
class MockMetadataControlBarComponent {}

@Component({
  selector: 'app-pre-solve-control-bar',
  template: '',
})
class MockPreSolveControlBarComponent {}

@Component({
  selector: 'app-shipments-control-bar',
  template: '',
})
class MockShipmentsControlBarComponent {}

@Component({
  selector: 'app-shipments-kpis',
  template: '',
})
class MockShipmentsKpisComponent {}

@Component({
  selector: 'app-scenario-kpis',
  template: '',
})
class MockScenarioKpiComponent {}

@Component({
  selector: 'app-vehicles-control-bar',
  template: '',
})
class MockVehiclesControlBarComponent {}

@Component({
  selector: 'app-vehicles-kpis',
  template: '',
})
class MockVehiclesKpisComponent {}

@Component({
  selector: 'app-routes-chart-control-bar',
  template: '',
})
class MockRoutesChartControlBarComponent {}

@Component({
  selector: 'app-progress-bar',
  template: '',
})
class MockProgressBarComponent {
  @Input() loading = false;
}

@Component({
  selector: 'app-map',
  template: '',
})
class MockMapComponent {}

@Component({
  selector: 'app-form-map',
  template: '',
})
class MockFormMapComponent {}

@Component({
  selector: 'app-pdf-map',
  template: '',
})
class MockPdfMapComponent {}

describe('BodyComponent', () => {
  let component: BodyComponent;
  let fixture: ComponentFixture<BodyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        MockMetadataControlBarComponent,
        MockPreSolveControlBarComponent,
        MockShipmentsControlBarComponent,
        MockShipmentsKpisComponent,
        MockVehiclesControlBarComponent,
        MockVehiclesKpisComponent,
        MockRoutesChartControlBarComponent,
        MockProgressBarComponent,
        MockMapComponent,
        MockFormMapComponent,
        MockPdfMapComponent,
        BodyComponent,
        MockScenarioKpiComponent,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BodyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
