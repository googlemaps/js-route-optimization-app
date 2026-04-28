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
import { ILatLng, Vehicle, VisitRequest } from '../models';
import { Observable, of, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

export interface DistanceMatrixEntry {}

export interface DistanceMatrixWaypoint {
  waypoint: {
    location: {
      latLng: ILatLng;
    };
  };
}

export interface DistanceMatrixRequest {
  origins: DistanceMatrixWaypoint[];
  destinations: DistanceMatrixWaypoint[];
  travelMode: string;
  routingPreference: string;
}

export const MAX_CHUNK_SIZE = 25;

@Injectable({ providedIn: 'root' })
export class DistanceMatrixService {
  private apiKey!: string;

  constructor(store: Store<fromRoot.State>, private http: HttpClient) {
    store.pipe(select(selectMapApiKey)).subscribe((apiKey) => (this.apiKey = apiKey));
  }

  generateDistanceMatrices(
    vehicles: Vehicle[],
    visitRequests: VisitRequest[]
  ): Observable<DistanceMatrixEntry[]> {
    const matrixRequests = this.buildDistanceMatrixRequests(vehicles, visitRequests);

    if (matrixRequests.length === 0) {
      return of([]);
    }

    const requests$ = matrixRequests.map((req) => this.requestDistanceMatrix(req));

    return forkJoin(requests$).pipe(map((results) => results.flat()));
  }

  buildDistanceMatrixRequests(
    vehicles: Vehicle[],
    visitRequests: VisitRequest[]
  ): DistanceMatrixRequest[] {
    const vehicleStartLocations: ILatLng[] = vehicles
      .map((v) => v.startWaypoint?.location?.latLng)
      .filter((loc) => !!loc);

    const visitRequestLocations: ILatLng[] = visitRequests
      .map((vr) => vr.arrivalWaypoint?.location?.latLng)
      .filter((loc) => !!loc);

    const origins = [...vehicleStartLocations, ...visitRequestLocations].map((loc) =>
      this.toWaypoint(loc)
    );
    const destinations = visitRequestLocations.map((loc) => this.toWaypoint(loc));

    return this.createMatrixRequests(origins, destinations);
  }

  private createMatrixRequests(
    origins: DistanceMatrixWaypoint[],
    destinations: DistanceMatrixWaypoint[]
  ): DistanceMatrixRequest[] {
    const requests: DistanceMatrixRequest[] = [];

    for (let i = 0; i < origins.length; i += MAX_CHUNK_SIZE) {
      const originChunk = origins.slice(i, i + MAX_CHUNK_SIZE);
      for (let j = 0; j < destinations.length; j += MAX_CHUNK_SIZE) {
        const destChunk = destinations.slice(j, j + MAX_CHUNK_SIZE);
        requests.push({
          origins: originChunk,
          destinations: destChunk,
          travelMode: 'DRIVE',
          routingPreference: 'TRAFFIC_AWARE',
        });
      }
    }

    return requests;
  }

  private toWaypoint(loc: ILatLng): DistanceMatrixWaypoint {
    return { waypoint: { location: { latLng: loc } } };
  }

  private requestDistanceMatrix(request: DistanceMatrixRequest): Observable<any> {
    return this.http.post(
      'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
          'X-Goog-FieldMask':
            'originIndex,destinationIndex,duration,distanceMeters',
        },
      }
    );
  }
}
