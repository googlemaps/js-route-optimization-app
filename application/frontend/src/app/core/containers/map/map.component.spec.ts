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
import { provideMockStore } from '@ngrx/store/testing';
import { MockMap } from 'src/test/google-maps-mocks';
import { MockInfoWindowService, MockLayerService } from 'src/test/service-mocks';
import * as fromConfig from '../../selectors/config.selectors';
import * as fromMap from '../../selectors/map.selectors';
import * as fromUI from '../../selectors/ui.selectors';
import TravelSimulatorSelectors from '../../selectors/travel-simulator.selectors';
import {
  DepotLayer,
  MapService,
  PostSolveVehicleLayer,
  PostSolveVisitRequestLayer,
  PreSolveVehicleLayer,
  PreSolveVisitRequestLayer,
  RouteLayer,
  VehicleInfoWindowService,
  VisitRequestInfoWindowService,
} from '../../services';
import { MapComponent } from './map.component';
import { MapLayer, MapLayerId } from '../../models/map';

@Component({
  selector: 'app-map-wrapper',
  template: '',
})
class MockMapWrapperComponent {
  @Input() options: google.maps.MapOptions;
  @Output() mapInitialize = new EventEmitter<google.maps.Map>();
}

@Component({
  selector: 'app-hide-map-button',
  template: '',
})
class MockHideMapButtonComponent {
  @Input() disabled = false;
  @Output() hideMap = new EventEmitter<void>();
}

@Component({
  selector: 'app-map-type-button',
  template: '',
})
class MockMapTypeButtonComponent {
  @Input() type = false;
  @Output() typeChange = new EventEmitter<boolean>();
}

@Component({
  selector: 'app-zoom-home-button',
  template: '',
})
class MockZoomHomeButtonComponent {
  @Input() disabled = false;
  @Output() zoomToHome = new EventEmitter<void>();
}

@Component({
  selector: 'app-post-solve-map-legend',
  template: '',
})
class MockPostSolveMapLegendComponent {
  @Input() mapLayers: { [id in MapLayerId]?: MapLayer } = {};
  @Output() setLayerVisibility = new EventEmitter<{ layerId: MapLayerId; visible: boolean }>();
}

@Component({
  selector: 'app-travel-simulator',
  template: '',
})
class MockTravelSimulatorComponent {}

describe('MapComponent', () => {
  let component: MapComponent;
  let fixture: ComponentFixture<MapComponent>;
  class MockMapService {
    constructor() {
      this.map = new MockMap();
    }
    map: MockMap;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockHideMapButtonComponent,
        MockMapTypeButtonComponent,
        MockMapWrapperComponent,
        MockZoomHomeButtonComponent,
        MockPostSolveMapLegendComponent,
        MockTravelSimulatorComponent,
        MapComponent,
      ],
      providers: [
        { provide: DepotLayer, useClass: MockLayerService },
        { provide: PreSolveVisitRequestLayer, useClass: MockLayerService },
        { provide: PostSolveVehicleLayer, useClass: MockLayerService },
        { provide: PreSolveVehicleLayer, useClass: MockLayerService },
        { provide: RouteLayer, useClass: MockLayerService },
        { provide: PreSolveVisitRequestLayer, useClass: MockLayerService },
        { provide: PostSolveVisitRequestLayer, useClass: MockLayerService },
        { provide: MapService, useClass: MockMapService },
        { provide: VehicleInfoWindowService, useClass: MockInfoWindowService },
        { provide: VisitRequestInfoWindowService, useClass: MockInfoWindowService },
        provideMockStore({
          selectors: [
            { selector: fromConfig.selectMapOptions, value: null },
            { selector: fromMap.selectBounds, value: null },
            { selector: fromUI.selectPage, value: null },
            { selector: fromUI.selectHasMap, value: false },
            { selector: fromConfig.selectTimezoneOffset, value: 0 },
            { selector: TravelSimulatorSelectors.selectTravelSimulatorVisible, value: false },
          ],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapComponent);
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
