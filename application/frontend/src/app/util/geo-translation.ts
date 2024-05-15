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
