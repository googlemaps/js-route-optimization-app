/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Use of this source code is governed by an MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { getCapacityQuantityUnit, getUnitAbbreviation } from 'src/app/util';

@Pipe({ name: 'capacityQuantityUnit' })
export class CapacityQuantityUnitPipe implements PipeTransform {
  transform(type: string, abbreviations?: { [unit: string]: string }): string {
    const unit = getCapacityQuantityUnit(type);
    return getUnitAbbreviation(unit, abbreviations);
  }
}
