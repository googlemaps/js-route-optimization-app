/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { ILatLng } from '../core/models';

export function getBounds(locations: ILatLng[] = []): google.maps.LatLngBounds {
  const bounds = { minLon: 180, minLat: 90, maxLon: -180, maxLat: -90 };
  for (const location of locations) {
    if (!location) {
      continue;
    }
    if (bounds.minLat > location.latitude) {
      bounds.minLat = location.latitude;
    }
    if (bounds.maxLat < location.latitude) {
      bounds.maxLat = location.latitude;
    }
    if (bounds.minLon > location.longitude) {
      bounds.minLon = location.longitude;
    }
    if (bounds.maxLon < location.longitude) {
      bounds.maxLon = location.longitude;
    }
  }
  if (bounds.minLon <= bounds.maxLon && bounds.minLat <= bounds.maxLat) {
    const sw = { lat: bounds.minLat, lng: bounds.minLon };
    const ne = { lat: bounds.maxLat, lng: bounds.maxLon };
    return new google.maps.LatLngBounds(sw, ne);
  }
  return new google.maps.LatLngBounds();
}
