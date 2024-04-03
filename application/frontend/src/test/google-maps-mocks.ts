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

// mocks for the Google Maps JavaScript API classes and functions (google.maps.*)
// these mocks are incomplete, they minimally cover the components
// required for the application's tests

import { isArray } from 'lodash';

export class MockMap {
  fitBounds(): void {}

  getZoom(): number {
    return 0;
  }

  setOptions(): void {}
}

class MockMVCArray<T> {
  private array: T[] = [];

  constructor(array?: T[]) {
    if (isArray(array)) {
      this.array = array;
    }
  }

  forEach(callback: (elem: T, i: number) => void): void {
    return this.array.forEach(callback);
  }

  getAt(i: number): T {
    return this.array[i];
  }

  push(elem: T): number {
    return this.array.push(elem);
  }
}

type MockLatLngLiteral = { lat: number; lng: number };

class MockLatLng {
  private latitude: number;
  private longitude: number;

  constructor(latOrLiteral: MockLatLngLiteral | number, lng?: number) {
    if (lng !== undefined) {
      this.latitude = latOrLiteral as number;
      this.longitude = lng;
    } else {
      this.latitude = (latOrLiteral as MockLatLngLiteral).lat;
      this.longitude = (latOrLiteral as MockLatLngLiteral).lng;
    }
  }

  lat(): number {
    return this.latitude;
  }

  lng(): number {
    return this.longitude;
  }
}

class MockLatLngBounds {
  private sw: MockLatLngLiteral;
  private ne: MockLatLngLiteral;

  constructor(sw: MockLatLngLiteral, ne: MockLatLngLiteral) {
    this.sw = sw;
    this.ne = ne;
  }

  getSouthWest(): MockLatLng {
    return new MockLatLng(this.sw);
  }

  getNorthEast(): MockLatLng {
    return new MockLatLng(this.ne);
  }

  isEmpty(): boolean {
    return this.ne?.lat === this.sw?.lat && this.ne?.lng === this.sw?.lng;
  }
}

class MockPolygon {
  private path: MockMVCArray<MockLatLng>;

  constructor(opts: { paths: MockLatLngLiteral[] }) {
    this.path = new MockMVCArray<MockLatLng>();
    opts.paths.forEach((p) => this.path.push(new MockLatLng(p)));
  }

  getPath(): MockMVCArray<MockLatLng> {
    return this.path;
  }
}

export const google = {
  maps: {
    // event namespace
    event: {
      clearInstanceListeners: () => {},
    },

    // geometry namespace
    geometry: {
      encoding: {
        decodePath: () => {},
      },
      spherical: {
        computeHeading: () => {},
        computeDistanceBetween: () => {},
      },
    },

    // classes
    Icon: function () {
      return {};
    },
    LatLng: function (latOrLiteral, lng?) {
      return new MockLatLng(latOrLiteral, lng);
    },
    LatLngBounds: function (sw, ne) {
      return new MockLatLngBounds(sw, ne);
    },
    Map: function () {
      return new MockMap();
    },
    Point: function () {
      return {};
    },
    Polygon: function (opts) {
      return new MockPolygon(opts);
    },
  },
};
