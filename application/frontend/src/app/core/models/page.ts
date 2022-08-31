/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

/**
 * @remarks
 * Page values should be consistent with their route path.
 * Undo/redo uses this convention to navigate between pages.
 */
export enum Page {
  Welcome = 'welcome',
  Shipments = 'shipments',
  Vehicles = 'vehicles',
  VehicleOperators = 'vehicleOperators',
  RoutesChart = 'routesChart',
  RoutesMetadata = 'routesMetadata',
  ShipmentsMetadata = 'shipmentsMetadata',
}
