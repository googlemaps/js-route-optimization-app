/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import along from '@turf/along';
import simplify from '@turf/simplify';
import lineSlice from '@turf/line-slice';
import length from '@turf/length';
import * as cheapRuler from '../../../node_modules/cheap-ruler';
import { feature, LineString, Point, FeatureCollection, Units } from '@turf/helpers';
import {
  fromTurfPoint,
  toTurfLineString,
  toTurfPoint,
  fromTurfRoute,
  toCheapRulerLine,
  toCheapRulerPoint,
} from 'src/app/util/geo-translation';
import buffer from '@turf/buffer';

const SIMPLIFY_ROUTE_TOLERANCE = 0.0001;
const RULER = cheapRuler(0, 'meters');

export const getPointAlongPathByDistance = (
  path: google.maps.LatLng[],
  distance: number
): google.maps.LatLng => {
  const turfPoint = along(toTurfLineString(path), distance, { units: 'meters' });
  return fromTurfPoint(turfPoint.geometry);
};

export const findNearestCandidatePointToTargetAlongPath = (
  candidatePoints: FeatureCollection<Point>,
  target: Point,
  route: LineString
): google.maps.LatLng => {
  let nearest: google.maps.LatLng;
  let minDistance = length(feature(route));
  candidatePoints.features.forEach((intersectingPoint) => {
    const sliced = lineSlice(target, intersectingPoint, route);
    if (length(sliced) <= minDistance) {
      minDistance = length(sliced);
      nearest = fromTurfPoint(intersectingPoint.geometry);
    }
  });
  return nearest;
};

export const getIndexAlongPathByPointOptimized = (
  line: cheapRuler.Line,
  point: cheapRuler.Point
): number => {
  return RULER.pointOnLine(line, point).index;
};

export const computeHeadingAlongPath = (
  from: google.maps.LatLng,
  to: google.maps.LatLng
): number => {
  return google.maps.geometry.spherical.computeHeading(from, to);
};

export const findPathHeadingAtPointOptimized = (
  path: google.maps.LatLng[],
  location: google.maps.LatLng
): number => {
  const fromIdx = RULER.pointOnLine(toCheapRulerLine(path), toCheapRulerPoint(location)).index;
  const toIdx = Math.min(fromIdx + 1, path.length - 1);
  return computeHeadingAlongPath(path[fromIdx], path[toIdx]);
};

export const decodePath = (encoded: string): google.maps.LatLng[] => {
  return google.maps.geometry.encoding.decodePath(encoded);
};

export const simplifyPath = (path: google.maps.LatLng[]): google.maps.LatLng[] => {
  const simplified = simplify(toTurfLineString(path), {
    tolerance: SIMPLIFY_ROUTE_TOLERANCE,
    mutate: true,
  });
  return fromTurfRoute(simplified.geometry);
};

export const pointsAreCoincident = (
  pointA: google.maps.LatLng,
  pointB: google.maps.LatLng,
  tolerance?: number
): boolean => {
  return tolerance
    ? google.maps.geometry.spherical.computeDistanceBetween(pointA, pointB) <= tolerance
    : pointA && pointB && pointA.lat() === pointB.lat() && pointA.lng() === pointB.lng();
};

export const toPointBounds = (
  latLng: google.maps.LatLng,
  bufferDistance: number,
  bufferUnits: Units = 'meters'
): google.maps.LatLngBounds => {
  const bounds = new google.maps.LatLngBounds();
  if (latLng) {
    buffer(toTurfPoint(latLng), bufferDistance, { units: bufferUnits } as {
      units: any;
    }).geometry.coordinates.forEach((path) => {
      path.forEach((position) => bounds.extend({ lat: position[1], lng: position[0] }));
    });
  }
  return bounds;
};

export const bufferBounds = (
  latLngBounds: google.maps.LatLngBounds,
  bufferDistance: number,
  bufferUnits: Units = 'meters'
): google.maps.LatLngBounds => {
  const bounds = toPointBounds(latLngBounds.getNorthEast(), bufferDistance, bufferUnits);
  return bounds.union(toPointBounds(latLngBounds.getSouthWest(), bufferDistance, bufferUnits));
};
