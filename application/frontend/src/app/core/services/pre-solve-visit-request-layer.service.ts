/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable, NgZone } from '@angular/core';
import { MapService } from './map.service';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { BaseVisitRequestLayer as BaseVisitRequestLayer } from './base-visit-request-layer.service';
import {
  selectFilteredVisitRequests,
  selectFilteredVisitRequestsSelected,
  selectMouseOverVisitRequest,
} from '../selectors/pre-solve-visit-request-layer.selectors';

@Injectable({
  providedIn: 'root',
})
export class PreSolveVisitRequestLayer extends BaseVisitRequestLayer {
  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);
    this.store.pipe(select(selectFilteredVisitRequests)).subscribe((visitRequests) => {
      this.onDataFiltered(visitRequests);
    });

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
