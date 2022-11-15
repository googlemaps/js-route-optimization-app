/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Polygon, Point, LineString, Feature, point, lineString, polygon } from '@turf/helpers';
import * as cheapRuler from '../../../node_modules/cheap-ruler';
import { ILatLng, IWaypoint } from '../core/models';

export function fromDispatcherLatLng(vertex: ILatLng): google.maps.LatLng {
  return new google.maps.LatLng(vertex.latitude, vertex.longitude);
}

export function fromDispatcherWaypointLatLng(vertex: IWaypoint): google.maps.LatLng {
  return new google.maps.LatLng(vertex.location.latLng.latitude, vertex.location.latLng.longitude);
}

export function toDispatcherLatLng(vertex: google.maps.LatLng): ILatLng {
  if (!vertex) {
    return null;
  }

  return { latitude: vertex.lat(), longitude: vertex.lng() };
}

export function coordinatesToPath(coordinates: number[][]): google.maps.LatLng[] {
  return coordinates.map((coord) => {
    return new google.maps.LatLng(coord[0], coord[1]);
  });
}

export function formatDispatcherLatLng(location: ILatLng): string {
  if (location) {
    return (
      Math.round(location.latitude * 100000) / 100000 +
      ', ' +
      Math.round(location.longitude * 100000) / 100000
    );
  }
  return null;
}

// Turf
export function fromTurfPoint(turfPoint: Point): google.maps.LatLng {
  return new google.maps.LatLng(turfPoint.coordinates[1], turfPoint.coordinates[0]);
}

export function fromTurfRoute(route: LineString): google.maps.LatLng[] {
  return route.coordinates.map((coord) => {
    return new google.maps.LatLng(coord[1], coord[0]);
  });
}

export function toTurfLineString(path: google.maps.LatLng[]): Feature<LineString> {
  const vertices = path.map((vertex) => {
    return [vertex.lng(), vertex.lat()];
  });
  return lineString(vertices);
}

export function toTurfPoint(vertex: google.maps.LatLng): Feature<Point> {
  return point([vertex.lng(), vertex.lat()]);
}

export function fromDispatcherToTurfPoint(vertex: ILatLng): Feature<Point> {
  return point([vertex.longitude, vertex.latitude]);
}

export function boundsToTurfPolygon(
  bounds: google.maps.LatLngBounds
): Feature<Polygon, { [name: string]: any }> {
  const ne = [bounds.getNorthEast().lng(), bounds.getNorthEast().lat()];
  const nw = [bounds.getSouthWest().lng(), bounds.getNorthEast().lat()];
  const sw = [bounds.getSouthWest().lng(), bounds.getSouthWest().lat()];
  const se = [bounds.getNorthEast().lng(), bounds.getSouthWest().lat()];
  return polygon([[sw, se, ne, nw, sw]]);
}

export function mapsPolygonToTurfPolygon(
  poly: google.maps.Polygon
): Feature<Polygon, { [name: string]: any }> {
  const path = poly.getPath();
  const vertices = [];
  path.forEach((latLng) => {
    vertices.push([latLng.lng(), latLng.lat()]);
  });
  vertices.push([path.getAt(0).lng(), path.getAt(0).lat()]);
  return polygon([vertices]);
}

// Cheap Ruler
export function toCheapRulerLine(path: google.maps.LatLng[]): cheapRuler.Line {
  return path.map((coord) => [coord.lng(), coord.lat()]);
}

export function toCheapRulerPoint(vertex: google.maps.LatLng): cheapRuler.Point {
  return [vertex.lng(), vertex.lat()];
}

export function isLatLngString(str: string): boolean {
  const split = str.split(',');

  if (split.length !== 2) {
    return false;
  }

  const latitude = parseFloat(split[0].trim());
  const longitude = parseFloat(split[1].trim());

  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return false;
  }

  return true;
}

export function stringToLatLng(str: string): ILatLng {
  if (!isLatLngString(str)) {
    return null;
  }

  const split = str.split(',');
  const latitude = parseFloat(split[0].trim());
  const longitude = parseFloat(split[1].trim());

  return {
    latitude,
    longitude,
  };
}
