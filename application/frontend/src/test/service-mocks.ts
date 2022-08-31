/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { EMPTY, Observable, of } from 'rxjs';
import { DeckGLRoute, VisitRequest } from 'src/app/core/models';
import { MockMap } from './google-maps-mocks';

export class MockInfoWindowService {
  constructor() {}
  clear = () => {};
}

export class MockLayerService {
  constructor() {}
  show = () => {};
  hide = () => {};
}

export class MockMarkersLayerService {
  constructor() {}
  bounds$ = EMPTY;
  dragEnd$ = EMPTY;
  edit$ = EMPTY;
  show = () => {};
  hide = () => {};
  reset = () => {};
}

export class MockFormVisitRequestLayerService extends MockMarkersLayerService {
  click$ = EMPTY;
  setStrokeColor = () => {};
  reset = () => {};
}

export class MockMapService {
  constructor() {
    this.map = new MockMap();
  }
  map: MockMap;
  bounds$ = EMPTY;
  initMap = (
    mapHtmlElement: HTMLElement,
    options: google.maps.MapOptions
  ): Observable<google.maps.Map> => EMPTY;
  initViewDefault = (center?: google.maps.LatLngLiteral): Observable<google.maps.LatLngLiteral> =>
    EMPTY;
  setBounds = (bounds: google.maps.LatLngBounds): void => {};
  updateBounds = () => {};
}

export class MockStorageApiService {
  constructor() {}

  search(searchScenarios = true, startsWith?: string, pageToken?: string, maxResults = 100) {}
  loadFile(filename: string, isScenario = true) {}
  saveFile(data: any, filename: string, isScenario = true) {}
  exists(filename: string, isScenario = true) {}
  deleteFile(filename: string, isScenario = true) {}
}

export class MockPdfDownloadService {
  constructor() {}

  getStaticMaps(routes: DeckGLRoute[], visitRequests: VisitRequest[]) {}
}
