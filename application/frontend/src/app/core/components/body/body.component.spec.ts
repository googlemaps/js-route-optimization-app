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
import { RouterTestingModule } from '@angular/router/testing';
import { BodyComponent } from './body.component';

@Component({
  selector: 'app-metadata-control-bar',
  template: '',
})
class MockMetadataControlBarComponent {}

@Component({
  selector: 'app-post-solve-control-bar',
  template: '',
})
class MockPostSolveControlBarComponent {}

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
        MockPostSolveControlBarComponent,
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
