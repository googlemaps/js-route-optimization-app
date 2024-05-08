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

import { NgZone } from '@angular/core';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { IconLayer } from '@deck.gl/layers';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { UIActions } from '../actions';
import { MapService } from './map.service';

export abstract class BaseVehicleLayer {
  constructor(
    protected mapService: MapService,
    protected store: Store<State>,
    protected zone: NgZone
  ) {
    this.getIconMapping();
  }
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
  protected layerId: string;

  private gLayer: GoogleMapsOverlay = new GoogleMapsOverlay({});
  private layer: IconLayer = new IconLayer({});
  private selectedDataLayer: IconLayer = new IconLayer({});

  private _visible: boolean;

  readonly iconSize = [48, 48];
  private iconMapping = {};
  readonly defaultColor = 'blue-grey';
  readonly defaultSelectedColor = 'red';

  // top-down/left-right icon order as layed out in sprite
  readonly iconMappingOrder = [
    'vehicle-amber',
    'vehicle-black',
    'vehicle-blue-grey',
    'vehicle-blue',
    'vehicle-brown',
    'vehicle-cyan',
    'vehicle-deep-orange',
    'vehicle-deep-purple',
    'vehicle-green',
    'vehicle-grey',
    'vehicle-indigo',
    'vehicle-light-blue',
    'vehicle-light-green',
    'vehicle-lime',
    'vehicle-orange',
    'vehicle-pink',
    'vehicle-purple',
    'vehicle-red',
    'vehicle-teal',
    'vehicle-white',
    'vehicle-yellow',
  ];

  private getIconMapping(): void {
    // dynamically create icon mapping based on sprite
    for (let i = 0; i < this.iconMappingOrder.length; i++) {
      const icon = this.iconMappingOrder[i];
      this.iconMapping[icon] = {
        x: 0,
        y: this.iconSize[1] * i,
        width: this.iconSize[0],
        height: this.iconSize[1],
      };
    }
  }

  getDefaultIconFn(data: any): string {
    return data.atDepot ? null : `vehicle-${this.defaultColor}`;
  }
  protected onDataFiltered(data): void {
    this.layer = new IconLayer({
      id: this.layerId,
      data,
      iconAtlas: './assets/images/vehicle_sprite.png',
      iconMapping: this.iconMapping,
      getIcon: (d) => this.getDefaultIconFn(d),
      sizeUnits: 'meters',
      sizeMinPixels: 26.5,
      sizeMaxPixels: 66.5,
      getSize: 22,
      sizeScale: 10,
      getPosition: (d) => d.position,
      pickable: true,
      onHover: ({ object }) => {
        this.mapService.map.setOptions({ draggableCursor: object ? 'pointer' : 'grab' });
      },
      onClick: ({ object }) => {
        this.zone.run(() => {
          this.store.dispatch(UIActions.mapVehicleClicked({ id: object.id }));
        });
      },
    });
    this.gLayer.setProps({ layers: [this.layer, this.selectedDataLayer] });
  }

  getSelectedIconFn(data: any): string {
    if (data.atDepot) {
      return null;
    }
    const color = (data.color && data.color.name) || this.defaultSelectedColor;
    const key = `vehicle-${color}`;
    return key in this.iconMapping ? key : `vehicle-${this.defaultSelectedColor}`;
  }
  protected onDataSelected(data): void {
    this.selectedDataLayer = new IconLayer({
      id: this.layerId + '-selected',
      data,
      iconAtlas: './assets/images/vehicle_sprite.png',
      iconMapping: this.iconMapping,
      getIcon: (d) => this.getSelectedIconFn(d),
      sizeUnits: 'meters',
      sizeMinPixels: 26.5,
      sizeMaxPixels: 66.5,
      getSize: 22,
      sizeScale: 10,
      getPosition: (d) => d.position,
      pickable: false,
    });
    this.gLayer.setProps({ layers: [this.layer, this.selectedDataLayer] });
  }
}
