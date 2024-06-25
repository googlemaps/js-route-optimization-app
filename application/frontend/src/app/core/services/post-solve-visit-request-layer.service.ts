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
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import {
  selectFilteredVisitRequestsSelected,
  selectMouseOverVisitRequests,
  selectFilteredVisitRequestsWithStopOrder,
} from '../selectors/post-solve-visit-request-layer.selectors';
import { BaseVisitRequestLayer } from './base-visit-request-layer.service';
import { MapService } from './map.service';
import { TextLayer } from '@deck.gl/layers';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVisitRequestLayer extends BaseVisitRequestLayer {
  readonly minZoom = 11;

  canShowTextLayer = false;

  readonly capsuleIconSize: [number, number] = [302, 96];
  private capsuleIconMapping = {};

  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);

    this.capsuleIconMapping = this.createIconMapping(this.capsuleIconSize);

    combineLatest([
      this.store.pipe(select(selectFilteredVisitRequestsWithStopOrder)),
      this.mapService.zoomChanged$,
    ]).subscribe(([visitRequests, zoom]) => {
      this.canShowTextLayer = zoom >= this.minZoom;
      this.onDataFiltered(visitRequests);
    });

    combineLatest([
      this.store.pipe(select(selectFilteredVisitRequestsSelected)),
      this.mapService.zoomChanged$,
    ]).subscribe(([visitRequests, zoom]) => {
      this.canShowTextLayer = zoom >= this.minZoom;
      this.onDataSelected(visitRequests);
    });

    combineLatest([
      this.store.pipe(select(selectMouseOverVisitRequests)),
      this.mapService.zoomChanged$
    ]).subscribe(([visitRequests, zoom]) => {
      this.canShowTextLayer = zoom >= this.minZoom;
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

  protected getIconAtlas(): string {
    return this.canShowTextLayer
      ? './assets/images/dropoff_pickup_label_sprite.png'
      : super.getIconAtlas();
  }

  protected getIconMapping(): any {
    return this.canShowTextLayer ? this.capsuleIconMapping : this.iconMapping;
  }

  protected onDataFiltered(data): void {
    this.labelLayer = new TextLayer({
      id: `${this.layerId}-label`,
      data,
      fontFamily: 'Google Sans, Roboto, "Helvetica Neue", sans-serif',
      getPosition: (d) => d.arrivalPosition,
      getTextAnchor: 'middle',
      getSize: 16,
      getColor: [255, 255, 255],
      getText: (d) => `${d.stopOrder}`,
      getPixelOffset: [6, 1],
      visible: this.canShowTextLayer,
    });
    super.onDataFiltered(data);
  }
}
