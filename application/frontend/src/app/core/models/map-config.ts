/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface MapConfig {
  apiKey: string;
  symbols?: SymbolConfig;
  options?: google.maps.MapOptions;
}

export interface SymbolConfig {
  depot?: google.maps.Icon;
}

export enum SelectionMode {
  Off,
  Bbox,
  Polygon,
}
