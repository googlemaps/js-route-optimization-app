/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { NgZone } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, map, shareReplay, tap } from 'rxjs/operators';
import { MapService } from 'src/app/core/services';
import { State } from 'src/app/reducers';
import { toPointBounds } from 'src/app/util';

export abstract class BaseMarkersLayer {
  private readonly boundsChange$ = new Subject<void>();
  readonly bounds$ = this.boundsChange$.pipe(
    debounceTime(250),
    map(() => this.getBounds()),
    shareReplay(1)
  );
  readonly dragEnd$ = new Subject<{ id: number | string; pos: google.maps.LatLng }>();
  readonly edit$ = new Subject<{ id: number | string; pos: google.maps.LatLng }>();

  protected markers = new Map<number | string, google.maps.Marker>();
  protected listeners = new Map<
    number | string,
    { [eventName: string]: google.maps.MapsEventListener }
  >();
  protected abstract zIndex: number;
  private _visible = false;
  private _draggable = false;

  get visible(): boolean {
    return this._visible;
  }
  set visible(value: boolean) {
    this._visible = value;
    const myMap = value ? this.mapService.map : null;
    this.markers.forEach((marker) => marker.setMap(marker.getPosition() ? myMap : null));
    if (myMap != null) {
      this.boundsChange$.next();
    }
  }

  get draggable(): boolean {
    return this._draggable;
  }
  set draggable(value: boolean) {
    this._draggable = value;
    Array.from(this.markers.keys()).forEach((id) => this.setDraggable(id, value));
  }

  constructor(
    protected mapService: MapService,
    protected store: Store<State>,
    protected zone?: NgZone
  ) {}

  hide(): void {
    this.visible = false;
  }
  show(): void {
    this.visible = true;
  }

  getMarkers(): [number | string, google.maps.Marker][] {
    return Array.from(this.markers.entries());
  }

  addMarker(id: number | string, marker: google.maps.Marker): google.maps.Marker {
    if (this.markers.has(id)) {
      this.removeMarker(id);
    }
    if (marker) {
      this.markers.set(id, marker);
      this.listeners.set(id, {});
      this.setDraggable(id, this.draggable);
      marker.setMap(this.visible && marker.getPosition() ? this.mapService.map : null);
      if (marker.getMap() != null) {
        this.boundsChange$.next();
      }
    }
    return marker;
  }

  removeMarker(id: number | string): void {
    const marker = this.markers.get(id);
    const listeners = this.listeners.get(id) || {};
    this.markers.delete(id);
    this.listeners.delete(id);
    Object.values(listeners).forEach((listener) => listener.remove());
    const myMap = marker?.getMap();
    marker?.setMap(null);
    if (myMap != null) {
      this.boundsChange$.next();
    }
  }

  moveMarker(id: number | string, pos?: google.maps.LatLng): void {
    const marker = this.markers.get(id);
    if (marker) {
      const myMap = marker.getMap();
      marker.setMap(this.visible && pos ? this.mapService.map : null);
      marker.setPosition(pos || null);
      if (myMap || marker.getMap()) {
        this.boundsChange$.next();
      }
    }
  }

  clearMarkers(): void {
    Array.from(this.markers.keys()).forEach((id) => this.removeMarker(id));
  }

  /** Make a single marker draggable */
  makeDraggable(id: number): void {
    this.setDraggable(id, true);
  }

  /** Make a single marker non-draggable */
  makeFixed(id: number): void {
    this.setDraggable(id, false);
  }

  getBounds(): google.maps.LatLngBounds {
    const bounds = new google.maps.LatLngBounds();
    if (this.markers.size === 1) {
      return toPointBounds(this.markers.values().next().value.getPosition(), 1000);
    }
    this.markers.forEach((marker) => {
      const pos = marker.getPosition();
      if (pos) {
        bounds.extend(pos);
      }
    });
    return bounds;
  }

  editMarker(id: number | string): Observable<google.maps.LatLng> {
    const marker = this.markers.get(id);
    if (!marker) {
      return of(null);
    }
    return this.mapService.edit().pipe(
      tap((pos) => {
        if (pos) {
          this.moveMarker(id, pos);
          this.zone.run(() => this.edit$.next({ id, pos }));
        }
      })
    );
  }

  protected setDraggable(id: number | string, draggable: boolean): void {
    const marker = this.markers.get(id);
    if (!marker) {
      return;
    }
    marker.setDraggable(draggable);
    marker.setClickable(draggable);
    const listeners = this.listeners.get(id);
    listeners.dragend?.remove();
    if (!draggable) {
      return;
    }
    listeners.dragend = google.maps.event.addListener(
      marker,
      'dragend',
      (event: google.maps.MapMouseEvent) => {
        this.zone.run(() => this.dragEnd$.next({ id, pos: event.latLng }));
      }
    );
  }
}
