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
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { fromDispatcherLatLng, toDispatcherLatLng } from 'src/app/util';
import { ILatLng, VisitRequest } from '../models';
import { BaseMarkersLayer } from './base-markers-layer.service';
import { FormMapService } from './form-map.service';
import { ZIndex } from './map-theme.service';

@Injectable({
  providedIn: 'root',
})
export class FormVisitRequestLayer extends BaseMarkersLayer {
  private static defaultStrokeColor = '#5b5b5b';

  readonly click$ = new Subject<{ id: number | string; pos: google.maps.LatLng }>();
  zIndex = ZIndex.PostSolveVisitRequests;
  strokeColor = FormVisitRequestLayer.defaultStrokeColor;

  private _symbolPickup: google.maps.Symbol;
  get symbolPickupArrival(): google.maps.Symbol {
    if (this._symbolPickup == null || this._symbolPickup.strokeColor !== this.strokeColor) {
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

  get symbolPickupDeparture(): google.maps.Symbol {
    return {
      ...this.symbolPickupArrival,
      fillColor: '#000000',
    };
  }

  private _symbolDelivery: google.maps.Symbol;
  get symbolDeliveryArrival(): google.maps.Symbol {
    if (this._symbolDelivery == null || this._symbolDelivery.strokeColor !== this.strokeColor) {
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

  get symbolDeliveryDeparture(): google.maps.Symbol {
    return {
      ...this.symbolPickupArrival,
      fillColor: '#000000',
    };
  }

  private zIndexFn: (visitRequest: VisitRequest, defaultZIndex: number) => number = () =>
    this.zIndex;

  constructor(formMapService: FormMapService, store: Store<fromRoot.State>, zone: NgZone) {
    super(formMapService, store, zone);
  }

  add(visitRequests: VisitRequest[]): void {
    visitRequests.forEach((visitRequest) => {
      const [arrivalMarker, departureMarker] = this.createMarkers(visitRequest);

      this.addMarker(`${visitRequest.id}-arrival`, arrivalMarker);
      arrivalMarker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));

      this.addMarker(`${visitRequest.id}-departure`, departureMarker);
      departureMarker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));
    });
  }

  load(visitRequests: VisitRequest[]): void {
    this.clearMarkers();
    this.add(visitRequests);
  }

  remove(visitRequest: VisitRequest): void {
    this.removeMarker(`${visitRequest.id}-arrival`);
    this.removeMarker(`${visitRequest.id}-departure`);
  }

  move(
    visitRequest: VisitRequest,
    arrivalOrDeparture: 'arrival' | 'departure',
    pos: ILatLng
  ): void {
    this.moveMarker(
      `${visitRequest.id}-${arrivalOrDeparture}`,
      pos != null ? fromDispatcherLatLng(pos) : null
    );
  }

  edit(
    visitRequest: VisitRequest,
    arrivalOrDeparture: 'arrival' | 'departure'
  ): Observable<ILatLng> {
    return this.editMarker(`${visitRequest.id}-${arrivalOrDeparture}`).pipe(
      map((pos) => (pos != null ? toDispatcherLatLng(pos) : null))
    );
  }

  setStrokeColor(value?: string): void {
    this.strokeColor =
      this.symbolPickupArrival.strokeColor =
      this.symbolDeliveryArrival.strokeColor =
        value || FormVisitRequestLayer.defaultStrokeColor;
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
      let marker = this.markers.get(`${visitRequest.id}`);
      marker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));

      marker = this.markers.get(`${visitRequest.id}-arrival`);
      marker?.setZIndex(this.zIndexFn(visitRequest, this.zIndex));

      marker = this.markers.get(`${visitRequest.id}-departure`);
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

  private createMarkers(
    visitRequest: VisitRequest
  ): [arrivalMarker: google.maps.Marker, departureMarker: google.maps.Marker] {
    // arrival location marker
    const arrivalMarker = new google.maps.Marker({
      icon: visitRequest.pickup ? this.symbolPickupArrival : this.symbolDeliveryArrival,
      position: visitRequest.arrivalWaypoint?.location?.latLng
        ? fromDispatcherLatLng(visitRequest.arrivalWaypoint.location.latLng)
        : null,
      crossOnDrag: false,
    });
    arrivalMarker.addListener('click', () => {
      this.zone.run(() => {
        this.click$.next({ id: `${visitRequest.id}-arrival`, pos: arrivalMarker.getPosition() });
      });
    });

    // departure location marker
    const departureMarker = new google.maps.Marker({
      icon: visitRequest.pickup ? this.symbolPickupDeparture : this.symbolDeliveryDeparture,
      position: visitRequest.departureWaypoint?.location?.latLng
        ? fromDispatcherLatLng(visitRequest.departureWaypoint.location.latLng)
        : null,
      crossOnDrag: false,
    });
    departureMarker.addListener('click', () => {
      this.zone.run(() => {
        this.click$.next({
          id: `${visitRequest.id}-departure`,
          pos: departureMarker.getPosition(),
        });
      });
    });

    return [arrivalMarker, departureMarker];
  }
}
