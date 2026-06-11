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
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { TerraDraw, TerraDrawRectangleMode, TerraDrawPolygonMode, HexColor } from 'terra-draw';
import { TerraDrawGoogleMapsAdapter } from 'terra-draw-google-maps-adapter';
import { Feature, Polygon } from '@turf/helpers';
import { SelectionMode } from '../models';
import { MATERIAL_COLORS } from './map-theme.service';

/**
 * Manages TerraDraw drawing tools for map selection.
 */
@Injectable({ providedIn: 'root' })
export class TerraDrawService {
  private draw: TerraDraw | null = null;
  private projectionListener: google.maps.MapsEventListener | null = null;
  private readonly ready$ = new BehaviorSubject<boolean>(false);
  private readonly featureComplete$ = new Subject<Feature<Polygon>>();

  readonly onFeatureComplete$: Observable<Feature<Polygon>> = this.featureComplete$.asObservable();
  readonly onReady$: Observable<boolean> = this.ready$.pipe(
    filter((ready) => ready),
    take(1)
  );

  get isReady(): boolean {
    return this.ready$.getValue();
  }

  constructor(private zone: NgZone) {}

  initialize(map: google.maps.Map, mapElement: HTMLElement): void {
    if (this.draw) {
      this.destroy();
    }

    // Required by TerraDraw Google Maps adapter
    const mapContainer = map.getDiv();
    if (!mapContainer.id) {
      mapContainer.id = 'terra-draw-map-container';
    }

    // Wait for projection before creating TerraDraw (Google Maps adapter requirement)
    if (map.getProjection()) {
      this.initializeTerraDraw(map);
    } else {
      this.projectionListener = map.addListener('projection_changed', () => {
        this.projectionListener?.remove();
        this.projectionListener = null;
        this.initializeTerraDraw(map);
      });
    }
  }

  private initializeTerraDraw(map: google.maps.Map): void {
    const strokeColor = MATERIAL_COLORS.Red.hex as HexColor;

    const rectangleMode = new TerraDrawRectangleMode({
      styles: {
        fillColor: '#ffffff' as HexColor,
        fillOpacity: 0,
        outlineColor: strokeColor,
        outlineWidth: 2,
      },
    });

    const polygonMode = new TerraDrawPolygonMode({
      styles: {
        fillColor: '#ffffff' as HexColor,
        fillOpacity: 0,
        outlineColor: strokeColor,
        outlineWidth: 2,
        closingPointColor: strokeColor,
        closingPointWidth: 6,
        closingPointOutlineColor: '#ffffff' as HexColor,
        closingPointOutlineWidth: 2,
      },
    });

    // Create TerraDraw instance with Google Maps adapter
    this.draw = new TerraDraw({
      adapter: new TerraDrawGoogleMapsAdapter({
        lib: google.maps,
        map,
        coordinatePrecision: 9,
      }),
      modes: [rectangleMode, polygonMode],
    });

    this.draw.start();

    this.draw.on('ready', () => {
      this.zone.run(() => {
        this.ready$.next(true);
      });
    });

    this.draw.on('finish', (id: string, context: { action: string; mode: string }) => {
      if (context.action === 'draw') {
        const snapshot = this.draw.getSnapshot();
        const feature = snapshot.find((f) => f.id === id);

        if (feature && feature.geometry.type === 'Polygon') {
          this.zone.run(() => {
            this.featureComplete$.next(feature as Feature<Polygon>);
            this.draw.removeFeatures([id]);
          });
        }
      }
    });
  }

  setMode(mode: SelectionMode): void {
    if (!this.draw || !this.isReady) {
      return;
    }

    switch (mode) {
      case SelectionMode.Bbox:
        this.draw.setMode('rectangle');
        break;
      case SelectionMode.Polygon:
        this.draw.setMode('polygon');
        break;
      case SelectionMode.Off:
      default:
        this.draw.setMode('static');
        break;
    }
  }

  destroy(): void {
    if (this.projectionListener) {
      this.projectionListener.remove();
      this.projectionListener = null;
    }
    if (this.draw) {
      this.draw.stop();
      this.draw = null;
      this.ready$.next(false);
    }
  }
}
