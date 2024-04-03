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
import { MockMapService } from 'src/test/service-mocks';
import * as fromConfig from '../../selectors/config.selectors';
import { MapService } from '../../services';
import { FormMapComponent } from './form-map.component';

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
  selector: 'app-map-wrapper',
  template: '',
})
class MockMapWrapperComponent {
  @Input() options: google.maps.MapOptions;
  @Output() mapInitialize = new EventEmitter<google.maps.Map>();
}

describe('FormMapComponent', () => {
  let component: FormMapComponent;
  let fixture: ComponentFixture<FormMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        MockMapTypeButtonComponent,
        MockMapWrapperComponent,
        MockZoomHomeButtonComponent,
        FormMapComponent,
      ],
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMapOptions, value: null }],
        }),
        { provide: MapService, useClass: MockMapService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FormMapComponent);
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
