/*
Copyright 2026 Google LLC

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

import { Component, effect, ElementRef, inject, Injector, OnInit, ViewChild } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { importLibrary, setOptions } from '@googlemaps/js-api-loader';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Observable, of, shareReplay } from 'rxjs';
import { IShipment, IShipmentRoute, IVisit } from '../../../models/ro';
import { APP_CONFIG } from '../../../models/tokens';
import { ChatStore } from '../../../services/data-access/chat-store';
import {
  DEPOT_MARKER,
  MATERIAL_COLORS,
  MATERIAL_COLORS_SELECTED,
  MaterialColor,
  PICKUP_MARKER,
  VISIT_MARKER,
} from '../../../util/map-style';
import { wrapIndex } from '../../../util/number';
import { ResultMetrics } from '../result-metrics/result-metrics';

@Component({
  selector: 'app-map',
  imports: [ResultMetrics, MatButton],
  templateUrl: './map.html',
  styleUrl: './map.scss',
})
export class Map implements OnInit {
  @ViewChild('mapOutlet') mapOutlet!: ElementRef<HTMLDivElement>;

  private injector = inject(Injector);
  private clusterer!: MarkerClusterer;
  private locationTotals: Record<string, number> = {};
  private locationCurrentIndex: Record<string, number> = {};

  config = this.injector.get(APP_CONFIG);
  protected chatStore = inject(ChatStore);

  map!: google.maps.Map;
  mapMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
  mapRoutes: google.maps.Polyline[] = [];

  private readonly currentPosition$ = navigator?.geolocation
    ? new Observable<google.maps.LatLngLiteral | null>(observer =>
        navigator.geolocation.getCurrentPosition(
          pos => {
            observer.next({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            observer.complete();
          },
          _ => {
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
    : of(null);

  constructor() {
    effect(() => {
      const request = this.chatStore.optimizeRequest();
      const response = this.chatStore.optimizeResponse();

      if (!this.map || !this.clusterer) {
        return;
      }

      this.clearContents();

      this.mapPreSolveVehicles();

      if (request && response) {
        this.mapResponseData();
      } else {
        this.mapPreSolveShipments();
      }

      this.updateMapBounds();
    });
  }

  async ngOnInit(): Promise<void> {
    setOptions({ key: this.config.mapsApiKey });

    await importLibrary('maps');
    await importLibrary('marker');
    await importLibrary('geometry');

    this.map = new google.maps.Map(this.mapOutlet.nativeElement, {
      mapId: this.config.mapId,
      center: { lat: 0, lng: 0 },
      zoom: 2,
      fullscreenControl: false,
      mapTypeControl: false,
      zoomControl: false,
      streetViewControl: false,
      cameraControl: false,
    });

    this.currentPosition$.subscribe(pos => {
      if (pos) {
        this.map.setCenter(pos);
        this.map.setZoom(12);
      }
    });

    if (!this.clusterer) {
      this.clusterer = new MarkerClusterer({
        map: this.map,
        algorithm: new SuperClusterAlgorithm({ maxZoom: 15 }),
      });
    }
  }

  private getVisitLocation(visit: IVisit, shipments: IShipment[]): { lat: number; lng: number } {
    const shipment = shipments[visit.shipmentIndex || 0];
    if (visit.isPickup) {
      const pickup = shipment.pickups![visit.visitRequestIndex || 0];
      return {
        lat:
          pickup.arrivalWaypoint?.location?.latLng?.latitude || pickup.arrivalLocation!.latitude!,
        lng:
          pickup.arrivalWaypoint?.location?.latLng?.longitude || pickup.arrivalLocation!.longitude!,
      };
    } else {
      const delivery = shipment.deliveries![visit.visitRequestIndex || 0];
      return {
        lat:
          delivery.arrivalWaypoint?.location?.latLng?.latitude ||
          delivery.arrivalLocation!.latitude!,
        lng:
          delivery.arrivalWaypoint?.location?.latLng?.longitude ||
          delivery.arrivalLocation!.longitude!,
      };
    }
  }

  private getLocationKey(lat: number, lng: number): string {
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  }

  showGenerateButton(): boolean {
    return (
      this.map &&
      !!this.chatStore.optimizeRequest() &&
      !!this.chatStore.optimizeResponse() &&
      !this.mapRoutes.length
    );
  }

  generatePolylines(): void {
    this.chatStore.refreshRoutes();
  }

  clearContents(): void {
    this.mapMarkers.forEach(marker => (marker.map = null));
    this.mapMarkers = [];

    this.mapRoutes.forEach(route => route.setMap(null));
    this.mapRoutes = [];

    if (this.clusterer) {
      this.clusterer.clearMarkers();
    }
  }

  updateMapBounds(): void {
    const bounds = new google.maps.LatLngBounds();

    if (this.mapMarkers.length) {
      this.mapMarkers.forEach(marker => {
        bounds.extend(marker.position!);
      });
    }

    if (this.mapRoutes.length) {
      this.mapRoutes.forEach(route => {
        route.getPath().forEach(point => {
          bounds.extend(point);
        });
      });
    }

    if (bounds.isEmpty()) {
      return;
    }

    this.map.fitBounds(bounds);
  }

  mapPreSolveShipments(): void {
    this.chatStore.optimizeRequest()?.model?.shipments?.forEach(shipment => {
      shipment.pickups?.forEach(pickup => {
        if (!pickup.arrivalLocation && !pickup.arrivalWaypoint?.location?.latLng) {
          return;
        }

        this.drawPreSolveShipmentMarker(
          new google.maps.LatLng({
            lat:
              pickup.arrivalWaypoint?.location?.latLng?.latitude ||
              pickup.arrivalLocation!.latitude!,
            lng:
              pickup.arrivalWaypoint?.location?.latLng?.longitude ||
              pickup.arrivalLocation!.longitude!,
          })
        );
      });

      shipment.deliveries?.forEach(delivery => {
        if (!delivery.arrivalLocation && !delivery.arrivalWaypoint?.location?.latLng) {
          return;
        }

        this.drawPreSolveShipmentMarker(
          new google.maps.LatLng({
            lat:
              delivery.arrivalWaypoint?.location?.latLng?.latitude ||
              delivery.arrivalLocation!.latitude!,
            lng:
              delivery.arrivalWaypoint?.location?.latLng?.longitude ||
              delivery.arrivalLocation!.longitude!,
          }),
          false
        );
      });
    });
  }

  mapPreSolveVehicles(): void {
    this.chatStore.optimizeRequest()?.model?.vehicles?.forEach(vehicle => {
      if (vehicle.startLocation) {
        const div = document.createElement('div');
        div.classList.add('vehicle-icon');
        div.innerHTML = DEPOT_MARKER;

        this.drawMarker(
          div,
          new google.maps.LatLng({
            lat: vehicle.startLocation.latitude!,
            lng: vehicle.startLocation.longitude!,
          })
        );
      }
    });
  }

  mapResponseData(): void {
    const request = this.chatStore.optimizeRequest();
    const response = this.chatStore.optimizeResponse();
    this.locationTotals = {};
    this.locationCurrentIndex = {};

    // Count every visit in the response across all routes
    response?.routes.forEach(route => {
      route.visits?.forEach(visit => {
        const loc = this.getVisitLocation(visit, request!.model!.shipments!);
        const key = `${loc.lat.toFixed(6)},${loc.lng.toFixed(6)}`;

        this.locationTotals[key] = (this.locationTotals[key] || 0) + 1;

        if (this.locationCurrentIndex[key] === undefined) {
          this.locationCurrentIndex[key] = 0;
        }
      });
    });

    response?.skippedShipments.forEach(shipment => {
      const shipmentRequest = request!.model!.shipments![shipment.index!];
      if (shipmentRequest.pickups?.length) {
        const pickup = shipmentRequest.pickups[0];
        this.drawPreSolveShipmentMarker(
          new google.maps.LatLng({
            lat:
              pickup.arrivalWaypoint?.location?.latLng?.latitude ||
              pickup.arrivalLocation!.latitude!,
            lng:
              pickup.arrivalWaypoint?.location?.latLng?.longitude ||
              pickup.arrivalLocation!.longitude!,
          }),
          true,
          MATERIAL_COLORS['BlueGrey'].hex
        );
      } else if (shipmentRequest.deliveries?.length) {
        const delivery = shipmentRequest.deliveries[0];
        this.drawPreSolveShipmentMarker(
          new google.maps.LatLng({
            lat:
              delivery.arrivalWaypoint?.location?.latLng?.latitude ||
              delivery.arrivalLocation!.latitude!,
            lng:
              delivery.arrivalWaypoint?.location?.latLng?.longitude ||
              delivery.arrivalLocation!.longitude!,
          }),
          false,
          MATERIAL_COLORS['BlueGrey'].hex
        );
      }
    });

    response?.routes.forEach((route, i) => {
      const color = MATERIAL_COLORS_SELECTED[wrapIndex(i, MATERIAL_COLORS_SELECTED.length)];

      if (route.routePolyline?.points) {
        this.mapEncodedRoutePolyline(route.routePolyline.points, color);
      }

      this.mapVisitsForRoute(route, request?.model?.shipments || [], color);
    });
  }

  /**
   * Calculates a position offset in a circular pattern for overlapping points.
   * @param originalLat The shared latitude
   * @param originalLng The shared longitude
   * @param index The index of this marker in the group (0, 1, 2...)
   * @param total The total number of markers at this location
   */
  getJitteredPosition(
    originalLat: number,
    originalLng: number,
    index: number,
    total: number
  ): google.maps.LatLng {
    if (total <= 1) {
      return new google.maps.LatLng(originalLat, originalLng);
    }

    // Radius of the "spider" circle (approx 10-15 meters)
    const radius = 0.00015;

    // Calculate angle: (360 degrees / count) * index
    const angle = (index / total) * (2 * Math.PI);

    // Math.cos for Latitude offset, Math.sin for Longitude offset
    const latOffset = radius * Math.cos(angle);
    const lngOffset = radius * Math.sin(angle);

    return new google.maps.LatLng({
      lat: originalLat + latOffset,
      lng: originalLng + lngOffset,
    });
  }

  mapVisitsForRoute(route: IShipmentRoute, shipments: IShipment[], color: MaterialColor): void {
    const newMarkers: google.maps.marker.AdvancedMarkerElement[] = [];

    route.visits?.forEach((visit, i) => {
      const loc = this.getVisitLocation(visit, shipments);
      const key = this.getLocationKey(loc.lat, loc.lng);

      const totalAtLocation = this.locationTotals[key] || 1;
      const myIndex = this.locationCurrentIndex[key];

      // Increment the index so the next visit gets the next spot
      this.locationCurrentIndex[key]++;

      const div = document.createElement('div');
      const svg = document.createElement('div');
      svg.classList.add('request-icon');
      svg.innerHTML = VISIT_MARKER;
      svg.style.stroke = color.hex;
      svg.style.fill = color.hex;
      div.appendChild(svg);

      const visitNumber = document.createElement('div');
      visitNumber.innerText = `${i + 1}`;
      visitNumber.classList.add('visit-icon-label');
      div.appendChild(visitNumber);

      let title = 'Pickup';

      if (!visit.isPickup) {
        svg.classList.add('request-icon-delivery');
        title = 'Delivery';
      }

      const pos = this.getJitteredPosition(loc.lat, loc.lng, myIndex, totalAtLocation);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        position: pos,
        content: div,
        title: `${title} ${i + 1}`,
      });

      this.mapMarkers.push(marker);
      newMarkers.push(marker);
    });

    this.clusterer.addMarkers(newMarkers);
  }

  mapEncodedRoutePolyline(path: string, colorEntry: MaterialColor): void {
    const decoded = google.maps.geometry.encoding.decodePath(path);

    const lineStroke = new google.maps.Polyline({
      map: this.map,
      path: decoded,
      geodesic: true,
      strokeColor: colorEntry.strokeHex,
      strokeWeight: 6,
    });
    const lineFill = new google.maps.Polyline({
      map: this.map,
      path: decoded,
      geodesic: true,
      strokeColor: colorEntry.hex,
      strokeWeight: 3,
    });

    this.mapRoutes.push(lineStroke);
    this.mapRoutes.push(lineFill);
  }

  drawPreSolveShipmentMarker(
    position: google.maps.LatLng,
    isPickup = true,
    colorOverride?: string
  ): void {
    const div = document.createElement('div');
    div.classList.add('request-icon');
    if (!isPickup) {
      div.classList.add('request-icon-delivery');
    }
    if (colorOverride) {
      div.style.stroke = colorOverride;
    }

    div.innerHTML = PICKUP_MARKER;

    this.drawMarker(div, position);
  }

  drawMarker(contents: Element, position: google.maps.LatLng): void {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      content: contents,
      map: this.map,
      position,
    });

    this.mapMarkers.push(marker);
  }
}
