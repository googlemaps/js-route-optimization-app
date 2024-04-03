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
