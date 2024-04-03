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
import { Observable, combineLatest, throwError } from 'rxjs';
import { map, mergeMap, first, catchError } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import * as fromConfig from '../selectors/config.selectors';
import { Scenario } from '../models';
import { OptimizeToursRequest, OptimizeToursResponse } from 'src/app/core/models';
import { ElapsedSolution } from '../models/elapsed-solution';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { durationSeconds } from 'src/app/util';

/**
 * Client service wrapper for Dispatcher API around a gRPC-Web client
 */
@Injectable({
  providedIn: 'root',
})
export class DispatcherClient {
  private readonly apiRoot$: Observable<string>;

  constructor(store: Store<fromRoot.State>, private http: HttpClient) {
    this.apiRoot$ = store.pipe(select(fromConfig.selectBackendApiRoot), first());
  }

  optimizeTours(scenario: Scenario, batchTime: number): Observable<ElapsedSolution> {
    const requestOptions = {
      populatePolylines: true,
    };
    return this.makeRequest(scenario, batchTime, requestOptions);
  }

  private makeRequest(scenario: Scenario, batchTime: number, options): Observable<ElapsedSolution> {
    const request$: Observable<OptimizeToursRequest> = this.makeOptimizeToursRequest(
      scenario,
      options
    );
    const requestTime = Date.now();

    return combineLatest([this.apiRoot$, request$]).pipe(
      first(),
      mergeMap(([apiRoot, request]) => {
        const startTime = Date.now();
        let headers = new HttpHeaders();
        if (request.timeout) {
          headers = headers.set('x-server-timeout', durationSeconds(request.timeout).toString());
        }

        // send CFR request to backend
        return this.http
          .post<OptimizeToursResponse>(
            `${apiRoot}/optimization/fleet-routing/optimize-tours`,
            request,
            { headers }
          )
          .pipe(
            map((response) => {
              const solution = OptimizeToursResponse.toObject(response);
              const timeOfResponse = Date.now();
              return {
                scenario: request,
                solution,
                elapsedTime: timeOfResponse - startTime,
                requestTime,
                timeOfResponse,
                batchTime,
              };
            })
          );
      }),
      catchError((error) => {
        return throwError({ ...error, requestTime });
      })
    );
  }

  private makeOptimizeToursRequest(scenario: Scenario, options): Observable<OptimizeToursRequest> {
    return new Observable<OptimizeToursRequest>((observer) => {
      try {
        const request = OptimizeToursRequest.fromObject({ ...scenario, ...options });
        observer.next(request);
        observer.complete();
      } catch (error) {
        observer.error(error);
      }
    });
  }
}
