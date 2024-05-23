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

import { Injectable, NgZone } from '@angular/core';
import { MapService } from './map.service';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { BaseVisitRequestLayer as BaseVisitRequestLayer } from './base-visit-request-layer.service';
import {
  selectFilteredVisitRequestsSelected,
  selectMouseOverVisitRequest,
} from '../selectors/pre-solve-visit-request-layer.selectors';

@Injectable({
  providedIn: 'root',
})
export class PreSolveVisitRequestLayer extends BaseVisitRequestLayer {
  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);

    this.store.pipe(select(selectFilteredVisitRequestsSelected)).subscribe((visitRequests) => {
      this.onDataSelected(visitRequests);
    });

    this.store.pipe(select(selectMouseOverVisitRequest)).subscribe((visitRequests) => {
      this.onDataMouseOver(visitRequests);
    });
  }

  layerId = 'pre-solve-visit-requests';
  getDefaultIconFn(data: any): string {
    return data.pickup ? `pickup-${this.defaultColor}` : `dropoff-${this.defaultColor}`;
  }
}
