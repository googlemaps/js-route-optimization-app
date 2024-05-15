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
