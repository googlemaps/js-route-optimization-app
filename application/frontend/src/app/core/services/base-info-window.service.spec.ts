/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ApplicationRef, Component, EnvironmentInjector, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideMockStore } from '@ngrx/store/testing';
import { BaseInfoWindowService } from './base-info-window.service';

@Component({
  selector: 'app-mock-component',
  template: '',
})
class MockComponent {}

@Injectable({
  providedIn: 'root',
})
class MockBaseInfoWindowService extends BaseInfoWindowService<MockComponent> {
  constructor(injector: EnvironmentInjector, applicationRef: ApplicationRef) {
    super(injector, applicationRef);
  }
}

describe('BaseInfoWindowService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideMockStore({})],
    })
  );

  it('should be created', () => {
    const service: BaseInfoWindowService<MockComponent> = TestBed.inject(MockBaseInfoWindowService);
    expect(service).toBeTruthy();
  });
});
