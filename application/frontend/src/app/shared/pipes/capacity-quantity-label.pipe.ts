/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { getCapacityQuantityRoot } from 'src/app/util';

@Pipe({ name: 'capacityQuantityLabel' })
export class CapacityQuantityLabelPipe implements PipeTransform {
  transform(type: string, capitalizeFirst = true): string {
    const label = getCapacityQuantityRoot(type);
    if (label) {
      return capitalizeFirst ? label[0].toUpperCase() + label.substring(1) : label;
    }
  }
}
