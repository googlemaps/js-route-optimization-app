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
