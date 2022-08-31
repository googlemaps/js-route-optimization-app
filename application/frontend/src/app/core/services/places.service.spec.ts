/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
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
