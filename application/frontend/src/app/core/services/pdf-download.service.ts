/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { combineLatest, forkJoin, Observable, of } from 'rxjs';
import { delay, map, mergeMap, take } from 'rxjs/operators';
import { DeckGLRoute, Vehicle, VisitRequest } from '../models';
import * as fromConfig from 'src/app/core/selectors/config.selectors';
import { findPathHeadingAtPointOptimized, simplifyPath } from 'src/app/util';
import { HttpClient } from '@angular/common/http';
import { MATERIAL_COLORS } from '.';
import PreSolveVehicleSelectors from '../selectors/pre-solve-vehicle.selectors';
import { getVehicleStartingLocation, selectBounds } from '../selectors/map.selectors';

@Injectable({
  providedIn: 'root',
})
export class PdfDownloadService {
  apiRoot: string;

  constructor(private http: HttpClient, private store: Store) {
    this.store
      .pipe(select(fromConfig.selectStorageApi), take(1))
      .subscribe((api) => (this.apiRoot = api.apiRoot));
  }

  getStaticMaps(
    routes: DeckGLRoute[],
    visitRequests: VisitRequest[]
  ): Observable<{ map: string; routeId: number }[]> {
    return combineLatest([
      // Workaround to get around the 6 observable limit of combineLatest
      combineLatest([
        this.mapParametersToStaticMapParameters(),
        this.store.select(fromConfig.selectMapApiKey),
        this.store.select(PreSolveVehicleSelectors.selectVehicles),
        this.getDepotIconUrl(),
        this.getPickupIconUrl(),
        this.getDropoffIconUrl(),
      ]),
      this.store.select(selectBounds),
    ]).pipe(
      mergeMap(([[style, apiKey, vehicles, depotIcon, pickupIcon, dropoffIcon], bounds]) => {
        return forkJoin(
          routes.map((route, index) => {
            const routeVisits = visitRequests.filter((vr) => route.visits.includes(vr.id));

            let path;
            let encodedPath;

            if (route.path) {
              path = simplifyPath(
                route.path.map((point) => new google.maps.LatLng(point[1], point[0]))
              );
              encodedPath = google.maps.geometry.encoding.encodePath(path);
            }

            const params: any = {
              key: apiKey,
              format: 'png',
              size: '600x320',
              scale: '2',
              style,
            };

            if (route.visits.length) {
              params.markers = [
                this.visitToDeliveries(
                  routeVisits.filter((vr) => !vr.pickup),
                  dropoffIcon
                ),
                this.visitsToPickups(
                  routeVisits.filter((vr) => vr.pickup),
                  pickupIcon
                ),
                this.getRouteStartMarker(route, vehicles, routeVisits, depotIcon),
                this.getRouteEndMarker(route, vehicles, routeVisits, depotIcon),
              ];
            } else {
              params.visible = `${bounds.getNorthEast().lat()},${bounds
                .getNorthEast()
                .lng()}|${bounds.getSouthWest().lat()},${bounds.getSouthWest().lng()}`;
            }

            if (encodedPath) {
              params.path = `color:${MATERIAL_COLORS.Blue.hex.replace(
                '#',
                '0x'
              )}FF|weight:2|enc:${encodedPath}`;
            }

            return of(true).pipe(
              // Slight delay to avoid going over the requests per minute quota
              delay(0.1 * index),
              mergeMap((_) => {
                if (path) {
                  return this.getVehicleIcon(path);
                }

                return of(null);
              }),
              map(
                (vehicleIcon) =>
                  vehicleIcon && params.markers.push(this.vehicleHeadingToIcon(vehicleIcon))
              ),
              mergeMap((_) =>
                this.http.get('https://maps.googleapis.com/maps/api/staticmap', {
                  params,
                  responseType: 'blob',
                })
              ),
              map((res) => ({ map: URL.createObjectURL(res), routeId: route.id }))
            );
          })
        );
      })
    );
  }

  private vehicleHeadingToIcon(vehicleIcon: { url: string; location: google.maps.LatLng }): string {
    return `icon:${
      vehicleIcon.url
    }|anchor:center|${vehicleIcon.location.lat()},${vehicleIcon.location.lng()}`;
  }

  private getVehicleIcon(
    path: google.maps.LatLng[]
  ): Observable<{ url: string; location: google.maps.LatLng }> {
    const location = getVehicleStartingLocation(path, 1000, []);
    // Convert returned range of -180,180 to 0,360
    const heading = Math.round(findPathHeadingAtPointOptimized(path, location) + 180);
    const url = this.apiRoot.replace('/api', `/assets/icons/route-heading/${heading}.png`);
    return of({ url, location });
  }

  private getDepotIconUrl(): Observable<string> {
    return of(this.apiRoot.replace('/api', '/assets/icons/depot/depot.png'));
  }

  private getPickupIconUrl(): Observable<string> {
    return of(this.apiRoot.replace('/api', '/assets/icons/pickup/pickup.png'));
  }

  private getDropoffIconUrl(): Observable<string> {
    return of(this.apiRoot.replace('/api', '/assets/icons/dropoff/dropoff.png'));
  }

  private getRouteStartMarker(
    route: DeckGLRoute,
    vehicles: Vehicle[],
    routeVisits: VisitRequest[],
    depotIcon: string
  ): string {
    const startVisit = routeVisits.find((vr) => vr.id === route.visits[0]);
    const start =
      vehicles[route.vehicleIndex || 0].startWaypoint?.location?.latLng ||
      startVisit.arrivalWaypoint?.location?.latLng;
    return `icon:${depotIcon}|anchor:center|` + start.latitude + ',' + start.longitude;
  }

  private getRouteEndMarker(
    route: DeckGLRoute,
    vehicles: Vehicle[],
    routeVisits: VisitRequest[],
    depotIcon: string
  ): string {
    const endVisit = routeVisits.find((vr) => vr.id === route.visits[route.visits.length - 1]);
    const end =
      vehicles[route.vehicleIndex || 0].endWaypoint?.location?.latLng ||
      endVisit.departureWaypoint?.location?.latLng ||
      endVisit.arrivalWaypoint?.location?.latLng;
    return `icon:${depotIcon}|anchor:center|` + end.latitude + ',' + end.longitude;
  }

  private mapParametersToStaticMapParameters(): Observable<string[]> {
    return this.store.select(fromConfig.selectMapOptions).pipe(
      map((options) => {
        return options.styles.map((style) => {
          const feature = `feature:${style.featureType || 'all'}|`;
          const element = style.elementType ? `element:${style.elementType}|` : '';
          const stylers = style.stylers
            .map((styler) => {
              const key = Object.keys(styler)[0];
              const value = styler[key].toString().replace('#', '0x');
              return `${key}:${value}`;
            })
            .join('|');
          return feature + element + stylers;
        });
      })
    );
  }

  private visitToDeliveries(visits: VisitRequest[], icon: string): string {
    return (
      `icon:${icon}|anchor:center|` +
      visits
        .map(
          (visit) =>
            visit.arrivalWaypoint?.location?.latLng?.latitude +
            ',' +
            visit.arrivalWaypoint?.location?.latLng?.longitude
        )
        .join('|')
    );
  }

  private visitsToPickups(visits: VisitRequest[], icon: string): string {
    return (
      `icon:${icon}|anchor:center|` +
      visits
        .map(
          (visit) =>
            visit.arrivalWaypoint?.location?.latLng?.latitude +
            ',' +
            visit.arrivalWaypoint?.location?.latLng?.longitude
        )
        .join('|')
    );
  }
}
