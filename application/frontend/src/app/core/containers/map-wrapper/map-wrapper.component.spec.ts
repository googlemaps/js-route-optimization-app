/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockMapService } from 'src/test/service-mocks';
import { MapService } from '../../services';
import { MapWrapperComponent } from './map-wrapper.component';

describe('MapWrapperComponent', () => {
  let component: MapWrapperComponent;
  let fixture: ComponentFixture<MapWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MapWrapperComponent],
      providers: [{ provide: MapService, useClass: MockMapService }],
    });

    fixture = TestBed.createComponent(MapWrapperComponent);
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
