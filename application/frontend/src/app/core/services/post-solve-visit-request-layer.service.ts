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
  selectFilteredVisitRequestsWithStopOrderAndSelectionStatus,
} from '../selectors/post-solve-visit-request-layer.selectors';
import { BaseVisitRequestLayer } from './base-visit-request-layer.service';
import { MapService } from './map.service';
import { combineLatest } from 'rxjs';
import { IconLayer } from '@deck.gl/layers';
import { UIActions } from '../actions';

@Injectable({
  providedIn: 'root',
})
export class PostSolveVisitRequestLayer extends BaseVisitRequestLayer {
  readonly minZoom = 12;

  layerId = 'post-solve-visit-requests';

  canShowTextLayer = false;

  readonly capsuleIconSize: [number, number] = [78, 24.85714285714285];
  private capsuleIconMapping = {};
  private unselectedLayer: IconLayer = new IconLayer({});

  constructor(mapService: MapService, store: Store<State>, zone: NgZone) {
    super(mapService, store, zone);

    this.createLabeledIconMapping();

    combineLatest([
      this.store.pipe(select(selectFilteredVisitRequestsWithStopOrderAndSelectionStatus)),
      this.mapService.zoomChanged$,
    ]).subscribe(([visitRequests, zoom]) => {
      this.canShowTextLayer = zoom >= this.minZoom;
      this.onDataFiltered(visitRequests);
      this.onDataSelected(visitRequests.filter((vr) => vr.selected));
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
      for (let stopOrder = 0; stopOrder < 101; stopOrder++) {
        const icon = `${this.iconMappingOrder[i]}-${stopOrder}`;
        this.capsuleIconMapping[icon] = {
          x: this.capsuleIconSize[0] * stopOrder,
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
    if (!data.made) {
      return data.pickup
        ? `pickup-${this.defaultColor}-skipped-0`
        : `dropoff-${this.defaultColor}-skipped-0`;
    }
    const stopOrder = Math.min(data.stopOrder, 100);
    return data.pickup
      ? `pickup-${this.defaultColor}-${stopOrder}`
      : `dropoff-${this.defaultColor}-${stopOrder}`;
  }

  protected onDataFiltered(data): void {
    this.unselectedLayer = new IconLayer({
      id: this.layerId + '-unselected',
      data: data.filter((d) => !d.selected),
      iconAtlas: super.getIconAtlas(),
      iconMapping: this.iconMapping,
      getIcon: (d) => (d.pickup ? `pickup-${this.defaultColor}` : `dropoff-${this.defaultColor}`),
      getSize: 10,
      sizeScale: super.getSizeScale(),
      getPosition: (d) => d.arrivalPosition,
      pickable: true,
      onHover: ({ object }) => {
        this.mapService.map.setOptions({ draggableCursor: object ? 'pointer' : 'grab' });
      },
      onClick: ({ object }) => {
        this.zone.run(() => {
          this.store.dispatch(UIActions.mapVisitRequestClicked({ id: object.id }));
        });
      },
    });

    super.onDataFiltered(data.filter((d) => d.selected));
  }

  protected updateLayers(): void {
    this.gLayer.setProps({
      layers: [this.layer, this.unselectedLayer, this.selectedDataLayer, this.mouseOverLayer],
    });
  }

  protected getIconAtlas(): string {
    return this.canShowTextLayer
      ? './assets/images/labeled_dropoffs_pickups.png'
      : super.getIconAtlas();
  }

  protected getSizeScale(): number {
    return this.canShowTextLayer ? 1.8 : super.getSizeScale();
  }

  protected getIconMapping(): any {
    return this.canShowTextLayer ? this.capsuleIconMapping : this.iconMapping;
  }

  protected getIcon(data: any): string {
    if (!this.canShowTextLayer) {
      return super.getIcon(data);
    }

    if (!data.made) {
      return data.pickup
        ? `pickup-${this.defaultColor}-skipped-0`
        : `dropoff-${this.defaultColor}-skipped-0`;
    }

    // Clamp to 100, whereafter all labels are "99+"
    const stopOrder = Math.min(data.stopOrder, 100);
    const color = (data.color && data.color.name) || this.defaultSelectedColor;
    const key = data.pickup ? `pickup-${color}-${stopOrder}` : `dropoff-${color}-${stopOrder}`;
    return key;
  }
}
