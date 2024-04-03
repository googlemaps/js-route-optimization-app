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
import { MATERIAL_COLORS } from './map-theme.service';
import { PdfMapService } from './pdf-map.service';

@Injectable({
  providedIn: 'root',
})
export class PdfRouteLayer {
  constructor(private mapService: PdfMapService) {}

  private gLayer: GoogleMapsOverlay = new GoogleMapsOverlay({
    glOptions: { preserveDrawingBuffer: true },
  });
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
    getColor: MATERIAL_COLORS.Green.rgb,
  };

  setData(data): void {
    data = data.filter((p) => p.path);
    this.layer = new PathLayer({
      id: 'pdf-routes',
      data,
      widthMinPixels: 2,
      widthMaxPixels: 50,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      ...this.symbol,
    });
    this.outlineLayer = new PathLayer({
      id: 'pdf-routes-outline',
      data,
      widthMinPixels: 5,
      widthMaxPixels: 52,
      capRounded: true,
      jointRounded: true,
      getPath: (d) => d.path,
      getWidth: 27,
      getColor: MATERIAL_COLORS.White.rgb,
    });
    this.gLayer.setProps({ layers: [this.outlineLayer, this.layer, this.selectedDataLayer] });
  }
}
