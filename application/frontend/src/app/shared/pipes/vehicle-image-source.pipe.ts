/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';

/**
 * Returns vehicle image source
 */
@Pipe({ name: 'vehicleImageSource' })
export class VehicleImageSourcePipe implements PipeTransform {
  transform(): string {
    return './assets/images/vehicle.png';
  }
}
