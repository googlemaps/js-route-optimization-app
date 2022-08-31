/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { getBounds } from './bounds';

describe('bounds util', () => {
  it('should return default bounds', () => {
    expect(getBounds()).toEqual(new google.maps.LatLngBounds());
  });

  it('should return default bounds from array of nulls', () => {
    expect(getBounds([null, null, null])).toEqual(new google.maps.LatLngBounds());
  });

  it('should return itself as bounds', () => {
    const locations = [
      {
        latitude: 35,
        longitude: -90,
      },
    ];
    expect(getBounds(locations)).toEqual(
      new google.maps.LatLngBounds({ lat: 35, lng: -90 }, { lat: 35, lng: -90 })
    );
  });

  it('should return itself as bounds and ignore nulls', () => {
    const locations = [
      null,
      {
        latitude: 35,
        longitude: -90,
      },
      null,
    ];
    expect(getBounds(locations)).toEqual(
      new google.maps.LatLngBounds({ lat: 35, lng: -90 }, { lat: 35, lng: -90 })
    );
  });

  it('should return bounds', () => {
    const locations = [
      {
        latitude: -35,
        longitude: -90,
      },
      {
        latitude: 40,
        longitude: 10,
      },
    ];
    expect(getBounds(locations)).toEqual(
      new google.maps.LatLngBounds({ lat: -35, lng: -90 }, { lat: 40, lng: 10 })
    );
  });

  it('should return greatest extent', () => {
    const locations = [
      {
        latitude: 5,
        longitude: 0,
      },
      {
        latitude: -3,
        longitude: 9,
      },
      {
        latitude: -35,
        longitude: -90,
      },
      {
        latitude: 40,
        longitude: 10,
      },
      {
        latitude: -22,
        longitude: -1,
      },
      {
        latitude: 21,
        longitude: 1,
      },
    ];
    expect(getBounds(locations)).toEqual(
      new google.maps.LatLngBounds({ lat: -35, lng: -90 }, { lat: 40, lng: 10 })
    );
  });
});
