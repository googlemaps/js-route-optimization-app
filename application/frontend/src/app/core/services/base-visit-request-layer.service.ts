/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { NgZone } from '@angular/core';
import { GoogleMapsOverlay } from '@deck.gl/google-maps';
import { IconLayer } from '@deck.gl/layers';
import { Store } from '@ngrx/store';
import { State } from 'src/app/reducers';
import { UIActions } from '../actions';
import { MapService } from './map.service';

export abstract class BaseVisitRequestLayer {
  constructor(
    protected mapService: MapService,
    protected store: Store<State>,
    protected zone: NgZone
  ) {
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

  private gLayer: GoogleMapsOverlay = new GoogleMapsOverlay({});
  private layer: IconLayer = new IconLayer({});
  private selectedDataLayer: IconLayer = new IconLayer({});
  private mouseOverLayer: IconLayer = new IconLayer({});

  private _visible: boolean;

  readonly iconSize = [64, 44];
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

  private getIconMapping(): void {
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

  abstract getDefaultIconFn(data): string;
  protected onDataFiltered(data): void {
    this.layer = new IconLayer({
      id: this.layerId,
      data,
      iconAtlas: './assets/images/dropoff_pickup_sprite.png',
      iconMapping: this.iconMapping,
      getIcon: (d) => this.getDefaultIconFn(d),
      sizeUnits: 'meters',
      sizeMinPixels: 13.5,
      sizeMaxPixels: 43.5,
      getSize: 13.5,
      sizeScale: 10,
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
    this.gLayer.setProps({ layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer] });
  }

  protected onDataSelected(data): void {
    this.selectedDataLayer = new IconLayer({
      id: this.layerId + '-selected',
      data,
      iconAtlas: './assets/images/dropoff_pickup_sprite.png',
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
      sizeUnits: 'meters',
      sizeMinPixels: 13.5,
      sizeMaxPixels: 43.5,
      getSize: 13.5,
      sizeScale: 10,
      getPosition: (d) => d.arrivalPosition,
      pickable: false,
    });
    this.gLayer.setProps({ layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer] });
  }

  protected onDataMouseOver(data): void {
    this.mouseOverLayer = new IconLayer({
      id: this.layerId + '-mouseOver',
      data,
      iconAtlas: './assets/images/dropoff_pickup_sprite.png',
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
      sizeUnits: 'meters',
      sizeMinPixels: 21,
      sizeMaxPixels: 61,
      getSize: 21,
      sizeScale: 10,
      getPosition: (d) => d.arrivalPosition,
      pickable: false,
    });
    this.gLayer.setProps({ layers: [this.layer, this.selectedDataLayer, this.mouseOverLayer] });
  }
}
