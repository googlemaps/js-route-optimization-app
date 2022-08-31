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
import { BaseShipmentsTableComponent } from './components';
import { ShipmentsComponent } from './containers';
import { ShipmentsRoutingModule } from './shipments-routing.module';

export const COMPONENTS = [BaseShipmentsTableComponent];

export const CONTAINERS = [ShipmentsComponent];

@NgModule({
  declarations: [COMPONENTS, CONTAINERS],
  imports: [CommonModule, MaterialModule, ShipmentsRoutingModule, SharedModule],
})
export class ShipmentsModule {}
