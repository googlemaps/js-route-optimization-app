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
