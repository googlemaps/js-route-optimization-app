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
