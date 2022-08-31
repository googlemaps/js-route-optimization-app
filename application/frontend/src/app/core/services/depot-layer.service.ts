/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import { fromDispatcherLatLng } from 'src/app/util';
import { ILatLng } from '../models';
import { BaseMarkersLayer } from './base-markers-layer.service';
import { ZIndex } from './map-theme.service';
import { MapService } from './map.service';

@Injectable({
  providedIn: 'root',
})
export class DepotLayer extends BaseMarkersLayer {
  zIndex = ZIndex.Depot;

  private readonly depotId = 1;

  private _symbol: google.maps.Icon;
  get symbol(): google.maps.Icon {
    if (this._symbol == null) {
      this.symbol = {
        url: './assets/images/depot.svg',
        scaledSize: new google.maps.Size(35, 35),
        anchor: new google.maps.Point(17.5, 17.5),
      };
    }
    return this._symbol;
  }
  set symbol(value: google.maps.Icon) {
    this._symbol = value;
  }

  private _selectedSymbol;
  get selectedSymbol(): google.maps.Icon {
    if (this._selectedSymbol == null) {
      this._selectedSymbol = {
        url: './assets/images/depot_selected.svg',
        scaledSize: new google.maps.Size(35, 35),
        anchor: new google.maps.Point(17.5, 17.5),
      };
    }
    return this._selectedSymbol;
  }
  set selectedSymbol(value: google.maps.Icon) {
    this._symbol = value;
  }

  constructor(mapService: MapService, store: Store<fromRoot.State>) {
    super(mapService, store);
  }

  getMarker(): google.maps.Marker {
    return this.markers.get(this.depotId);
  }

  setDepot(depot: ILatLng): void {
    if (depot) {
      this.addMarker(this.depotId, this.createMarker(depot));
      this.moveMarker(this.depotId, depot != null ? fromDispatcherLatLng(depot) : null);
      this.draggable = false;
      this.show();
    } else {
      this.hide();
    }
  }

  selectDepot(): void {
    const marker = this.getMarker();
    if (marker) {
      marker.setIcon(this.selectedSymbol);
    }
  }

  deselectDepot(): void {
    const marker = this.getMarker();
    if (marker) {
      marker.setIcon(this.symbol);
    }
  }

  private createMarker(position: ILatLng): google.maps.Marker {
    return new google.maps.Marker({
      icon: this.symbol,
      position: position ? fromDispatcherLatLng(position) : null,
      zIndex: this.zIndex,
    });
  }
}
