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
import Long from 'long';

import * as fromRoot from 'src/app/reducers';
import { selectMapApiKey } from '../selectors/config.selectors';
import { ILatLng, Vehicle, VisitRequest } from '../models';
import { Observable, of, forkJoin, timer } from 'rxjs';
import { map, retryWhen, mergeMap, scan } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

export interface DistanceMatrixResult {
  distanceMeters: number;
  durationSeconds: number;
  originType: 'vehicle' | 'visitRequest';
  originEntityId: number;
  destinationEntityId: number;
}

interface ApiResponse {
  originIndex: number;
  destinationIndex: number;
  distanceMeters: number;
  duration: string;
}

interface ChunkedRequest {
  request: DistanceMatrixRequest;
  originOffset: number;
  destinationOffset: number;
}

interface OriginEntityInfo {
  id: number;
  type: 'vehicle' | 'visitRequest';
}

interface BuiltRequests {
  chunkedRequests: ChunkedRequest[];
  originEntities: OriginEntityInfo[];
  destinationEntityIds: number[];
}

interface DistanceMatrixWaypoint {
  waypoint: {
    location: {
      latLng: ILatLng;
    };
  };
}

export interface DistanceMatrixRequest {
  origins: DistanceMatrixWaypoint[];
  destinations: DistanceMatrixWaypoint[];
  travelMode: 'DRIVE';
  routingPreference: 'TRAFFIC_AWARE_OPTIMAL' | 'TRAFFIC_UNAWARE';
  departureTime: string;
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
    visitRequests: VisitRequest[],
    startTimeSeconds: Long,
    considerTraffic: boolean
  ): Observable<DistanceMatrixResult[]> {
    const departureTime = new Date(startTimeSeconds.toNumber() * 1000).toISOString();
    const { chunkedRequests, originEntities, destinationEntityIds } =
      this.buildDistanceMatrixRequests(vehicles, visitRequests, departureTime, considerTraffic);

    if (chunkedRequests.length === 0) {
      return of([]);
    }

    const requests$ = chunkedRequests.map((chunked) =>
      this.requestDistanceMatrix(chunked.request).pipe(
        map((apiEntries: ApiResponse[]) =>
          this.mapApiResponse(apiEntries, chunked, originEntities, destinationEntityIds)
        )
      )
    );

    return forkJoin(requests$).pipe(map((results) => results.flat()));
  }

  buildDistanceMatrixRequests(
    vehicles: Vehicle[],
    visitRequests: VisitRequest[],
    departureTime: string,
    considerTraffic: boolean
  ): BuiltRequests {
    const originEntities: OriginEntityInfo[] = [];
    const originWaypoints: DistanceMatrixWaypoint[] = [];

    for (const vehicle of vehicles) {
      const loc = vehicle.startWaypoint?.location?.latLng;
      if (loc) {
        originEntities.push({ id: vehicle.id, type: 'vehicle' });
        originWaypoints.push(this.toWaypoint(loc));
      }
    }

    for (const vr of visitRequests) {
      const loc = vr.arrivalWaypoint?.location?.latLng;
      if (loc) {
        originEntities.push({ id: vr.id, type: 'visitRequest' });
        originWaypoints.push(this.toWaypoint(loc));
      }
    }

    const destinationEntityIds: number[] = [];
    const destinationWaypoints: DistanceMatrixWaypoint[] = [];

    for (const vr of visitRequests) {
      const loc = vr.arrivalWaypoint?.location?.latLng;
      if (loc) {
        destinationEntityIds.push(vr.id);
        destinationWaypoints.push(this.toWaypoint(loc));
      }
    }

    const chunkedRequests = this.createMatrixRequests(
      originWaypoints,
      destinationWaypoints,
      departureTime,
      considerTraffic
    );

    return { chunkedRequests, originEntities, destinationEntityIds };
  }

  private mapApiResponse(
    apiEntries: ApiResponse[],
    chunked: ChunkedRequest,
    originEntities: OriginEntityInfo[],
    destinationEntityIds: number[]
  ): DistanceMatrixResult[] {
    return apiEntries.map((entry) => {
      const globalOriginIndex = entry.originIndex + chunked.originOffset;
      const globalDestinationIndex = entry.destinationIndex + chunked.destinationOffset;
      const originEntity = originEntities[globalOriginIndex];

      return {
        distanceMeters: entry.distanceMeters,
        durationSeconds: parseInt(entry.duration),
        originType: originEntity.type,
        originEntityId: originEntity.id,
        destinationEntityId: destinationEntityIds[globalDestinationIndex],
      };
    });
  }

  private createMatrixRequests(
    origins: DistanceMatrixWaypoint[],
    destinations: DistanceMatrixWaypoint[],
    departureTime: string,
    considerTraffic: boolean
  ): ChunkedRequest[] {
    const chunkedRequests: ChunkedRequest[] = [];
    const routingPreference = considerTraffic ? 'TRAFFIC_AWARE_OPTIMAL' : 'TRAFFIC_UNAWARE';

    for (let i = 0; i < origins.length; i += MAX_CHUNK_SIZE) {
      const originChunk = origins.slice(i, i + MAX_CHUNK_SIZE);
      for (let j = 0; j < destinations.length; j += MAX_CHUNK_SIZE) {
        const destChunk = destinations.slice(j, j + MAX_CHUNK_SIZE);
        chunkedRequests.push({
          request: {
            origins: originChunk,
            destinations: destChunk,
            travelMode: 'DRIVE',
            routingPreference,
            departureTime,
          },
          originOffset: i,
          destinationOffset: j,
        });
      }
    }

    return chunkedRequests;
  }

  private toWaypoint(loc: ILatLng): DistanceMatrixWaypoint {
    return { waypoint: { location: { latLng: loc } } };
  }

  private requestDistanceMatrix(request: DistanceMatrixRequest): Observable<ApiResponse[]> {
    const maxRetries = 10;

    return this.http
      .post<ApiResponse[]>(
        'https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix',
        request,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': this.apiKey,
            'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters',
          },
        }
      )
      .pipe(
        retryWhen((errors) =>
          errors.pipe(
            scan((retryCount: number, error: HttpErrorResponse) => {
              const isRetryable =
                error.status === 429 || (error.status >= 500 && error.status < 600);
              if (retryCount >= maxRetries || !isRetryable) {
                throw error;
              }
              return retryCount + 1;
            }, 0),
            mergeMap((retryCount: number) => {
              const delayMs = 100 + Math.pow(2, retryCount);
              return timer(delayMs);
            })
          )
        )
      );
  }
}
