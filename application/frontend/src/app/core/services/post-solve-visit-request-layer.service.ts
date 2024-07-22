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
  selectMouseOverVisitRequests,
  selectFilteredVisitRequestsSelectedWithStopOrder,
  selectFilteredVisitRequestsWithStopOrder,
} from '../selectors/post-solve-visit-request-layer.selectors';
import { BaseVisitRequestLayer } from './base-visit-request-layer.service';
import { MapService } from './map.service';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVisitRequestLayer extends BaseVisitRequestLayer {
  readonly minZoom = 11;

  layerId = 'post-solve-visit-requests';

  canShowTextLayer = false;

  readonly capsuleIconSize: [number, number] = [78, 24.85714285714285];
  private capsuleIconMapping = {};

  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);

    this.createLabeledIconMapping();

    combineLatest([
      this.store.pipe(select(selectFilteredVisitRequestsWithStopOrder)),
      this.mapService.zoomChanged$,
    ]).subscribe(([visitRequests, zoom]) => {
      this.canShowTextLayer = zoom >= this.minZoom;
      this.onDataFiltered(visitRequests);
    });

    combineLatest([
      this.store.pipe(select(selectFilteredVisitRequestsSelectedWithStopOrder)),
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

  createLabeledIconMapping(): any {
    this.capsuleIconMapping = {};
    // dynamically create icon mapping based on sprite
    for (let i = 0; i < this.iconMappingOrder.length; i++) {
      for (let stopOrder = 1; stopOrder < 101; stopOrder++) {
        const icon = `${this.iconMappingOrder[i]}-${stopOrder}`;
        this.capsuleIconMapping[icon] = {
          x: this.capsuleIconSize[0] * (stopOrder - 1),
          y: this.capsuleIconSize[1] * i,
          width: this.capsuleIconSize[0],
          // clip height by 1 pixel to reduce a noticeable artifact that's more
          // prominent on deliveries when zoomed out
          height: this.capsuleIconSize[1],
        };
      }
    }
  }

  getDefaultIconFn(data: any): string {
    if (!this.canShowTextLayer) {
      return data.pickup ? `pickup-${this.defaultColor}` : `dropoff-${this.defaultColor}`;
    }
    const stopOrder = Math.min(data.stopOrder, 100);
    return data.made
      ? data.pickup
        ? `pickup-${this.defaultColor}-${stopOrder}`
        : `dropoff-${this.defaultColor}-${stopOrder}`
      : data.pickup
      ? `pickup-${this.defaultColor}-skipped-${stopOrder}`
      : `dropoff-${this.defaultColor}-skipped-${stopOrder}`;
  }

  protected getIconAtlas(): string {
    return this.canShowTextLayer
      ? './assets/images/labeled_dropoffs_pickups.png'
      : super.getIconAtlas();
  }

  protected getSizeScale(): number {
    return this.canShowTextLayer ? 2.0 : super.getSizeScale();
  }

  protected getIconMapping(): any {
    return this.canShowTextLayer ? this.capsuleIconMapping : this.iconMapping;
  }

  protected getIcon(data: any): string {
    if (!this.canShowTextLayer) {
      return super.getIcon(data);
    }

    // Clamp to 100, whereafter all labels are "99+"
    const stopOrder = Math.min(data.stopOrder, 100);
    const color = (data.color && data.color.name) || this.defaultSelectedColor;
    const key = data.pickup ? `pickup-${color}-${stopOrder}` : `dropoff-${color}-${stopOrder}`;
    return key;
  }
}
