/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ICapacityQuantity } from 'src/app/core/models';

@Pipe({ name: 'capacityQuantitiesHasValue' })
export class CapacityQuantitiesHasValuePipe implements PipeTransform {
  transform(capacityQuantities: ICapacityQuantity[]): boolean {
    return Array.isArray(capacityQuantities) && capacityQuantities.some((c) => c.value != null);
  }
}
