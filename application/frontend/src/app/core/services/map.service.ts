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
import { BehaviorSubject, fromEventPattern, Observable, of, race, Subject } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { MapApiService } from './map-api.service';

/**
 * Responsible for Google Maps JavaScript API map initialization.
 */
@Injectable({ providedIn: 'root' })
export class MapService {
  private static readonly CENTER_PARIS = { lat: 48.8566, lng: 2.3522 };
  private static readonly ZOOM_PARIS = 12;
  private static readonly getCurrentPosition$ = navigator?.geolocation
    ? new Observable<google.maps.LatLngLiteral>((observer) =>
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            observer.next({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            observer.complete();
          },
          (_) => {
            observer.next(null);
            observer.complete();
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        )
      ).pipe(shareReplay(1))
    : of(null as google.maps.LatLngLiteral);
  readonly bounds$ = new BehaviorSubject<google.maps.LatLngBounds>(null);

  get bounds(): google.maps.LatLngBounds {
    return this.bounds$.getValue();
  }
  set bounds(value: google.maps.LatLngBounds) {
    this.zone.run(() => {
      this.bounds$.next(value);
    });
  }

  get hasEmptyBounds(): boolean {
    return !this.bounds || this.bounds.isEmpty();
  }

  private readonly map$ = new BehaviorSubject<google.maps.Map>(null);
  private readonly completeEdits$ = new Subject<void>();
  private center: google.maps.LatLngLiteral;
  private zoom = 0;
  readonly zoomChanged$ = new Subject<number>();

  get map(): google.maps.Map {
    return this.map$.getValue();
  }

  constructor(private mapApiService: MapApiService, private zone: NgZone) {}

  initMap(
    mapHtmlElement: HTMLElement,
    options: google.maps.MapOptions
  ): Observable<google.maps.Map> {
    return this.mapApiService.initMap(mapHtmlElement, options).pipe(
      tap((myMap) => {
        if (!this.hasEmptyBounds) {
          myMap?.fitBounds(this.bounds);
        } else if (this.center) {
          myMap?.setCenter(this.center);
          myMap?.setZoom(this.zoom);
        }
        myMap?.setTilt(0); // disable 45° imagery
        myMap?.addListener('zoom_changed', () => {
          this.zone.run(() => this.zoomChanged$.next(this.map.getZoom()));
        });
        this.map$.next(myMap);
      })
    );
  }

  /** Initializes the default center and zoom */
  initViewDefault(options: google.maps.MapOptions): Observable<google.maps.LatLngLiteral> {
    this.center = (options?.center as google.maps.LatLngLiteral) ?? MapService.CENTER_PARIS;
    this.zoom = options?.zoom ?? MapService.ZOOM_PARIS;

    return MapService.getCurrentPosition$.pipe(
      switchMap((currentPosition) => {
        this.center = currentPosition || this.center || MapService.CENTER_PARIS;
        if (this.center && this.hasEmptyBounds) {
          this.map?.setCenter(this.center);
        }
        return of(this.center);
      })
    );
  }

  setBounds(bounds: google.maps.LatLngBounds, save = true): void {
    if (bounds) {
      this.map?.fitBounds(bounds);
    }
    if (save) {
      this.bounds = bounds;
    }
  }

  zoomToHome(): void {
    if (!this.map) {
      return;
    }
    if (!this.hasEmptyBounds) {
      this.map.fitBounds(this.bounds);
      return;
    }
    if (this.center) {
      this.map.setCenter(this.center);
      this.map.setZoom(this.zoom);
    }
  }

  edit(): Observable<google.maps.LatLng> {
    this.completeEdits$.next();
    const myMap = this.map;
    if (!myMap) {
      return of(null);
    }
    myMap.setOptions({ draggableCursor: 'crosshair' });
    return race(
      fromEventPattern<google.maps.MapMouseEvent>(
        (handler) => myMap.addListener('click', handler),
        (_, listener) => google.maps.event.removeListener(listener)
      ).pipe(map((event) => event.latLng)),
      this.completeEdits$.pipe(map(() => null))
    ).pipe(
      take(1),
      tap(() => myMap.setOptions({ draggableCursor: null }))
    );
  }

  latLngToPoint(latLng): google.maps.Point {
    const topRight = this.map
      .getProjection()
      .fromLatLngToPoint(this.map.getBounds().getNorthEast());
    const bottomLeft = this.map
      .getProjection()
      .fromLatLngToPoint(this.map.getBounds().getSouthWest());
    const scale = Math.pow(2, this.map.getZoom());
    const worldPoint = this.map.getProjection().fromLatLngToPoint(latLng);
    return new google.maps.Point(
      (worldPoint.x - bottomLeft.x) * scale,
      (worldPoint.y - topRight.y) * scale
    );
  }
}
