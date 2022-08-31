/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromRoot from 'src/app/reducers';
import { fromDispatcherWaypointLatLng } from 'src/app/util';
import { Vehicle } from '../models';
import { BaseMarkersLayer } from './base-markers-layer.service';
import { FormMapService } from './form-map.service';
import { ZIndex } from './map-theme.service';

@Injectable()
export class CsvVehicleLayer extends BaseMarkersLayer {
  zIndex = ZIndex.PostSolveVehicles;

  get symbol(): google.maps.Symbol {
    if (this._symbol == null) {
      this._symbol = {
        path: `m 2.5, 5.0 a 2.5,2.5 0 1,1 5.0,0 a 2.5,2.5 0 1,1 -5.0,0`,
        scale: 2.5,
        fillColor: '#ffffff',
        fillOpacity: 0.7,
        strokeColor: '#0f9d58',
        strokeWeight: 2.0,
        anchor: new google.maps.Point(5, 5),
      };
    }
    return this._symbol;
  }
  set symbol(value: google.maps.Symbol) {
    this._symbol = value;
  }
  private _symbol: google.maps.Symbol;

  private zIndexFn: (id: number, defaultZIndex: number) => number = () => this.zIndex;

  constructor(mapService: FormMapService, store: Store<fromRoot.State>, zone: NgZone) {
    super(mapService, store, zone);
  }

  add(vehicles: Vehicle[]): void {
    vehicles.forEach((vehicle, index) => {
      const markerStart = this.addMarker(index, this.createMarker(vehicle, true));
      const markerEnd = this.addMarker(-index, this.createMarker(vehicle, false));
      markerStart?.setZIndex(this.zIndex);
      markerEnd?.setZIndex(this.zIndex);
    });
  }

  load(vehicle: Vehicle): void {
    this.clearMarkers();
    this.add([vehicle]);
  }

  remove(id: number): void {
    this.removeMarker(id);
  }

  reset(): void {
    this.clearMarkers();
    this.draggable = false;
    this.visible = false;
  }

  setZIndexFn(id: number, zIndexFn?: (id: number, zIndex: number) => number): void {
    this.zIndexFn = zIndexFn || (() => this.zIndex);
    const marker = this.markers.get(id);
    marker?.setZIndex(this.zIndexFn(id, this.zIndex));
  }

  private createMarker(vehicle: Vehicle, isStart = false): google.maps.Marker {
    const position = isStart ? vehicle.startWaypoint : vehicle.endWaypoint;
    return new google.maps.Marker({
      icon: this.symbol,
      position: position ? fromDispatcherWaypointLatLng(position) : null,
      crossOnDrag: false,
    });
  }
}
