/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

export interface ShipmentsKpis {
  total: number;
  selected: number;
  demands: {
    type: string;
    selected: number;
    total: number;
  }[];
}

export interface VehiclesKpis {
  total: number;
  selected: number;
  capacities: {
    type: string;
    selected: number;
    total: number;
  }[];
}

export interface VehicleOperatorsKpis {
  total: number;
  selected: number;
}
