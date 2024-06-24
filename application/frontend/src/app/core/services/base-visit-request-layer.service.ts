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
import { IconLayer, TextLayer } from '@deck.gl/layers';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { UIActions } from '../actions';
import { MapService } from './map.service';

export abstract class BaseVisitRequestLayer {
  constructor(
    protected mapService: MapService,
    protected store: Store<State>,
    protected zone: NgZone,
    protected defaultIconSize: [number, number] = [64, 44]
  ) {
    this.iconSize = defaultIconSize;
    this.getIconMapping();
  }
  protected abstract layerId: string;
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

  protected gLayer: GoogleMapsOverlay = new GoogleMapsOverlay({});
  protected layer: IconLayer = new IconLayer({});
  protected selectedDataLayer: IconLayer = new IconLayer({});
  protected mouseOverLayer: IconLayer = new IconLayer({});
  protected labelLayer: TextLayer = new TextLayer({});

  private _visible: boolean;

  readonly iconSize: [number, number];
  private iconMapping = {};
  readonly defaultColor = 'blue-grey';
  readonly defaultSelectedColor = 'red';

  // top-down/left-right icon order as layed out in sprite
  readonly iconMappingOrder = [
    'dropoff-amber',
    'dropoff-blue-grey-skipped',
    'dropoff-blue-grey',
    'dropoff-blue',
    'dropoff-brown',
    'dropoff-cyan',
    'dropoff-deep-orange',
    'dropoff-deep-purple',
    'dropoff-green',
    'dropoff-grey',
    'dropoff-indigo',
    'dropoff-light-blue',
    'dropoff-light-green',
    'dropoff-lime',
    'dropoff-orange',
    'dropoff-pink',
    'dropoff-purple',
    'dropoff-red',
    'dropoff-teal',
    'dropoff-yellow',
    'dropoff',
    'pickup-amber',
    'pickup-blue-grey-skipped',
    'pickup-blue-grey',
    'pickup-blue',
    'pickup-brown',
    'pickup-cyan',
    'pickup-deep-orange',
    'pickup-deep-purple',
    'pickup-green',
    'pickup-grey',
    'pickup-indigo',
    'pickup-light-blue',
    'pickup-light-green',
    'pickup-lime',
    'pickup-orange',
    'pickup-pink',
    'pickup-purple',
    'pickup-red',
    'pickup-teal',
    'pickup-yellow',
    'pickup',
  ];

  protected getIconMapping(): void {
    // dynamically create icon mapping based on sprite
    for (let i = 0; i < this.iconMappingOrder.length; i++) {
      const icon = this.iconMappingOrder[i];
      this.iconMapping[icon] = {
        x: 0,
        y: this.iconSize[1] * i,
        width: this.iconSize[0],
        // clip height by 1 pixel to reduce a noticeable artifact that's more
        // prominent on deliveries when zoomed out
        height: this.iconSize[1] - 1,
      };
    }
  }

  protected getIconAtlas(): string {
    return './assets/images/dropoff_pickup_sprite.png';
  }

  abstract getDefaultIconFn(data): string;
  protected onDataFiltered(data): void {
    this.layer = new IconLayer({
      id: this.layerId,
      data,
      iconAtlas: this.getIconAtlas(),
      iconMapping: this.iconMapping,
      getIcon: (d) => this.getDefaultIconFn(d),
      getSize: 10,
      sizeScale: 2,
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
    this.gLayer.setProps({
      layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer, this.labelLayer],
    });
  }

  protected onDataSelected(data): void {
    this.selectedDataLayer = new IconLayer({
      id: this.layerId + '-selected',
      data,
      iconAtlas: this.getIconAtlas(),
      iconMapping: this.iconMapping,
      getIcon: (d) => {
        const color = (d.color && d.color.name) || this.defaultSelectedColor;
        const key = d.pickup ? `pickup-${color}` : `dropoff-${color}`;
        return key in this.iconMapping
          ? key
          : d.pickup
          ? `pickup-${this.defaultSelectedColor}`
          : `dropoff-${this.defaultSelectedColor}`;
      },
      getSize: 10,
      sizeScale: 2,
      getPosition: (d) => d.arrivalPosition,
      pickable: false,
    });
    this.gLayer.setProps({
      layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer, this.labelLayer],
    });
  }

  protected onDataMouseOver(data): void {
    this.mouseOverLayer = new IconLayer({
      id: this.layerId + '-mouseOver',
      data,
      iconAtlas: this.getIconAtlas(),
      iconMapping: this.iconMapping,
      getIcon: (d) => {
        if (!d.selected) {
          return this.getDefaultIconFn(d);
        }
        const color = (d.color && d.color.name) || this.defaultSelectedColor;
        const key = d.pickup ? `pickup-${color}` : `dropoff-${color}`;
        return key in this.iconMapping
          ? key
          : d.pickup
          ? `pickup-${this.defaultSelectedColor}`
          : `dropoff-${this.defaultSelectedColor}`;
      },
      getSize: 15,
      sizeScale: 2,
      getPosition: (d) => d.arrivalPosition,
      pickable: false,
    });
    this.gLayer.setProps({
      layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer, this.labelLayer],
    });
  }
}
