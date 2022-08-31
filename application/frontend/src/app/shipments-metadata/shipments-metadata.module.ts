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
import { BaseShipmentsMetadataTableComponent } from './components';
import { ShipmentsMetadataTableComponent } from './containers';
import { ShipmentsMetadataRoutingModule } from './shipments-metadata-routing.module';

export const COMPONENTS = [BaseShipmentsMetadataTableComponent];

export const CONTAINERS = [ShipmentsMetadataTableComponent];

@NgModule({
  declarations: [COMPONENTS, CONTAINERS],
  imports: [CommonModule, SharedModule, MaterialModule, ShipmentsMetadataRoutingModule],
})
export class ShipmentsMetadataModule {}
