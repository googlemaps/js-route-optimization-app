/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { MapService } from './map.service';

export const PLACEID_REGEX = /^[A-Za-z0-9\-_]{27,}$/;

/**
 * check if `text` matches the expected pattern of a google maps place id (i.e. `PLACEID_REGEX`)
 */
export function isPlaceId(text: string): boolean {
  return PLACEID_REGEX.test(text);
}

@Injectable({ providedIn: 'root' })
export class PlacesService {
  private places: google.maps.places.PlacesService;

  private detailsCache: {
    [placeId: string]: google.maps.places.PlaceResult;
  } = {};

  constructor(private mapService: MapService) {}

  private init(): void {
    if (!this.places) {
      this.places = new google.maps.places.PlacesService(this.mapService.map);
    }
  }

  createAutocomplete(
    input: HTMLInputElement,
    options?: google.maps.places.AutocompleteOptions
  ): google.maps.places.Autocomplete {
    return new google.maps.places.Autocomplete(input, options);
  }

  private getDetailsWithBackoff(
    placeId: string,
    fields: string[],
    resolve,
    reject,
    retryCount = 0
  ): void {
    this.places.getDetails({ placeId, fields }, (result, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        this.detailsCache[placeId] = result;
        return resolve(result);
      }

      if (retryCount <= 10) {
        const delay = 10 + 2 ** retryCount; // exponential backoff
        setTimeout(
          () => this.getDetailsWithBackoff(placeId, fields, resolve, reject, retryCount + 1),
          delay
        );
      } else {
        reject(status);
      }
    });
  }

  async getDetails(
    placeId: string,
    fields: string[] = ['formatted_address', 'geometry', 'name', 'place_id']
  ): Promise<google.maps.places.PlaceResult> {
    this.init();

    return new Promise((resolve, reject) => {
      if (!isPlaceId(placeId)) {
        return reject('Invalid Place ID');
      }

      if (Object.keys(this.detailsCache).includes(placeId)) {
        return resolve(this.detailsCache[placeId]);
      }

      this.getDetailsWithBackoff(placeId, fields, resolve, reject);
    });
  }
}
