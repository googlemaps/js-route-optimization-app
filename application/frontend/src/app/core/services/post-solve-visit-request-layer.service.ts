/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable, NgZone } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import {
  selectFilteredVisitRequests,
  selectFilteredVisitRequestsSelected,
  selectMouseOverVisitRequest,
} from '../selectors/post-solve-visit-request-layer.selectors';
import { BaseVisitRequestLayer } from './base-visit-request-layer.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVisitRequestLayer extends BaseVisitRequestLayer {
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

  layerId = 'post-solve-visit-requests';
  getDefaultIconFn(data: any): string {
    return data.made
      ? data.pickup
        ? `pickup-${this.defaultColor}`
        : `dropoff-${this.defaultColor}`
      : data.pickup
      ? `pickup-${this.defaultColor}-skipped`
      : `dropoff-${this.defaultColor}-skipped`;
  }
}
