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
import { MaterialModule } from '../material';
import { SharedModule } from '../shared/shared.module';
import { BaseVehiclesTableComponent } from './components';
import { VehiclesComponent } from './containers';
import { VehiclesRoutingModule } from './vehicles-routing.module';

export const COMPONENTS = [BaseVehiclesTableComponent];

export const CONTAINERS = [VehiclesComponent];

@NgModule({
  declarations: [COMPONENTS, CONTAINERS],
  imports: [CommonModule, MaterialModule, VehiclesRoutingModule, SharedModule],
})
export class VehiclesModule {}
