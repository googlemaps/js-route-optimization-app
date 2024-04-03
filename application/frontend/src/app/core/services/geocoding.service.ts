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

import { Injectable } from '@angular/core';
import { Store, select } from '@ngrx/store';

import * as fromRoot from 'src/app/reducers';
import { selectMapApiKey } from '../selectors/config.selectors';

const STATUS_TO_MESSAGE = {
  ERROR: 'Server error',
  INVALID_REQUEST: 'Invalid request',
  OK: 'Success',
  OVER_QUERY_LIMIT: 'Rate limit exceeded',
  REQUEST_DENIED: 'Request denied',
  UNKNOWN_ERROR: 'Unknown error',
  ZERO_RESULTS: 'No results found',
};

export interface GeocodingJsonLatLng {
  lat: number;
  lng: number;
}

export interface GeocodingJsonResult {
  address_components: {
    long_name: string;
    short_name: string;
    types: string[];
  }[];
  formatted_address: string;
  geometry: {
    location: GeocodingJsonLatLng;
    location_type: string;
    viewport: {
      northeast: GeocodingJsonLatLng;
      southwest: GeocodingJsonLatLng;
    };
  };
  place_id: string;
  plus_code: {
    compound_code: string;
    global_code: string;
  };
  types: string[];
}

export interface GeocodingJsonResponse {
  status: string;
  results: GeocodingJsonResult[];
}

@Injectable({ providedIn: 'root' })
export class GeocodingService {
  private apiKey: string;

  private geocodeCache: {
    [address: string]: GeocodingJsonResult[];
  } = {};

  constructor(store: Store<fromRoot.State>) {
    store.pipe(select(selectMapApiKey)).subscribe((apiKey) => (this.apiKey = apiKey));
  }

  private async geocodeAddressWithBackoff(
    address: string,
    resolve,
    reject,
    retryCount = 0
  ): Promise<void> {
    let status = 'UNKNOWN_ERROR';
    try {
      const encodedAddress = encodeURIComponent(address);
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${this.apiKey}`
      );

      const body = (await response.json()) as GeocodingJsonResponse;
      status = body.status;

      // success
      if (status === google.maps.GeocoderStatus.OK) {
        this.geocodeCache[address] = body.results;
        return resolve(body.results);
      }

      // zero results
      if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
        this.geocodeCache[address] = null;
        return resolve(null);
      }

      // non-transient errors (i.e. retrying won't fix)
      if (
        status === google.maps.GeocoderStatus.INVALID_REQUEST ||
        status === google.maps.GeocoderStatus.REQUEST_DENIED
      ) {
        return reject(STATUS_TO_MESSAGE[status]);
      }
    } catch (error) {
      try {
        const body = await error.json();
        if (body.status && Object.keys(STATUS_TO_MESSAGE).includes(body.status)) {
          status = body.status;
        }
      } catch {
        /* do nothing */
      }
    }

    // retry transient errors
    if (retryCount <= 10) {
      const delay = 10 + 2 ** retryCount; // exponential backoff
      setTimeout(
        () => this.geocodeAddressWithBackoff(address, resolve, reject, retryCount + 1),
        delay
      );
    } else {
      reject(STATUS_TO_MESSAGE[status]);
    }
  }

  async geocodeAddress(address: string): Promise<GeocodingJsonResult[] | null> {
    return new Promise((resolve, reject) => {
      if (Object.keys(this.geocodeCache).includes(address)) {
        return resolve(this.geocodeCache[address]);
      }

      this.geocodeAddressWithBackoff(address, resolve, reject);
    });
  }
}
