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

import * as fromConfig from '../selectors/config.selectors';

import { MapService } from 'src/app/core/services';
import { MockMapService } from 'src/test/service-mocks';
import { PlacesService, isPlaceId } from './places.service';

describe('PlacesService', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        provideMockStore({
          selectors: [{ selector: fromConfig.selectMapOptions, value: null }],
        }),
        { provide: MapService, useClass: MockMapService },
      ],
    })
  );

  it('should be created', () => {
    const service: PlacesService = TestBed.inject(PlacesService);
    expect(service).toBeTruthy();
  });

  describe('isPlaceId', () => {
    it('should return true for valid place ids', () => {
      // example place ids from https://developers.google.com/maps/documentation/places/web-service/place-id
      const validPlaceIds = [
        'ChIJgUbEo8cfqokR5lP9_Wh_DaM',
        'GhIJQWDl0CIeQUARxks3icF8U8A',
        'EicxMyBNYXJrZXQgU3QsIFdpbG1pbmd0b24sIE5DIDI4NDAxLCBVU0EiGhIYChQKEgnRTo6ixx-qiRHo_bbmkCm7ZRAN',
        'EicxMyBNYXJrZXQgU3QsIFdpbG1pbmd0b24sIE5DIDI4NDAxLCBVU0E',
        'IhoSGAoUChIJ0U6OoscfqokR6P225pApu2UQDQ',
      ];

      validPlaceIds.forEach((placeId) => {
        expect(isPlaceId(placeId)).toBe(true);
      });
    });

    it('should return false for non-place-id strings', () => {
      const notPlaceIds = [
        '(ChIJgUbEo8cfqokR5lP9_Wh_DaM)', // extra chars
        ' ChIJgUbEo8cfqokR5lP9_Wh_DaM ', // extra chars
        'something before ChIJgUbEo8cfqokR5lP9_Wh_DaM',
        'ChIJgUbEo8cfqokR5lP9_Wh_DaM something after',
        'ChIJgUbEo8cfqokR5lP9_Wh_Da', // too short
        '123 Main St',
        'Mountain View, CA',
        '12.345,-67.89',
        '',
        undefined,
        null,
      ];

      notPlaceIds.forEach((notPlaceId) => {
        expect(isPlaceId(notPlaceId)).toBe(false);
      });
    });
  });
});
