/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, NgZone, RendererFactory2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, first, map, shareReplay } from 'rxjs/operators';
import * as fromRoot from 'src/app/reducers';
import { MapConfig } from '../models';
import * as fromMapApi from '../selectors/map-api.selectors';
import { WindowService } from './window.service';

/**
 * Responsible for Google Maps JavaScript API deferred script load
 * and map initialization.
 *
 * @remarks
 * Script load is deferred until the app config is loaded for the
 * purpose of defining the end-point and API key.
 *
 * The app initializer waits for this script load to complete before
 * initialization is complete.  This is to allow immediate access to
 * the map instance.
 */
@Injectable({
  providedIn: 'root',
})
export class MapApiService {
  private scriptLoaded$: Observable<boolean>;

  constructor(
    store: Store<fromRoot.State>,
    private rendererFactory: RendererFactory2,
    @Inject(DOCUMENT) private document: Document,
    private windowService: WindowService,
    private zone: NgZone
  ) {
    this.scriptLoaded$ = store.select(fromMapApi.selectScriptLoaded).pipe(
      filter((loaded) => loaded),
      first(),
      shareReplay(1)
    );
  }

  initMap(
    mapHtmlElement: HTMLElement,
    options: google.maps.MapOptions
  ): Observable<google.maps.Map> {
    return this.scriptLoaded$.pipe(
      map(() => this.zone.runOutsideAngular(() => new google.maps.Map(mapHtmlElement, options))),
      shareReplay(1)
    );
  }

  loadScript(config: MapConfig): Observable<void> {
    return new Observable<void>((observer) => {
      const callbackName = 'initMaps';
      const window = this.windowService.nativeWindow;
      const renderer = this.rendererFactory.createRenderer(null, null);
      const script: HTMLScriptElement = renderer.createElement('script');
      script.src = this.getScriptSource(config, callbackName);
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      window[callbackName] = () => {
        observer.next();
        observer.complete();
      };
      script.onerror = (error) => {
        observer.error(error);
      };

      renderer.appendChild(this.document.body, script);
      return () => {
        delete window[callbackName];
      };
    });
  }

  private getScriptSource(config: MapConfig, callbackName: string): string {
    return `https://maps.googleapis.com/maps/api/js?key=${config.apiKey}&libraries=geometry,places,drawing&callback=${callbackName}`;
  }
}
