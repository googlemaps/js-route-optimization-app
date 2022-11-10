/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import {
  boundsToTurfPolygon,
  coordinatesToPath,
  formatDispatcherLatLng,
  fromDispatcherLatLng,
  fromDispatcherToTurfPoint,
  fromDispatcherWaypointLatLng,
  fromTurfPoint,
  fromTurfRoute,
  isLatLngString,
  mapsPolygonToTurfPolygon,
  stringToLatLng,
  toCheapRulerLine,
  toCheapRulerPoint,
  toDispatcherLatLng,
  toTurfLineString,
  toTurfPoint,
} from './geo-translation';
import { point, lineString, polygon } from '@turf/helpers';
import { ILatLng } from '../core/models';
import cheapRuler from 'cheap-ruler';

describe('geo translation', () => {
  it('should convert ILatLng to maps LatLng', () => {
    const expectedLatLng = new google.maps.LatLng(40, 55);
    const latLng = fromDispatcherLatLng({
      latitude: 40,
      longitude: 55,
    });
    expect(latLng.lat()).toBe(expectedLatLng.lat());
    expect(latLng.lng()).toBe(expectedLatLng.lng());
  });

  it('should convert IWaypoint to maps LatLng', () => {
    const expectedLatLng = new google.maps.LatLng(40, 55);
    const latLng = fromDispatcherWaypointLatLng({
      sideOfRoad: true,
      location: {
        heading: 5,
        latLng: {
          latitude: 40,
          longitude: 55,
        },
      },
    });

    expect(latLng.lat()).toBe(expectedLatLng.lat());
    expect(latLng.lng()).toBe(expectedLatLng.lng());
  });

  it('should convert maps LatLng to ILatLng', () => {
    const latLng = new google.maps.LatLng(30, 40);

    expect(toDispatcherLatLng(latLng)).toEqual({ latitude: 30, longitude: 40 });
  });

  it('should return null from toDispatcherLatLng', () => {
    expect(toDispatcherLatLng(null)).toBe(null);
  });

  it('should convert coordinates to path', () => {
    const coordinates = [
      [10, 10],
      [45, -5],
      [-30, 44],
    ];
    const converted = coordinatesToPath(coordinates);

    const expected = [
      new google.maps.LatLng(10, 10),
      new google.maps.LatLng(45, -5),
      new google.maps.LatLng(-30, 44),
    ];

    expect(converted.length).toEqual(expected.length);

    converted.forEach((point, i) => {
      expect(point.lat()).toBe(expected[i].lat());
      expect(point.lng()).toBe(expected[i].lng());
    });
  });

  it('should not format null ILatLng as string', () => {
    expect(formatDispatcherLatLng(null)).toBe(null);
  });

  it('should format ILatLng as string', () => {
    expect(formatDispatcherLatLng({ latitude: 100, longitude: -40 })).toBe('100, -40');
  });

  it('should truncate and format ILatLng as string', () => {
    expect(formatDispatcherLatLng({ latitude: 3.141592, longitude: 98.7654321 })).toBe(
      '3.14159, 98.76543'
    );
  });

  it('should convert turf point to Google Maps point', () => {
    const turfPoint = point([-35.4, 50.123]);

    const expected = new google.maps.LatLng(50.123, -35.4);
    const result = fromTurfPoint(turfPoint.geometry);

    expect(result.lat()).toBe(expected.lat());
    expect(result.lng()).toBe(expected.lng());
  });

  it('should convert turf linestring to Google Maps LatLng[]', () => {
    const turfLine = lineString([
      [10, 20],
      [-20, 30],
      [-30, 40],
    ]);

    const expected = [
      new google.maps.LatLng(20, 10),
      new google.maps.LatLng(30, -20),
      new google.maps.LatLng(40, -30),
    ];

    const result = fromTurfRoute(turfLine.geometry);

    expect(result.length).toBe(expected.length);

    result.forEach((latLng, i) => {
      expect(latLng.lat()).toBe(expected[i].lat());
      expect(latLng.lng()).toBe(expected[i].lng());
    });
  });

  it('should convert Google Maps LatLng[] to turf linestring', () => {
    const path = [new google.maps.LatLng(12, 35), new google.maps.LatLng(-20.1, -44.11)];

    const expected = lineString([
      [35, 12],
      [-44.11, -20.1],
    ]);

    const result = toTurfLineString(path);

    expect(result.geometry.coordinates.length).toBe(expected.geometry.coordinates.length);

    result.geometry.coordinates.forEach((coord, i) => {
      expect(coord[0]).toBeCloseTo(expected.geometry.coordinates[i][0]);
      expect(coord[1]).toBeCloseTo(expected.geometry.coordinates[i][1]);
    });
  });

  it('should convert Google Maps LatLng to turf point', () => {
    const latLng = new google.maps.LatLng(50, -35);
    const expected = point([-35, 50]);
    const result = toTurfPoint(latLng);

    expect(result).toEqual(expected);
  });

  it('should convert ILatLng to turf point', () => {
    const latLng: ILatLng = { latitude: -33, longitude: 44 };
    const expected = point([44, -33]);
    const result = fromDispatcherToTurfPoint(latLng);

    expect(result).toEqual(expected);
  });

  it('should convert LatLngBounds to turf polygon', () => {
    const bounds = new google.maps.LatLngBounds({ lat: 12, lng: 34 }, { lat: 56, lng: 78 });
    const expected = polygon([
      [
        [34, 12],
        [78, 12],
        [78, 56],
        [34, 56],
        [34, 12],
      ],
    ]);

    const result = boundsToTurfPolygon(bounds);

    expect(result).toEqual(expected);
  });

  it('should convert Maps polygon to turf polygon', () => {
    const mapsPolygon = new google.maps.Polygon({
      paths: [
        { lat: 10, lng: 10 },
        { lat: 20, lng: 20 },
        { lat: 10, lng: 30 },
      ],
    });
    const expected = polygon([
      [
        [10, 10],
        [20, 20],
        [30, 10],
        [10, 10],
      ],
    ]);
    const result = mapsPolygonToTurfPolygon(mapsPolygon);

    expect(result).toEqual(expected);
  });

  it('should convert Maps LatLng[] to cheap ruler line', () => {
    const path = [new google.maps.LatLng(12, 35), new google.maps.LatLng(-20.1, -44)];
    const expected: cheapRuler.Line = [
      [35, 12],
      [-44, -20.1],
    ];
    const result = toCheapRulerLine(path);

    expect(result).toEqual(expected);
  });

  it('should convert Maps LatLng to cheap rule point', () => {
    const point = new google.maps.LatLng(12, 35);
    const expected: cheapRuler.Point = [35, 12];
    const result = toCheapRulerPoint(point);

    expect(result).toEqual(expected);
  });

  it('should validate latLng string', () => {
    expect(isLatLngString('-50, 10')).toBeTruthy();
    expect(isLatLngString('50.11,-123.456')).toBeTruthy();
    expect(isLatLngString(' 9.1  ,  -33 ')).toBeTruthy();
  });

  it('should not validate invalid latLng strings', () => {
    expect(isLatLngString('-50, abc123')).toBeFalsy();
    expect(isLatLngString('50.11 -123.456')).toBeFalsy();
    expect(isLatLngString('north, south')).toBeFalsy();
    expect(isLatLngString('5, null')).toBeFalsy();
    expect(isLatLngString('false, 123.3')).toBeFalsy();
    expect(isLatLngString('-11.111,     true')).toBeFalsy();
  });

  it('should convert string to ILatLng', () => {
    expect(stringToLatLng('-50, 10')).toEqual({ latitude: -50, longitude: 10 });
    expect(stringToLatLng('50.11,-123.456')).toEqual({ latitude: 50.11, longitude: -123.456 });
    expect(stringToLatLng(' 9.1  ,  -33 ')).toEqual({ latitude: 9.1, longitude: -33 });
  });
});
