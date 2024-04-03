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
