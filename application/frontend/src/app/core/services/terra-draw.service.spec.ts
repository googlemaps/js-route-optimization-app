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

import { TestBed } from '@angular/core/testing';
import { TerraDrawService } from './terra-draw.service';

describe('TerraDrawService', () => {
  let service: TerraDrawService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TerraDrawService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should not be ready initially', () => {
    expect(service.isReady).toBeFalse();
  });

  it('should handle setMode gracefully when not initialized', () => {
    // Should not throw when called before initialization
    expect(() => service.setMode(1)).not.toThrow(); // SelectionMode.Bbox
    expect(() => service.setMode(2)).not.toThrow(); // SelectionMode.Polygon
    expect(() => service.setMode(0)).not.toThrow(); // SelectionMode.Off
  });

  it('should handle destroy gracefully when not initialized', () => {
    expect(() => service.destroy()).not.toThrow();
  });
});
