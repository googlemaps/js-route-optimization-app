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
import { BaseVehicleOperatorsTableComponent } from './components';
import { VehicleOperatorsComponent } from './containers';
import { VehicleOperatorsRoutingModule } from './vehicle-operators-routing.module';

export const COMPONENTS = [BaseVehicleOperatorsTableComponent];

export const CONTAINERS = [VehicleOperatorsComponent];

@NgModule({
  declarations: [COMPONENTS, CONTAINERS],
  imports: [CommonModule, MaterialModule, VehicleOperatorsRoutingModule, SharedModule],
})
export class VehicleOperatorsModule {}
