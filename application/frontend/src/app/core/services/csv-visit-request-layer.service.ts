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
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import {
  fromDispatcherLatLng,
  fromDispatcherWaypointLatLng,
  toDispatcherLatLng,
} from 'src/app/util';
import { ILatLng, VisitRequest } from '../models';
import { BaseMarkersLayer } from './base-markers-layer.service';
import { FormMapService } from './form-map.service';
import { MATERIAL_COLORS, ZIndex } from './map-theme.service';

@Injectable({
  providedIn: 'root',
})
export class CsvVisitRequestLayer extends BaseMarkersLayer {
  private static defaultStrokeColor = MATERIAL_COLORS.Blue.hex;

  readonly click$ = new Subject<{ id: number; pos: google.maps.LatLng }>();
  zIndex = ZIndex.PostSolveVisitRequests;
  strokeColor = CsvVisitRequestLayer.defaultStrokeColor;

  get symbolPickup(): google.maps.Symbol {
    if (this._symbolPickup == null) {
      this._symbolPickup = {
        path: `m 5.3143151,1.4380714 c 0.393,-0.61700002 1.2939998,-0.61700002 1.6869998,0
        l 4.1740001,6.5510002 c 0.424,0.665 -0.054,1.537 -0.843,1.537 H 1.9833151
        c -0.789,0 -1.26699999,-0.872 -0.843,-1.537 z`,
        scale: 1.3,
        fillColor: '#FFFFFF',
        fillOpacity: 0.7,
        strokeColor: this.strokeColor,
        strokeWeight: 2.0,
        anchor: new google.maps.Point(5.75, 0.5),
      };
    }
    return this._symbolPickup;
  }
  set symbolPickup(value: google.maps.Symbol) {
    this._symbolPickup = value;
  }
  private _symbolPickup: google.maps.Symbol;

  get symbolDelivery(): google.maps.Symbol {
    if (this._symbolDelivery == null) {
      this._symbolDelivery = {
        path: `m 5.3143151,9.0880002 c 0.393,0.617 1.2939998,0.617 1.6869998,0 L 11.175315,2.537
        C 11.599315,1.872 11.121315,1 10.332315,1 H 1.9833151 c -0.789,0 -1.26699999,0.872 -0.843,1.537 z`,
        scale: 1.2,
        fillColor: '#FFFFFF',
        fillOpacity: 0.7,
        strokeColor: this.strokeColor,
        strokeWeight: 2.0,
        anchor: new google.maps.Point(5.75, 0.5),
      };
    }
    return this._symbolDelivery;
  }
  set symbolDelivery(value: google.maps.Symbol) {
    this._symbolDelivery = value;
  }
  private _symbolDelivery: google.maps.Symbol;

  private zIndexFn: (visitRequest: VisitRequest, defaultZIndex: number) => number = () =>
    this.zIndex;

  constructor(formMapService: FormMapService, store: Store<fromRoot.State>, zone: NgZone) {
    super(formMapService, store, zone);
  }

  add(visitRequests: VisitRequest[]): void {
    visitRequests.forEach((visitRequest, index) => {
      const marker = this.addMarker(index, this.createVisitRequestMarker(visitRequest));
      marker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));
    });
  }

  load(visitRequests: VisitRequest[]): void {
    this.clearMarkers();
    this.add(visitRequests);
  }

  remove(visitRequest: VisitRequest): void {
    this.removeMarker(visitRequest.id);
  }

  move(visitRequest: VisitRequest, pos: ILatLng): void {
    this.moveMarker(visitRequest.id, pos != null ? fromDispatcherLatLng(pos) : null);
  }

  edit(visitRequest: VisitRequest): Observable<ILatLng> {
    return this.editMarker(visitRequest.id).pipe(
      map((pos) => (pos != null ? toDispatcherLatLng(pos) : null))
    );
  }

  setStrokeColor(value?: string): void {
    this.strokeColor =
      this.symbolPickup.strokeColor =
      this.symbolDelivery.strokeColor =
        value || CsvVisitRequestLayer.defaultStrokeColor;
    this.markers.forEach((marker) => {
      const icon = marker.getIcon() as google.maps.Symbol;
      icon.strokeColor = this.strokeColor;
      marker.setIcon(icon);
    });
  }

  setZIndexFn(
    visitRequests: VisitRequest[],
    zIndexFn?: (visitRequest: VisitRequest, zIndex: number) => number
  ): void {
    this.zIndexFn = zIndexFn || (() => this.zIndex);
    visitRequests.forEach((visitRequest) => {
      const marker = this.markers.get(visitRequest.id);
      marker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));
    });
  }

  clear(): void {
    this.clearMarkers();
  }

  reset(): void {
    this.clear();
    this.setStrokeColor();
    this.draggable = false;
    this.visible = false;
  }

  private createVisitRequestMarker(visitRequest: VisitRequest): google.maps.Marker {
    const marker = new google.maps.Marker({
      icon: visitRequest.pickup ? this.symbolPickup : this.symbolDelivery,
      position: visitRequest.arrivalWaypoint
        ? fromDispatcherWaypointLatLng(visitRequest.arrivalWaypoint)
        : null,
      crossOnDrag: false,
    });
    marker.addListener('click', () => {
      this.zone.run(() => {
        this.click$.next({ id: visitRequest.id, pos: marker.getPosition() });
      });
    });
    return marker;
  }
}
