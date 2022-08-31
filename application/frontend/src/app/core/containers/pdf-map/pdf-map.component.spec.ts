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
import { Store } from '@ngrx/store';
import { provideMockStore } from '@ngrx/store/testing';
import * as fromConfig from '../../selectors/config.selectors';

import { PdfMapComponent } from './pdf-map.component';

@Component({
  selector: 'app-map-wrapper',
  template: '',
})
class MockMapWrapperComponent {
  @Input() options: google.maps.MapOptions;
  @Output() mapInitialize = new EventEmitter<google.maps.Map>();
}

describe('PdfMapComponent', () => {
  let component: PdfMapComponent;
  let fixture: ComponentFixture<PdfMapComponent>;
  let store: Store;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PdfMapComponent, MockMapWrapperComponent],
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMapOptions, value: {} }],
        }),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PdfMapComponent);
    component = fixture.componentInstance;
    store = TestBed.inject(Store);
    spyOn(store, 'dispatch').and.callThrough();
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
