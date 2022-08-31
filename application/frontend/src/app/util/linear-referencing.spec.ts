/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { TestBed } from '@angular/core/testing';
import {
  computeHeadingAlongPath,
  getPointAlongPathByDistance,
  getIndexAlongPathByPointOptimized,
  decodePath,
  coordinatesToPath,
  pointsAreCoincident,
  simplifyPath,
} from 'src/app/util';
import { pathCoordinates, pathEncoded } from 'src/test/test-fakes';
import { toCheapRulerLine, toCheapRulerPoint } from './geo-translation';

describe('linear referencing', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should create polylines from routes', () => {
    spyOn(google.maps.geometry.encoding, 'decodePath').and.returnValue(
      coordinatesToPath(pathCoordinates)
    );
    const decoded = decodePath(pathEncoded);
    expect(google.maps.geometry.encoding.decodePath).toHaveBeenCalled();
    expect(decoded.length).toEqual(pathCoordinates.length);
  });

  it('should calculate rotation angle perpendicular to polyline', () => {
    const from = new google.maps.LatLng(43.65578, -70.25502);
    const to = new google.maps.LatLng(43.65478, -70.25733);

    const heading = -90;
    spyOn(google.maps.geometry.spherical, 'computeHeading').and.returnValue(heading);
    const rotationAngle = computeHeadingAlongPath(from, to);
    expect(google.maps.geometry.spherical.computeHeading).toHaveBeenCalled();
    expect(rotationAngle).toEqual(heading);
  });

  it('should place point along path', () => {
    const path = pathCoordinates.map((vertex) => {
      return new google.maps.LatLng(vertex[0], vertex[1]);
    });

    const point = getPointAlongPathByDistance(path, 15000);

    const minLatitude = pathCoordinates.reduce(
      (min, vertex) => Math.min(min, vertex[0]),
      pathCoordinates[0][0]
    );
    const maxLatitude = pathCoordinates.reduce(
      (max, vertex) => Math.max(max, vertex[0]),
      pathCoordinates[0][0]
    );
    expect(point.lat()).toBeGreaterThan(minLatitude);
    expect(point.lat()).toBeLessThan(maxLatitude);

    const minLongitude = pathCoordinates.reduce(
      (min, vertex) => Math.min(min, vertex[0]),
      pathCoordinates[0][1]
    );
    const maxLongitude = pathCoordinates.reduce(
      (max, vertex) => Math.max(max, vertex[0]),
      pathCoordinates[0][1]
    );
    expect(point.lng()).toBeGreaterThan(minLongitude);
    expect(point.lng()).toBeLessThan(maxLongitude);
  });

  it('should find index for point along path', () => {
    const path = coordinatesToPath(pathCoordinates);
    const index = getIndexAlongPathByPointOptimized(
      toCheapRulerLine(path),
      toCheapRulerPoint(path[3])
    );
    expect(index).toBe(2);
  });

  it('should determine points are the same', () => {
    expect(
      pointsAreCoincident(new google.maps.LatLng(31.3, 84.3), new google.maps.LatLng(31.3, 84.3))
    ).toBe(true);
  });

  it('should determine points are not the same', () => {
    expect(
      pointsAreCoincident(new google.maps.LatLng(31.3, 84.3), new google.maps.LatLng(-1.1, 14))
    ).toBe(false);
  });

  it('should determine points are not coincident within tolerance', () => {
    expect(
      pointsAreCoincident(
        new google.maps.LatLng(31.28, 84.32),
        new google.maps.LatLng(31.3, 84.3),
        100
      )
    ).toBe(false);
  });

  it('should simplify path', () => {
    const path = [
      new google.maps.LatLng(12.111111111, 12.111111111),
      new google.maps.LatLng(9.222222222, 9.222222222),
    ];
    const expected = [
      new google.maps.LatLng(12.1111, 12.1111),
      new google.maps.LatLng(9.2222, 9.2222),
    ];
    const simplified = simplifyPath(path);

    simplified.forEach((point, i) => {
      expect(point.lat()).toBeCloseTo(expected[i].lat());
      expect(point.lng()).toBeCloseTo(expected[i].lng());
    });
  });
});
