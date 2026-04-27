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
import { Observable, of } from 'rxjs';

export interface DistanceMatrixEntry {}

export interface DistanceMatrixPair {
  origin: { waypoint: { location: ILatLng } };
  destination: { waypoint: { location: ILatLng } };
}

export type DistanceMatrixChunk = DistanceMatrixPair[];

const MAX_CHUNK_SIZE = 25 * 25;

@Injectable({ providedIn: 'root' })
export class DistanceMatrixService {
  private apiKey!: string;

  constructor(store: Store<fromRoot.State>) {
    store.pipe(select(selectMapApiKey)).subscribe((apiKey) => (this.apiKey = apiKey));
  }

  generateDistanceMatrices(
    vehicles: Vehicle[],
    visitRequests: VisitRequest[]
  ): Observable<DistanceMatrixEntry[]> {
    const vehicleStartLocations: ILatLng[] = vehicles
      .map((v) => v.startWaypoint?.location?.latLng)
      .filter((loc) => !!loc);

    const visitRequestLocations: ILatLng[] = visitRequests
      .map((vr) => vr.arrivalWaypoint?.location?.latLng)
      .filter((loc) => !!loc);

    const origins: ILatLng[] = [...vehicleStartLocations, ...visitRequestLocations];
    const destinations: ILatLng[] = [...visitRequestLocations];

    const matrixChunks = this.createMatrixChunks(origins, destinations);

    return of(matrixChunks);
  }

  private createMatrixChunks(origins: ILatLng[], destinations: ILatLng[]): DistanceMatrixChunk[] {
    const allPairs: DistanceMatrixPair[] = [];
    origins.forEach((origin) => {
      destinations.forEach((destination) => {
        allPairs.push({
          origin: this.toWaypoint(origin),
          destination: this.toWaypoint(destination),
        });
      });
    });

    const chunks: DistanceMatrixChunk[] = [];
    for (let i = 0; i < allPairs.length; i += MAX_CHUNK_SIZE) {
      chunks.push(allPairs.slice(i, i + MAX_CHUNK_SIZE));
    }

    return chunks;
  }

  private toWaypoint(loc: ILatLng): { waypoint: { location: ILatLng } } {
    return { waypoint: { location: loc } };
  };
}
