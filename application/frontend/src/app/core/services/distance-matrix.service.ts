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
import { Shipment, Vehicle } from '../models';
import { Observable, of } from 'rxjs';

export interface DistanceMatrixEntry {}

@Injectable({ providedIn: 'root' })
export class DistanceMatrixService {
  private apiKey: string;

  constructor(store: Store<fromRoot.State>) {
    store.pipe(select(selectMapApiKey)).subscribe((apiKey) => (this.apiKey = apiKey));
  }

  generateDistanceMatrices(
    vehicles: Vehicle[],
    shipments: Shipment[]
  ): Observable<DistanceMatrixEntry[]> {
    return of([]);
  }
}
