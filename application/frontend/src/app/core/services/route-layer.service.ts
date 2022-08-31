/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { PathLayer } from '@deck.gl/layers';
import { select, Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import {
  selectFilteredRoutes,
  selectFilteredRoutesSelected,
} from '../selectors/route-layer.selectors';
import { MATERIAL_COLORS } from './map-theme.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class RouteLayer {
  constructor(private mapService: MapService, private store: Store<State>) {
    this.store.pipe(select(selectFilteredRoutes)).subscribe((paths) => {
      this.onDataFiltered(paths);
    });
    this.store.pipe(select(selectFilteredRoutesSelected)).subscribe((paths) => {
      this.onDataSelected(paths);
    });
  }

  private gLayer: GoogleMapsOverlay = new GoogleMapsOverlay({});
  private layer: PathLayer = new PathLayer({});
  private outlineLayer: PathLayer = new PathLayer({});
  private selectedDataLayer: PathLayer = new PathLayer({});

  private _visible: boolean;
  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    if (value === this._visible) {
      return;
    }
    this._visible = value;
    this.gLayer.setMap(this._visible ? this.mapService.map : null);
  }
  private symbol = {
    getWidth: 25,
    getColor: MATERIAL_COLORS.BlueGrey.rgb,
  };

  private onDataFiltered(data): void {
    data = data.filter((p) => p.path);
    this.layer = new PathLayer({
      id: 'routes',
      data,
      widthMinPixels: 2,
      widthMaxPixels: 50,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      ...this.symbol,
    });
    this.outlineLayer = new PathLayer({
      id: 'routes-outline',
      data,
      widthMinPixels: 4,
      widthMaxPixels: 52,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 27,
      getColor: MATERIAL_COLORS.White.rgb,
    });
    this.gLayer.setProps({ layers: [this.outlineLayer, this.layer, this.selectedDataLayer] });
  }

  private onDataSelected(data): void {
    data = data.filter((p) => p.path);
    this.selectedDataLayer = new PathLayer({
      id: 'selected-routes',
      data,
      widthMinPixels: 2,
      widthMaxPixels: 50,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 25,
      getColor: (d) => d.color.rgb,
    });
    this.gLayer.setProps({ layers: [this.outlineLayer, this.layer, this.selectedDataLayer] });
  }
}
