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

const SIMPLIFY_ROUTE_TOLERANCE = 0.0002;
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
