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

import { Injectable, NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { fromDispatcherLatLng, toDispatcherLatLng } from 'src/app/util';
import { ILatLng, Vehicle } from '../models';
import { BaseMarkersLayer } from './base-markers-layer.service';
import { FormMapService } from './form-map.service';
import { ZIndex } from './map-theme.service';

export enum LocationId {
  Start,
  End,
}

@Injectable()
export class VehicleLayer extends BaseMarkersLayer {
  zIndex = ZIndex.PostSolveVehicles;

  get symbolStart(): google.maps.Symbol {
    if (this._symbolStart == null) {
      this._symbolStart = {
        path: `M5.66667 0L0 4.25L0 12.75L3.54167 12.75L3.54167 7.79167L7.79167 7.79167L7.79167 12.75L11.3333 12.75L11.3333 4.25L5.66667 0Z`,
        scale: 1.1,
        fillColor: '#ffffff',
        fillOpacity: 0.7,
        strokeColor: '#0f9d58',
        strokeWeight: 2.0,
        anchor: new google.maps.Point(5.2, 6.8),
      };
    }
    return this._symbolStart;
  }
  set symbolStart(value: google.maps.Symbol) {
    this._symbolStart = value;
  }
  private _symbolStart: google.maps.Symbol;

  get symbolEnd(): google.maps.Symbol {
    if (this._symbolEnd == null) {
      this._symbolEnd = {
        path: `m 2.5, 5.0 a 2.5,2.5 0 1,1 5.0,0 a 2.5,2.5 0 1,1 -5.0,0`,
        scale: 2.5,
        fillColor: '#ffffff',
        fillOpacity: 0.7,
        strokeColor: '#0f9d58',
        strokeWeight: 2.0,
        anchor: new google.maps.Point(5, 5),
      };
    }
    return this._symbolEnd;
  }
  set symbolEnd(value: google.maps.Symbol) {
    this._symbolEnd = value;
  }
  private _symbolEnd: google.maps.Symbol;

  private zIndexFn: (id: number, defaultZIndex: number) => number = () => this.zIndex;

  constructor(mapService: FormMapService, store: Store<fromRoot.State>, zone: NgZone) {
    super(mapService, store, zone);
  }

  add(vehicle: Vehicle): void {
    const markerStart = this.addMarker(LocationId.Start, this.createMarker(vehicle, true));
    const markerEnd = this.addMarker(LocationId.End, this.createMarker(vehicle, false));
    markerStart?.setZIndex(this.zIndexFn(LocationId.Start, this.zIndex));
    markerEnd?.setZIndex(this.zIndexFn(LocationId.End, this.zIndex));
  }

  load(vehicle: Vehicle): void {
    this.clearMarkers();
    this.add(vehicle);
  }

  remove(id: number): void {
    this.removeMarker(id);
  }

  reset(): void {
    this.clearMarkers();
    this.draggable = false;
    this.visible = false;
  }

  move(id: number, pos: ILatLng): void {
    this.moveMarker(id, pos != null ? fromDispatcherLatLng(pos) : null);
  }

  edit(id: number): Observable<ILatLng> {
    return this.editMarker(id).pipe(map((pos) => (pos != null ? toDispatcherLatLng(pos) : null)));
  }

  setZIndexFn(id: number, zIndexFn?: (id: number, zIndex: number) => number): void {
    this.zIndexFn = zIndexFn || (() => this.zIndex);
    const marker = this.markers.get(id);
    marker?.setZIndex(this.zIndexFn(id, this.zIndex));
  }

  private createMarker(vehicle: Vehicle, isStart = false): google.maps.Marker {
    const position = isStart
      ? vehicle.startWaypoint?.location?.latLng
      : vehicle.endWaypoint?.location?.latLng;
    return new google.maps.Marker({
      icon: isStart ? this.symbolStart : this.symbolEnd,
      position: position ? fromDispatcherLatLng(position) : null,
      crossOnDrag: false,
    });
  }
}
