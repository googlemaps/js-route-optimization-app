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
import { provideMockStore } from '@ngrx/store/testing';
import { MockMapService } from 'src/test/service-mocks';
import * as fromMap from '../selectors/map.selectors';
import * as fromUI from '../selectors/ui.selectors';
import { MapService } from './map.service';
import { VehicleInfoWindowService } from './vehicle-info-window.service';

describe('VehicleInfoWindowService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [
            { selector: fromUI.selectClickedVehicleId, value: null },
            { selector: fromMap.selectInfoWindowVehicle, value: null },
          ],
        }),
        { provide: MapService, value: MockMapService },
      ],
    })
  );

  it('should be created', () => {
    const service: VehicleInfoWindowService = TestBed.inject(VehicleInfoWindowService);
    expect(service).toBeTruthy();
  });
});
