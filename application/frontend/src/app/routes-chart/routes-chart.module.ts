/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { CoreModule } from '../core';
import { PointOfInterestDragComponent } from '../core/containers';
import { MaterialModule } from '../material';
import { SharedModule } from '../shared/shared.module';
import {
  BaseRoutesChartComponent,
  BaseRoutesRowColumnHeaderComponent,
  BaseRoutesRowComponent,
} from './components';
import {
  RoutesChartComponent,
  RoutesRowColumnHeaderComponent,
  RoutesRowComponent,
} from './containers';
import { RoutesChartRoutingModule } from './routes-chart-routing.module';
import { RoutesPaginatorIntl } from './routes-paginator-intl';

export const COMPONENTS = [
  BaseRoutesChartComponent,
  BaseRoutesRowColumnHeaderComponent,
  BaseRoutesRowComponent,
];

export const CONTAINERS = [
  PointOfInterestDragComponent,
  RoutesChartComponent,
  RoutesRowColumnHeaderComponent,
  RoutesRowComponent,
];

@NgModule({
  declarations: [CONTAINERS, COMPONENTS],
  imports: [CommonModule, MaterialModule, RoutesChartRoutingModule, CoreModule, SharedModule],
  providers: [
    {
      provide: MatPaginatorIntl,
      useClass: RoutesPaginatorIntl,
    },
  ],
})
export class RoutesChartModule {}
