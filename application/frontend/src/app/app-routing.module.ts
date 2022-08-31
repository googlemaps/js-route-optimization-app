/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';

/**
 * Routing is treated as an implementation detail where all
 * location changes are skipped.  If routing locations were to
 * be exposed, guards should be implemented and any effects that
 * interact with guarded navigation should implement success/failure
 * actions so that reducers can respond appropriately.
 */
const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./welcome/welcome.module').then((m) => m.WelcomeModule),
  },
  {
    path: 'vehicles',
    loadChildren: () => import('./vehicles/vehicles.module').then((m) => m.VehiclesModule),
  },
  {
    path: 'shipments',
    loadChildren: () => import('./shipments/shipments.module').then((m) => m.ShipmentsModule),
  },
  {
    path: 'vehicleOperators',
    loadChildren: () =>
      import('./vehicle-operators/vehicle-operators.module').then((m) => m.VehicleOperatorsModule),
  },
  {
    path: 'routesChart',
    loadChildren: () =>
      import('./routes-chart/routes-chart.module').then((m) => m.RoutesChartModule),
  },
  {
    path: 'routesMetadata',
    loadChildren: () =>
      import('./routes-metadata/routes-metadata.module').then((m) => m.RoutesMetadataModule),
  },
  {
    path: 'shipmentsMetadata',
    loadChildren: () =>
      import('./shipments-metadata/shipments-metadata.module').then(
        (m) => m.ShipmentsMetadataModule
      ),
  },
  {
    path: '**',
    redirectTo: '/',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
