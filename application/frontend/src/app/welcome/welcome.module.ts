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
import { CoreModule } from '../core';
import { MaterialModule } from '../material';
import { WelcomePageComponent } from './containers';
import { WelcomeRoutingModule } from './welcome-routing.module';

@NgModule({
  declarations: [WelcomePageComponent],
  imports: [CommonModule, MaterialModule, CoreModule, WelcomeRoutingModule],
})
export class WelcomeModule {}
