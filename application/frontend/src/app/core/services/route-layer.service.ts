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
  private selectedDataOutlineLayer: PathLayer = new PathLayer({});

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
      widthMinPixels: 4,
      widthMaxPixels: 60,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      ...this.symbol,
    });
    this.outlineLayer = new PathLayer({
      id: 'routes-outline',
      data,
      widthMinPixels: 8,
      widthMaxPixels: 80,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 40,
      getColor: MATERIAL_COLORS.BlueGrey.strokeRgb,
    });
    this.gLayer.setProps({
      layers: [
        this.outlineLayer,
        this.selectedDataOutlineLayer,
        this.layer,
        this.selectedDataLayer,
      ],
    });
  }

  private onDataSelected(data): void {
    data = data.filter((p) => p.path);
    this.selectedDataLayer = new PathLayer({
      id: 'selected-routes',
      data,
      widthMinPixels: 4,
      widthMaxPixels: 60,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 25,
      getColor: (d) => d.color.rgb,
    });
    this.selectedDataOutlineLayer = new PathLayer({
      id: 'selected-routes-outline',
      data,
      widthMinPixels: 8,
      widthMaxPixels: 80,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 40,
      getColor: (d) => d.color.strokeRgb,
    });
    this.gLayer.setProps({
      layers: [
        this.outlineLayer,
        this.layer,
        this.selectedDataOutlineLayer,
        this.selectedDataLayer,
      ],
    });
  }
}
