/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
